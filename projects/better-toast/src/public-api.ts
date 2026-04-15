/*
 * Public API Surface of better-toast
 */

export { BetterToaster } from './lib/toaster';
export {
  DEFAULT_TOAST_DURATION_MS,
  TOAST_DURATION_MANUAL_DISMISS,
  ToasterService,
} from './lib/toaster.service';
export type {
  HeadlessToastOptions,
  ToastPromiseLabels,
  ToastOptions,
  ToasterDuration,
  ToasterIcons,
  ToasterOffset,
  ToasterToastOptions,
  ToastVariant,
  ToasterItem,
  ToasterPosition,
} from './lib/toaster.types';
export { TOAST_VARIANTS, TOASTER_POSITIONS } from './lib/toaster.types';
