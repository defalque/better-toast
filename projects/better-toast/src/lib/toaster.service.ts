import { Injectable, signal } from '@angular/core';

import type { Type } from '@angular/core';

import type {
  HeadlessToastOptions,
  ToastPromiseLabels,
  ToastOptions,
  ToastVariant,
  ToasterDuration,
  ToasterItem,
} from './toaster.types';

/** Fallback when `<app-toaster [duration]>` is absent and a helper omits `durationMs`. */
export const DEFAULT_TOAST_DURATION_MS = 4000;

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

@Injectable({ providedIn: 'root' })
export class ToasterService {
  private readonly _toasts = signal<readonly ToasterItem[]>([]);

  private defaultDurationMs = DEFAULT_TOAST_DURATION_MS;

  /** Active messages, oldest first. */
  readonly toasts = this._toasts.asReadonly();

  /** Synced from `Toaster` `[duration]`; used when a helper omits its `durationMs` argument. */
  setDefaultDurationMs(ms: number): void {
    if (Number.isNaN(ms)) {
      this.defaultDurationMs = DEFAULT_TOAST_DURATION_MS;
      return;
    }
    this.defaultDurationMs = Math.max(0, ms);
  }

  private resolveDuration(durationMs: ToasterDuration | undefined): number {
    return durationMs !== undefined ? parseToasterDurationMs(durationMs) : this.defaultDurationMs;
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
   * Omit `durationMs` to use `<app-toaster [duration]>` (or {@link DEFAULT_TOAST_DURATION_MS}).
   *
   * @param component The component class (must be usable with `NgComponentOutlet`).
   * @param options Optional duration, host `style`, and component `inputs`.
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
    const ms =
      options?.durationMs !== undefined
        ? parseToasterDurationMs(options.durationMs)
        : TOAST_DURATION_MANUAL_DISMISS;
    return this.add(message, 'loading', ms, options);
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
    const settledDurationMs = this.resolveDuration(undefined);
    return Promise.resolve(userPromise).then(
      (value) => {
        const message =
          typeof labels.success === 'function' ? labels.success(value) : labels.success;
        this.updateToast(loadingId, message, 'success', settledDurationMs);
        return value;
      },
      (reason: unknown) => {
        const message = typeof labels.error === 'function' ? labels.error(reason) : labels.error;
        this.updateToast(loadingId, message, 'error', settledDurationMs);
        throw reason;
      },
    );
  }

  private add(message: string, variant: ToastVariant, durationMs: number, options?: ToastOptions): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const icon = options?.icon;
    const style = options?.style;
    const item: ToasterItem = {
      id,
      message,
      variant,
      ...(icon !== undefined ? { icon } : {}),
      ...(style !== undefined ? { style } : {}),
    };
    this._toasts.update((list) => [...list, item]);
    if (shouldScheduleAutoDismiss(durationMs)) {
      globalThis.setTimeout(() => this.dismiss(id), durationMs);
    }
    return id;
  }

  private addHtml(html: string, variant: ToastVariant, durationMs: number, options?: ToastOptions): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const icon = options?.icon;
    const style = options?.style;
    const item: ToasterItem = {
      id,
      message: '',
      variant,
      html,
      ...(icon !== undefined ? { icon } : {}),
      ...(style !== undefined ? { style } : {}),
    };
    this._toasts.update((list) => [...list, item]);
    if (shouldScheduleAutoDismiss(durationMs)) {
      globalThis.setTimeout(() => this.dismiss(id), durationMs);
    }
    return id;
  }

  private addComponent(
    component: Type<unknown>,
    durationMs: number,
    options?: HeadlessToastOptions,
  ): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const icon = options?.icon;
    const style = options?.style;
    const inputs = options?.inputs;
    const item: ToasterItem = {
      id,
      message: '',
      variant: 'default',
      component,
      ...(inputs !== undefined ? { componentInputs: inputs } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(style !== undefined ? { style } : {}),
    };
    this._toasts.update((list) => [...list, item]);
    if (shouldScheduleAutoDismiss(durationMs)) {
      globalThis.setTimeout(() => this.dismiss(id), durationMs);
    }
    return id;
  }

  private updateToast(
    id: string,
    message: string,
    variant: ToastVariant,
    durationMs: number,
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
    if (found && shouldScheduleAutoDismiss(durationMs)) {
      globalThis.setTimeout(() => this.dismiss(id), durationMs);
    }
  }

  /**
   * Dismiss a toast notification.
   *
   * @param id The toast ID.
   */
  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  /**
   * Clear all toast notifications.
   */
  clear(): void {
    this._toasts.set([]);
  }
}
