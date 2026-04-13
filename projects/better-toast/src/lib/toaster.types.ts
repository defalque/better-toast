import type { Type } from '@angular/core';

export const TOASTER_POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

export type ToasterPosition = (typeof TOASTER_POSITIONS)[number];

/**
 * `<app-toaster>` `[duration]` / `duration` attribute: milliseconds as a number, or the literal string **`"Infinity"`** (manual dismiss only). No other string values are supported.
 */
export type ToasterDuration = number | 'Infinity';

export const TOAST_VARIANTS = [
  'default',
  'success',
  'error',
  'info',
  'warning',
  'loading',
] as const;

export type ToastVariant = (typeof TOAST_VARIANTS)[number];

/**
 * Per-variant icon overrides for `<app-toaster [icons]>`.
 *
 * Each value is either an **Angular standalone component** class (rendered with `NgComponentOutlet`),
 * or **`null`** to show no icon for that variant. Omitted keys keep the library defaults.
 */
export type ToasterIcons = {
  [K in Exclude<ToastVariant, 'default'>]?: Type<unknown> | null;
};

/**
 * Second argument for `show` / `success` / `error` / `info` / `warning` / `custom` / `loading`.
 * Not used by `AppToasterService.promise()` (that API uses {@link ToastPromiseLabels}).
 */
/**
 * Defaults for every toast from `<app-toaster [toastOptions]>`.
 * Per-toast {@link ToastOptions} override these (e.g. `style` keys on a single toast win over the same keys here).
 */
export interface ToasterToastOptions {
  /**
   * Inline CSS on each toast host (`li.toast` / `AppToastItem`).
   * Merged with per-toast {@link ToastOptions.style}; toast-specific values override.
   */
  style?: Record<string, string | number | undefined>;
}

export interface ToastOptions {
  /**
   * Omit to use `<app-toaster [duration]>` (or the library default).
   * Use `Number.POSITIVE_INFINITY` (or `TOAST_DURATION_MANUAL_DISMISS` from this package) to persist until dismissed; `0` is still accepted for the same behavior.
   * `loading()` defaults to manual dismiss when `durationMs` is omitted.
   */
  durationMs?: number;
  /**
   * `undefined` = use global `[icons]` on `<app-toaster>` or built-in SVGs.
   * `null` = no icon for this toast.
   * Otherwise a standalone component class rendered like `[icons]` overrides.
   */
  icon?: Type<unknown> | null;
  /**
   * Inline CSS on the toast host (`li.toast` / `AppToastItem`).
   * Merged after `<app-toaster [toastOptions]>` `style` (if any); per-toast keys override the same keys from the toaster.
   */
  style?: Record<string, string | number | undefined>;
}

export interface ToasterItem {
  readonly id: string;
  readonly message: string;
  readonly variant: ToastVariant;
  /** When set, replaces the default icon + message; body is `.toast-custom` only (no `.toast-main`), still sanitized by Angular. */
  readonly html?: string;
  /** Per-toast override; see {@link ToastOptions.icon}. */
  readonly icon?: Type<unknown> | null;
  /** Per-toast host inline styles; see {@link ToastOptions.style}. */
  readonly style?: Record<string, string | number | undefined>;
}

/**
 * Labels for `AppToasterService.promise` (loading vs settled states).
 * `success` / `error` may be static strings or functions that receive the settled value / rejection reason.
 */
export interface ToastPromiseLabels<T = unknown> {
  readonly loading: string;
  readonly success: string | ((data: T) => string);
  readonly error: string | ((reason: unknown) => string);
}
