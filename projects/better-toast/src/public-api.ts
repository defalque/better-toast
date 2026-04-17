/*
 * Public API Surface of better-toast
 */

export { BetterToaster } from './lib/toaster';
export {
  DEFAULT_TOASTER_ARIA_DISMISS_BUTTON,
  DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION,
  TOAST_VARIANTS,
  TOASTER_POSITIONS,
} from './lib/toaster.types';
export {
  DEFAULT_TOAST_ACTION_LABEL,
  DEFAULT_TOAST_CANCEL_LABEL,
  DEFAULT_TOAST_DURATION_MS,
  TOAST_DURATION_MANUAL_DISMISS,
  ToasterService,
} from './lib/toaster.service';
export type {
  HeadlessToastOptions,
  ToastActionChromeClassNames,
  ToastActionMethodOptions,
  ToastBaseChromeClassNames,
  ToastCancelChromeClassNames,
  ToastCancelMethodOptions,
  ToastChromeClassNames,
  ToastMethodButtonConfig,
  ToastPromiseLabels,
  ToastOptions,
  ToasterAccessibilityLabels,
  ToasterDuration,
  ToasterIcons,
  ToasterOffset,
  ToasterTheme,
  ToasterToastOptions,
  ToastVariant,
  ToasterItem,
  ToasterPosition,
} from './lib/toaster.types';
