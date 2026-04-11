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

export interface ToasterItem {
  readonly id: string;
  readonly message: string;
  readonly variant: ToastVariant;
}

/** Labels for `AppToasterService.promise` (loading vs settled states). */
export interface ToastPromiseLabels {
  readonly loading: string;
  readonly success: string;
  readonly error: string;
}
