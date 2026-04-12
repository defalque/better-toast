import { Injectable, signal, type Type } from '@angular/core';

import type { ToastPromiseLabels, ToastOptions, ToastVariant, ToasterItem } from './toaster.types';

/** Fallback when `<app-toaster [duration]>` is absent and a helper omits `durationMs`. */
export const DEFAULT_TOAST_DURATION_MS = 4000;

@Injectable({ providedIn: 'root' })
export class AppToasterService {
  private readonly _toasts = signal<readonly ToasterItem[]>([]);

  private defaultDurationMs = DEFAULT_TOAST_DURATION_MS;

  /** Active messages, oldest first. */
  readonly toasts = this._toasts.asReadonly();

  /** Synced from `AppToaster` `[duration]`; used when a helper omits its `durationMs` argument. */
  setDefaultDurationMs(ms: number): void {
    this.defaultDurationMs = Math.max(0, ms);
  }

  private resolveDuration(durationMs: number | undefined): number {
    return durationMs !== undefined ? durationMs : this.defaultDurationMs;
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
    return this.add(message, 'default', this.resolveDuration(options?.durationMs), options?.icon);
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
    return this.add(message, 'success', this.resolveDuration(options?.durationMs), options?.icon);
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
    return this.add(message, 'error', this.resolveDuration(options?.durationMs), options?.icon);
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
    return this.add(message, 'info', this.resolveDuration(options?.durationMs), options?.icon);
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
    return this.add(message, 'warning', this.resolveDuration(options?.durationMs), options?.icon);
  }

  /**
   * Show a toast whose body is custom HTML inside the usual toast chrome (animations, close button).
   * The string is bound with `[innerHTML]` and sanitized by Angular like any template HTML.
   * Uses the `default` variant. Omit `durationMs` to use `<app-toaster [duration]>` (or {@link DEFAULT_TOAST_DURATION_MS}). `durationMs: 0` = stay until dismissed.
   *
   * @param html The custom HTML content.
   * @param options Optional configuration (icon, custom duration, etc).
   * @returns The toast ID, useful for programmatic dismissal.
   */
  custom(html: string, options?: ToastOptions): string {
    return this.addHtml(html, 'default', this.resolveDuration(options?.durationMs), options?.icon);
  }

  /**
   * Display a loading toast notification.
   *
   * If `options` or `options.durationMs` are not provided, the toast will use the duration value from `<app-toaster [duration]>`.
   * If no `[duration]` is set in the toaster, it falls back to {@link DEFAULT_TOAST_DURATION_MS}.
   *
   * @param message The toast content.
   * @param options Optional configuration (icon, custom duration, etc).
   * @returns The toast ID, useful for programmatic dismissal.
   */
  loading(message: string, options?: ToastOptions): string {
    const ms = options?.durationMs !== undefined ? options.durationMs : 0;
    return this.add(message, 'loading', ms, options?.icon);
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
        const message =
          typeof labels.error === 'function' ? labels.error(reason) : labels.error;
        this.updateToast(loadingId, message, 'error', settledDurationMs);
        throw reason;
      },
    );
  }

  private add(
    message: string,
    variant: ToastVariant,
    durationMs: number,
    icon?: Type<unknown> | null,
  ): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const item: ToasterItem =
      icon !== undefined ? { id, message, variant, icon } : { id, message, variant };
    this._toasts.update((list) => [...list, item]);
    if (durationMs > 0) {
      globalThis.setTimeout(() => this.dismiss(id), durationMs);
    }
    return id;
  }

  private addHtml(
    html: string,
    variant: ToastVariant,
    durationMs: number,
    icon?: Type<unknown> | null,
  ): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const base: ToasterItem = { id, message: '', variant, html };
    const item: ToasterItem = icon !== undefined ? { ...base, icon } : base;
    this._toasts.update((list) => [...list, item]);
    if (durationMs > 0) {
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
        return { id, message, variant };
      }),
    );
    if (found && durationMs > 0) {
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
