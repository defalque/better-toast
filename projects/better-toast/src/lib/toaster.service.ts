import { Injectable, signal } from '@angular/core';

import type { Type } from '@angular/core';

import type {
  HeadlessToastOptions,
  ToastActionMethodOptions,
  ToastCancelMethodOptions,
  ToastPromiseLabels,
  ToastOptions,
  ToastVariant,
  ToasterDuration,
  ToasterItem,
} from './toaster.types';

/** Fallback when `<app-toaster [duration]>` is absent and a helper omits `durationMs`. */
export const DEFAULT_TOAST_DURATION_MS = 4000;

/** Default label for {@link ToasterService.action} when {@link ToastMethodButtonConfig.label} is omitted. */
export const DEFAULT_TOAST_ACTION_LABEL = 'Action';

/** Default label for {@link ToasterService.cancel} when {@link ToastMethodButtonConfig.label} is omitted. */
export const DEFAULT_TOAST_CANCEL_LABEL = 'Cancel';

/**
 * Use with `[duration]` or `options.durationMs` so a toast stays until manually dismissed.
 * (`0` is still treated as non-auto-dismiss for backward compatibility.)
 */
export const TOAST_DURATION_MANUAL_DISMISS = Number.POSITIVE_INFINITY;

/** Coerces {@link ToasterDuration} to ms (only the literal string `"Infinity"` for manual dismiss). */
export function parseToasterDurationMs(value: ToasterDuration): number {
  if (value === 'Infinity') {
    return TOAST_DURATION_MANUAL_DISMISS;
  }
  if (Number.isNaN(value)) {
    return DEFAULT_TOAST_DURATION_MS;
  }
  return value;
}

function shouldScheduleAutoDismiss(durationMs: number): boolean {
  return Number.isFinite(durationMs) && durationMs > 0;
}

type AutoDismissState =
  | { kind: 'scheduled'; timer: ReturnType<typeof globalThis.setTimeout>; deadline: number }
  | { kind: 'paused'; remainingMs: number };

type ResolvedToastDuration = {
  durationMs: number;
  syncWithInitialToasterDefault: boolean;
};

@Injectable({ providedIn: 'root' })
export class ToasterService {
  private readonly _toasts = signal<readonly ToasterItem[]>([]);

  private readonly autoDismissByToastId = new Map<string, AutoDismissState>();
  private readonly pendingInitialDefaultSyncByToastId = new Map<string, number>();

  private defaultDurationMs = DEFAULT_TOAST_DURATION_MS;
  private hasRegisteredToasterDefault = false;

  /** Active messages, oldest first. */
  readonly toasts = this._toasts.asReadonly();

  /** Synced from `Toaster` `[duration]`; used when a helper omits its `durationMs` argument. */
  setDefaultDurationMs(ms: number): void {
    const normalizedMs = Number.isNaN(ms) ? DEFAULT_TOAST_DURATION_MS : Math.max(0, ms);
    this.defaultDurationMs = normalizedMs;
    if (this.hasRegisteredToasterDefault) {
      return;
    }
    this.hasRegisteredToasterDefault = true;
    this.syncPendingInitialDefaultDurations(normalizedMs);
  }

  private resolveDuration(durationMs: ToasterDuration | undefined): ResolvedToastDuration {
    if (durationMs !== undefined) {
      return {
        durationMs: parseToasterDurationMs(durationMs),
        syncWithInitialToasterDefault: false,
      };
    }
    return {
      durationMs: this.defaultDurationMs,
      syncWithInitialToasterDefault: !this.hasRegisteredToasterDefault,
    };
  }

  /** Cancels any auto-dismiss timer for a toast. */
  private cancelAutoDismiss(id: string): void {
    const state = this.autoDismissByToastId.get(id);
    this.pendingInitialDefaultSyncByToastId.delete(id);
    if (!state) {
      return;
    }
    if (state.kind === 'scheduled') {
      globalThis.clearTimeout(state.timer);
    }
    this.autoDismissByToastId.delete(id);
  }

  /** Schedules auto-dismiss for a toast. */
  private scheduleAutoDismiss(id: string, durationMs: number): void {
    this.cancelAutoDismiss(id);
    if (!shouldScheduleAutoDismiss(durationMs)) {
      return;
    }
    const deadline = Date.now() + durationMs;
    const timer = globalThis.setTimeout(() => {
      this.removeToast(id, 'auto');
    }, durationMs);
    this.autoDismissByToastId.set(id, { kind: 'scheduled', timer, deadline });
  }

  private scheduleResolvedAutoDismiss(id: string, duration: ResolvedToastDuration): void {
    this.scheduleAutoDismiss(id, duration.durationMs);
    if (duration.syncWithInitialToasterDefault) {
      this.pendingInitialDefaultSyncByToastId.set(id, Date.now());
    }
  }

  private syncPendingInitialDefaultDurations(durationMs: number): void {
    const pendingEntries = [...this.pendingInitialDefaultSyncByToastId.entries()];
    this.pendingInitialDefaultSyncByToastId.clear();
    for (const [id, createdAt] of pendingEntries) {
      const toastStillExists = this._toasts().some((toast) => toast.id === id);
      if (!toastStillExists) {
        continue;
      }
      if (!shouldScheduleAutoDismiss(durationMs)) {
        this.scheduleAutoDismiss(id, durationMs);
        continue;
      }
      const elapsedMs = Math.max(0, Date.now() - createdAt);
      const remainingMs = Math.max(0, durationMs - elapsedMs);
      if (remainingMs === 0) {
        this.removeToast(id, 'auto');
        continue;
      }
      this.scheduleAutoDismiss(id, remainingMs);
    }
  }

  /**
   * Pauses the auto-dismiss timer while the pointer is over the toast (e.g. hover).
   * No-op if the toast has no active auto-dismiss.
   */
  pauseAutoDismiss(id: string): void {
    const state = this.autoDismissByToastId.get(id);
    if (!state || state.kind !== 'scheduled') {
      return;
    }
    globalThis.clearTimeout(state.timer);
    const remainingMs = Math.max(0, state.deadline - Date.now());
    this.autoDismissByToastId.set(id, { kind: 'paused', remainingMs });
  }

  /**
   * Resumes a paused auto-dismiss with the remaining time from {@link pauseAutoDismiss}.
   */
  resumeAutoDismiss(id: string): void {
    const state = this.autoDismissByToastId.get(id);
    if (!state || state.kind !== 'paused') {
      return;
    }
    const { remainingMs } = state;
    this.autoDismissByToastId.delete(id);
    if (remainingMs <= 0) {
      this.removeToast(id, 'auto');
      return;
    }
    this.scheduleAutoDismiss(id, remainingMs);
  }

  /**
   * Display a neutral (default) toast notification.
   *
   * If `options` or `options.durationMs` are not provided, the toast will use the duration value from `<app-toaster [duration]>`.
   * If no `[duration]` is set in the toaster, it falls back to {@link DEFAULT_TOAST_DURATION_MS}.
   *
   * @param message The toast content.
   * @param options Optional configuration (icon, custom duration, etc).
   * @returns The toast ID, useful for programmatic dismissal.
   */
  show(message: string, options?: ToastOptions): string {
    return this.add(message, 'default', this.resolveDuration(options?.durationMs), options);
  }

  /**
   * Display a toast using the **`description`** variant: same neutral chrome as **`default`** (icon rules, colors).
   * The message is the title; pass {@link ToastOptions.description} for a secondary line. You can also pass
   * `description` on `show` / `success` / etc. to get the column layout with that variant’s icon and styling.
   *
   * @param message Title line.
   * @param options Optional configuration (including `description` for the body below the title).
   */
  description(message: string, options?: ToastOptions): string {
    return this.add(message, 'description', this.resolveDuration(options?.durationMs), options);
  }

  /**
   * Display a success toast notification.
   *
   * If `options` or `options.durationMs` are not provided, the toast will use the duration value from `<app-toaster [duration]>`.
   * If no `[duration]` is set in the toaster, it falls back to {@link DEFAULT_TOAST_DURATION_MS}.
   *
   * @param message The toast content.
   * @param options Optional configuration (icon, custom duration, etc).
   * @returns The toast ID, useful for programmatic dismissal.
   */
  success(message: string, options?: ToastOptions): string {
    return this.add(message, 'success', this.resolveDuration(options?.durationMs), options);
  }

  /**
   * Display an error toast notification.
   *
   * If `options` or `options.durationMs` are not provided, the toast will use the duration value from `<app-toaster [duration]>`.
   * If no `[duration]` is set in the toaster, it falls back to {@link DEFAULT_TOAST_DURATION_MS}.
   *
   * @param message The toast content.
   * @param options Optional configuration (icon, custom duration, etc).
   * @returns The toast ID, useful for programmatic dismissal.
   */
  error(message: string, options?: ToastOptions): string {
    return this.add(message, 'error', this.resolveDuration(options?.durationMs), options);
  }

  /**
   * Display an info toast notification.
   *
   * If `options` or `options.durationMs` are not provided, the toast will use the duration value from `<app-toaster [duration]>`.
   * If no `[duration]` is set in the toaster, it falls back to {@link DEFAULT_TOAST_DURATION_MS}.
   *
   * @param message The toast content.
   * @param options Optional configuration (icon, custom duration, etc).
   * @returns The toast ID, useful for programmatic dismissal.
   */
  info(message: string, options?: ToastOptions): string {
    return this.add(message, 'info', this.resolveDuration(options?.durationMs), options);
  }

  /**
   * Display a warning toast notification.
   *
   * If `options` or `options.durationMs` are not provided, the toast will use the duration value from `<app-toaster [duration]>`.
   * If no `[duration]` is set in the toaster, it falls back to {@link DEFAULT_TOAST_DURATION_MS}.
   *
   * @param message The toast content.
   * @param options Optional configuration (icon, custom duration, etc).
   * @returns The toast ID, useful for programmatic dismissal.
   */
  warning(message: string, options?: ToastOptions): string {
    return this.add(message, 'warning', this.resolveDuration(options?.durationMs), options);
  }

  /**
   * Show a toast whose body is custom HTML inside the usual toast chrome (animations, close button).
   * The string is bound with `[innerHTML]` and sanitized by Angular like any template HTML.
   * Uses the `default` variant. Omit `durationMs` to use `<app-toaster [duration]>` (or {@link DEFAULT_TOAST_DURATION_MS}). Use {@link TOAST_DURATION_MANUAL_DISMISS} (or `0`) to stay until dismissed.
   *
   * @param html The custom HTML content.
   * @param options Optional configuration (icon, custom duration, etc).
   * @returns The toast ID, useful for programmatic dismissal.
   */
  custom(html: string, options?: ToastOptions): string {
    return this.addHtml(html, 'default', this.resolveDuration(options?.durationMs), options);
  }

  /**
   * Show a toast whose body is a **standalone** Angular component on a **headless** host: no default border,
   * padding, shadow, or surface color — only stack position and enter/leave motion. No close button is shown;
   * dismiss with `durationMs` / `<app-toaster [duration]>` or call {@link dismiss} with the returned id.
   * The default message + icon row is omitted; the component supplies all visuals.
   *
   * Pass {@link HeadlessToastOptions.inputs} to feed `input()` / `@Input()` on that component.
   * The component also receives **`toastId`** (matches the returned id) for programmatic dismiss.
   * Omit `durationMs` to use `<app-toaster [duration]>` (or {@link DEFAULT_TOAST_DURATION_MS}).
   *
   * @param component The component class (must be usable with `NgComponentOutlet`).
   * @param options Optional duration and component `inputs`.
   * @returns The toast ID, useful for programmatic dismissal.
   */
  headless(component: Type<unknown>, options?: HeadlessToastOptions): string {
    return this.addComponent(component, this.resolveDuration(options?.durationMs), options);
  }

  /**
   * Display a loading toast notification.
   *
   * If `options.durationMs` is omitted, the toast stays until you dismiss or replace it (same as {@link TOAST_DURATION_MANUAL_DISMISS}).
   * Passing a finite positive `durationMs` schedules auto-dismiss for loading toasts like other variants.
   * The literal **`"Infinity"`** (or {@link TOAST_DURATION_MANUAL_DISMISS} / `0`) keeps the toast until dismissed.
   *
   * @param message The toast content.
   * @param options Optional configuration (icon, custom duration, etc).
   * @returns The toast ID, useful for programmatic dismissal.
   */
  loading(message: string, options?: ToastOptions): string {
    const duration =
      options?.durationMs !== undefined
        ? {
            durationMs: parseToasterDurationMs(options.durationMs),
            syncWithInitialToasterDefault: false,
          }
        : {
            durationMs: TOAST_DURATION_MANUAL_DISMISS,
            syncWithInitialToasterDefault: false,
          };
    return this.add(message, 'loading', duration, options);
  }

  /**
   * Toast with message and a single **action** button (no icon). Default label is {@link DEFAULT_TOAST_ACTION_LABEL}.
   * Pass `action.label` and `action.onClick` in {@link ToastActionMethodOptions}.
   */
  action(message: string, options: ToastActionMethodOptions): string {
    const { action: actionCfg, ...rest } = options;
    const toastAction: NonNullable<ToasterItem['toastAction']> = {
      role: 'action',
      label: actionCfg.label ?? DEFAULT_TOAST_ACTION_LABEL,
      onClick: actionCfg.onClick,
    };
    return this.add(
      message,
      'default',
      this.resolveDuration(rest.durationMs),
      { ...rest, icon: null },
      toastAction,
    );
  }

  /**
   * Toast with message and a **cancel**-style button (no icon). Default label is {@link DEFAULT_TOAST_CANCEL_LABEL}.
   * Pass `cancel.label` and `cancel.onClick` in {@link ToastCancelMethodOptions}.
   */
  cancel(message: string, options: ToastCancelMethodOptions): string {
    const { cancel: cancelCfg, ...rest } = options;
    const toastAction: NonNullable<ToasterItem['toastAction']> = {
      role: 'cancel',
      label: cancelCfg.label ?? DEFAULT_TOAST_CANCEL_LABEL,
      onClick: cancelCfg.onClick,
    };
    return this.add(
      message,
      'default',
      this.resolveDuration(rest.durationMs),
      { ...rest, icon: null },
      toastAction,
    );
  }

  /**
   * Shows one toast: loading until `userPromise` settles, then the same toast updates to success or error.
   * Returns the same promise (fulfillment/rejection preserved for callers).
   *
   * @param userPromise The promise to display.
   * @param labels The labels for the loading, success, and error states.
   * @returns The promise (fulfillment/rejection preserved for callers).
   */
  promise<T>(userPromise: PromiseLike<T>, labels: ToastPromiseLabels<T>): Promise<T> {
    const loadingId = this.loading(labels.loading);
    return Promise.resolve(userPromise).then(
      (value) => {
        const message =
          typeof labels.success === 'function' ? labels.success(value) : labels.success;
        this.updateToast(loadingId, message, 'success', this.resolveDuration(undefined));
        return value;
      },
      (reason: unknown) => {
        const message = typeof labels.error === 'function' ? labels.error(reason) : labels.error;
        this.updateToast(loadingId, message, 'error', this.resolveDuration(undefined));
        throw reason;
      },
    );
  }

  private add(
    message: string,
    variant: ToastVariant,
    duration: ResolvedToastDuration,
    options?: ToastOptions,
    toastAction?: NonNullable<ToasterItem['toastAction']>,
  ): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const icon = options?.icon;
    const style = options?.style;
    const classNames = options?.classNames;
    const onDismiss = options?.onDismiss;
    const onAutoClose = options?.onAutoClose;
    const description = options?.description;
    const item: ToasterItem = {
      id,
      message,
      variant,
      ...(icon !== undefined ? { icon } : {}),
      ...(style !== undefined ? { style } : {}),
      ...(classNames !== undefined ? { classNames } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(onDismiss !== undefined ? { onDismiss } : {}),
      ...(onAutoClose !== undefined ? { onAutoClose } : {}),
      ...(toastAction !== undefined ? { toastAction } : {}),
    };
    this._toasts.update((list) => [...list, item]);
    this.scheduleResolvedAutoDismiss(id, duration);
    return id;
  }

  private addHtml(
    html: string,
    variant: ToastVariant,
    duration: ResolvedToastDuration,
    options?: ToastOptions,
  ): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const icon = options?.icon;
    const style = options?.style;
    const classNames = options?.classNames;
    const onDismiss = options?.onDismiss;
    const onAutoClose = options?.onAutoClose;
    const description = options?.description;

    const item: ToasterItem = {
      id,
      message: '',
      variant,
      html,
      ...(icon !== undefined ? { icon } : {}),
      ...(style !== undefined ? { style } : {}),
      ...(classNames !== undefined ? { classNames } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(onDismiss !== undefined ? { onDismiss } : {}),
      ...(onAutoClose !== undefined ? { onAutoClose } : {}),
    };

    this._toasts.update((list) => [...list, item]);

    this.scheduleResolvedAutoDismiss(id, duration);

    return id;
  }

  private addComponent(
    component: Type<unknown>,
    duration: ResolvedToastDuration,
    options?: HeadlessToastOptions,
  ): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

    const componentInputs: Record<string, unknown> = {
      ...(options?.inputs ?? {}),
      toastId: id,
    };

    const classNames = options?.classNames;
    const onDismiss = options?.onDismiss;
    const onAutoClose = options?.onAutoClose;

    const item: ToasterItem = {
      id,
      message: '',
      variant: 'default',
      component,
      componentInputs,
      ...(classNames !== undefined ? { classNames } : {}),
      ...(onDismiss !== undefined ? { onDismiss } : {}),
      ...(onAutoClose !== undefined ? { onAutoClose } : {}),
    };

    this._toasts.update((list) => [...list, item]);

    this.scheduleResolvedAutoDismiss(id, duration);

    return id;
  }

  private updateToast(
    id: string,
    message: string,
    variant: ToastVariant,
    duration: ResolvedToastDuration,
  ): void {
    let found = false;
    this._toasts.update((toasts) =>
      toasts.map((toast) => {
        if (toast.id !== id) {
          return toast;
        }
        found = true;
        return { ...toast, message, variant };
      }),
    );
    if (found) {
      this.scheduleResolvedAutoDismiss(id, duration);
    }
  }

  /**
   * Dismiss a toast notification.
   *
   * @param id The toast ID.
   */
  dismiss(id: string): void {
    this.removeToast(id, 'manual');
  }

  /**
   * Clear all toast notifications.
   */
  clear(): void {
    const snapshot = [...this._toasts()];
    for (const state of this.autoDismissByToastId.values()) {
      if (state.kind === 'scheduled') {
        globalThis.clearTimeout(state.timer);
      }
    }
    this.autoDismissByToastId.clear();
    this.pendingInitialDefaultSyncByToastId.clear();
    this._toasts.set([]);
    for (const toast of snapshot) {
      toast.onDismiss?.();
    }
  }

  private removeToast(id: string, cause: 'auto' | 'manual'): void {
    const toast = this._toasts().find((t) => t.id === id);
    if (!toast) {
      return;
    }
    this.cancelAutoDismiss(id);
    this._toasts.update((list) => list.filter((t) => t.id !== id));
    if (cause === 'auto') {
      toast.onAutoClose?.();
    } else {
      toast.onDismiss?.();
    }
  }
}
