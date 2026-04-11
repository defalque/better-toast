import { Injectable, signal } from '@angular/core';

import type { ToastPromiseLabels, ToastVariant, ToasterItem } from './toaster.types';

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
   * Show a neutral toast. Omit `durationMs` to use the value from `<app-toaster [duration]>` (or {@link DEFAULT_TOAST_DURATION_MS} if the toaster is not mounted). `0` = stay until dismissed.
   */
  show(message: string, durationMs?: number): string {
    return this.add(message, 'default', this.resolveDuration(durationMs));
  }

  success(message: string, durationMs?: number): string {
    return this.add(message, 'success', this.resolveDuration(durationMs));
  }

  error(message: string, durationMs?: number): string {
    return this.add(message, 'error', this.resolveDuration(durationMs));
  }

  info(message: string, durationMs?: number): string {
    return this.add(message, 'info', this.resolveDuration(durationMs));
  }

  warning(message: string, durationMs?: number): string {
    return this.add(message, 'warning', this.resolveDuration(durationMs));
  }

  /** Stays until dismissed unless you pass a positive `durationMs` (does not use `[duration]` or {@link DEFAULT_TOAST_DURATION_MS}). */
  loading(message: string, durationMs?: number): string {
    const ms = durationMs !== undefined ? durationMs : 0;
    return this.add(message, 'loading', ms);
  }

  /**
   * Shows one toast: loading until `userPromise` settles, then the same toast updates to success or error.
   * Returns the same promise (fulfillment/rejection preserved for callers).
   */
  promise<T>(userPromise: PromiseLike<T>, labels: ToastPromiseLabels): Promise<T> {
    const loadingId = this.loading(labels.loading);
    const settledDurationMs = this.resolveDuration(undefined);
    return Promise.resolve(userPromise).then(
      (value) => {
        this.updateToast(loadingId, labels.success, 'success', settledDurationMs);
        return value;
      },
      (reason: unknown) => {
        this.updateToast(loadingId, labels.error, 'error', settledDurationMs);
        throw reason;
      },
    );
  }

  private add(message: string, variant: ToastVariant, durationMs: number): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    this._toasts.update((list) => [...list, { id, message, variant }]);
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

  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
