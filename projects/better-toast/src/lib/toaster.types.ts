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
export interface ToastOptions {
  /** Omit to use `<app-toaster [duration]>` (or the library default). `0` = persist until dismissed (except `loading`, which defaults to `0` when omitted). */
  durationMs?: number;
  /**
   * `undefined` = use global `[icons]` on `<app-toaster>` or built-in SVGs.
   * `null` = no icon for this toast.
   * Otherwise a standalone component class rendered like `[icons]` overrides.
   */
  icon?: Type<unknown> | null;
}

export interface ToasterItem {
  readonly id: string;
  readonly message: string;
  readonly variant: ToastVariant;
  /** When set, replaces the default icon + message; body is `.toast-custom` only (no `.toast-main`), still sanitized by Angular. */
  readonly html?: string;
  /** Per-toast override; see {@link ToastOptions.icon}. */
  readonly icon?: Type<unknown> | null;
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
