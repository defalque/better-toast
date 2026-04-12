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
 * Each value must be an **Angular standalone component** class you import in the host
 * (e.g. `success: MySuccessIcon`). The component is rendered with `NgComponentOutlet`, so it
 * cannot rely on non-standalone dependencies unless you import them in that component.
 *
 * Pass only the keys you want to override; omitted keys keep the library defaults.
 */
export type ToasterIcons = {
  [K in Exclude<ToastVariant, 'default'>]?: Type<unknown>;
};

export interface ToasterItem {
  readonly id: string;
  readonly message: string;
  readonly variant: ToastVariant;
  /** When set, replaces the default icon + message; body is `.toast-custom` only (no `.toast-main`), still sanitized by Angular. */
  readonly html?: string;
}

/** Labels for `AppToasterService.promise` (loading vs settled states). */
export interface ToastPromiseLabels {
  readonly loading: string;
  readonly success: string;
  readonly error: string;
}
