import { Injectable, signal } from '@angular/core';

import type { ToastVariant, ToasterItem } from './toaster.types';

@Injectable({ providedIn: 'root' })
export class AppToasterService {
  private readonly _toasts = signal<readonly ToasterItem[]>([]);

  /** Active messages, oldest first. */
  readonly toasts = this._toasts.asReadonly();

  /**
   * Show a neutral toast. Auto-dismiss after `durationMs` (0 = stay until dismissed).
   */
  show(message: string, durationMs = 4000): string {
    return this.add(message, 'default', durationMs);
  }

  success(message: string, durationMs = 4000): string {
    return this.add(message, 'success', durationMs);
  }

  error(message: string, durationMs = 4000): string {
    return this.add(message, 'error', durationMs);
  }

  info(message: string, durationMs = 4000): string {
    return this.add(message, 'info', durationMs);
  }

  warning(message: string, durationMs = 4000): string {
    return this.add(message, 'warning', durationMs);
  }

  /** Stays until dismissed unless you pass a positive `durationMs`. */
  loading(message: string, durationMs = 0): string {
    return this.add(message, 'loading', durationMs);
  }

  private add(message: string, variant: ToastVariant, durationMs: number): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    this._toasts.update((list) => [...list, { id, message, variant }]);
    if (durationMs > 0) {
      globalThis.setTimeout(() => this.dismiss(id), durationMs);
    }
    return id;
  }

  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
