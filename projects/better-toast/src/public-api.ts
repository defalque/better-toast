/*
 * Public API Surface of better-toast
 */

export { AppToaster } from './lib/app-toaster';
export { AppToasterService, DEFAULT_TOAST_DURATION_MS } from './lib/app-toaster.service';
export type {
  ToastPromiseLabels,
  ToastVariant,
  ToasterItem,
  ToasterPosition,
} from './lib/toaster.types';
export { TOAST_VARIANTS, TOASTER_POSITIONS } from './lib/toaster.types';
