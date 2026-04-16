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
 * Viewport inset from `<app-toaster [offset]>` or `<app-toaster [mobileOffset]>`.
 *
 * Used with **`[offset]`** for `--toast-offset-*` (wide layout / shared vars) and **`[mobileOffset]`** for `--toast-offset-mobile-*` (narrow layout in `toaster.css`).
 *
 * - A **string** sets all four sides to the same CSS value (e.g. `"24px"`, `"1rem env(safe-area-inset-top)"`).
 * - An **object** sets only the sides you pass; omitted sides keep the defaults from `toaster.css`.
 */
export type ToasterOffset =
  | string
  | {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };

/**
 * Milliseconds as a number, or the literal string **`"Infinity"`** (manual dismiss only). No other string values are supported.
 * Used by `<app-toaster [duration]>` and {@link ToastOptions.durationMs}.
 */
export type ToasterDuration = number | 'Infinity';

/** Default `aria-label` for the toaster live region (`<section>`). */
export const DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION = 'Notifications';

/** Default `aria-label` for the per-toast dismiss (close) control. */
export const DEFAULT_TOASTER_ARIA_DISMISS_BUTTON = 'Dismiss';

/**
 * Overrides for built-in English accessibility strings on `<better-toaster [accessibilityLabels]>`.
 * Omitted keys keep the library defaults.
 */
export interface ToasterAccessibilityLabels {
  /**
   * `aria-label` on the polite live region wrapper (`<section>`).
   * Default {@link DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION}.
   */
  notificationsRegion?: string;
  /**
   * `aria-label` on the dismiss control when `<better-toaster [closeButton]>` is true.
   * Default {@link DEFAULT_TOASTER_ARIA_DISMISS_BUTTON}.
   */
  dismissButton?: string;
}

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
 *
 * The **`default`** variant has no built-in icon; set `default` here (or pass {@link ToastOptions.icon}
 * on a single toast) to show one. Omitting `default` keeps default toasts text-only.
 */
export type ToasterIcons = Partial<Record<ToastVariant, Type<unknown> | null>>;

/**
 * Extra classes for host, message, and close control only.
 * Used by {@link ToastOptions.classNames} and {@link HeadlessToastOptions.classNames}.
 *
 * Row button defaults (`.action-btn` / `.cancel-btn`) can be set on {@link ToasterToastOptions.classNames} ({@link ToastChromeClassNames})
 * or overridden per call via {@link ToastActionChromeClassNames} / {@link ToastCancelChromeClassNames}.
 *
 * The library ships encapsulated styles (`toast-item.css`, etc.). Global rules for your class names often **lose to those defaults**, so properties you expect to change **usually need `!important`** (or stronger specificity) to actually apply.
 */
export type ToastBaseChromeClassNames = Partial<
  Record<'toast' | 'message' | 'closeButton', string>
>;

/**
 * Merged shape after combining toaster defaults with a toast item (may include row-button keys when that toast has a row button).
 * The library still uses this internally on {@link ToasterItem} and for `[class]` resolution.
 */
export type ToastChromeClassNames = ToastBaseChromeClassNames & {
  actionButton?: string;
  cancelButton?: string;
};

/** `classNames` for {@link ToasterService.action} — includes `.action-btn` only among row buttons. */
export type ToastActionChromeClassNames = ToastBaseChromeClassNames & {
  actionButton?: string;
};

/** `classNames` for {@link ToasterService.cancel} — includes `.cancel-btn` only among row buttons. */
export type ToastCancelChromeClassNames = ToastBaseChromeClassNames & {
  cancelButton?: string;
};

/**
 * Defaults for every toast from `<app-toaster [toastOptions]>`.
 * Per-toast {@link ToastOptions} override these (e.g. `style` / `classNames` keys on a single toast win over the same keys here).
 */
export interface ToasterToastOptions {
  /**
   * Inline CSS on each toast host (`li.toast` / `AppToastItem`).
   * Merged with per-toast {@link ToastOptions.style}; toast-specific values override.
   */
  style?: Record<string, string | number | undefined>;

  /**
   * Extra CSS class strings merged onto toast chrome via Angular **`[class]`** bindings (from `<app-toaster [toastOptions]>`).
   *
   * - **`toast`** — list item host (`li.toast` / `AppToastItem`), alongside the built-in `toast` class.
   * - **`message`** — the text paragraph (`.msg`) when the toast is not `html` / `component` / headless body.
   * - **`closeButton`** — the dismiss control (`.close-btn`) when `<app-toaster [closeButton]>` is enabled.
   * - **`actionButton`** / **`cancelButton`** — defaults for `.action-btn` / `.cancel-btn` when you use {@link ToasterService.action} / {@link ToasterService.cancel}; ignored on toasts without a row button.
   *
   * Per-toast {@link ToastOptions.classNames} cannot set row-button keys; override them on each {@link ToastActionMethodOptions} / {@link ToastCancelMethodOptions} call instead.
   *
   * Omitted keys add no extra classes for that part; values are typically space-separated class names (same as a static `class` attribute).
   *
   * **Overriding built-in look:** your CSS generally needs **`!important`** on the declarations that must win.
   */
  classNames?: ToastChromeClassNames;
}

/** Label + handler for {@link ToasterService.action} / {@link ToasterService.cancel}. */
export interface ToastMethodButtonConfig {
  /** Visible button text; defaults to `"Action"` or `"Cancel"` depending on the method. */
  label?: string;
  /**
   * Receives the row button click event. Call {@link Event.preventDefault} to keep the toast open
   * (the library skips {@link ToasterService.dismiss} when `defaultPrevented` is true).
   */
  onClick: (event: Event) => void;
}

/**
 * Options for {@link ToasterService.action} only. Use the `action` field (not available on {@link ToastOptions}).
 */
export type ToastActionMethodOptions = Omit<ToastOptions, 'icon' | 'classNames'> & {
  action: ToastMethodButtonConfig;
  classNames?: ToastActionChromeClassNames;
};

/**
 * Options for {@link ToasterService.cancel} only. Use the `cancel` field (not available on {@link ToastOptions}).
 */
export type ToastCancelMethodOptions = Omit<ToastOptions, 'icon' | 'classNames'> & {
  cancel: ToastMethodButtonConfig;
  classNames?: ToastCancelChromeClassNames;
};

/**
 * Second argument for `show` / `success` / `error` / `info` / `warning` / `custom` / `loading`.
 * Not used by `ToasterService.promise()` (that API uses {@link ToastPromiseLabels}).
 */
export interface ToastOptions {
  /**
   * Omit to use `<app-toaster [duration]>` (or the library default).
   * Use the literal **`"Infinity"`**, `Number.POSITIVE_INFINITY`, or `TOAST_DURATION_MANUAL_DISMISS` to persist until dismissed; `0` is still accepted for the same behavior.
   * `loading()` defaults to manual dismiss when `durationMs` is omitted.
   */
  durationMs?: ToasterDuration;
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
  /**
   * Extra **`[class]`** strings for this toast only — same keys and **`!important`** guidance as {@link ToasterToastOptions.classNames}.
   * Merged with `<app-toaster [toastOptions]>` `classNames` (if any); per-toast keys replace the same keys from the toaster.
   *
   * Row button keys (`actionButton` / `cancelButton`) are only valid on {@link ToastActionMethodOptions} / {@link ToastCancelMethodOptions}.
   */
  classNames?: ToastBaseChromeClassNames;
  /**
   * Called when the toast is removed for any reason other than auto-dismiss: close control, swipe,
   * {@link ToasterService.dismiss}, or {@link ToasterService.clear}.
   */
  onDismiss?: () => void;
  /**
   * Called when the toast is removed because its auto-dismiss timer finished (including after hover
   * pause when the remaining time elapses).
   */
  onAutoClose?: () => void;
}

/**
 * Options for {@link ToasterService.headless}.
 * The component must be **standalone** (or otherwise valid for `NgComponentOutlet`).
 * Headless toasts ignore `<app-toaster [closeButton]>`: no dismiss control is rendered.
 *
 * Per-toast **`icon`** and **`style`** are omitted: the inner component owns visuals; use
 * `<app-toaster [toastOptions]>` for shared host styling if needed. **`classNames`** still applies to the list-item host
 * (and to `.msg` / `.close-btn` when that chrome exists).
 *
 * The host always passes a **`toastId`** input (same value as the id returned from `headless()`)
 * so the component can call {@link ToasterService.dismiss} or read its own id. User `inputs` are
 * merged first; **`toastId` always wins** if also present in `inputs`.
 */
export interface HeadlessToastOptions extends Omit<ToastOptions, 'icon' | 'style'> {
  /**
   * Values passed to the component’s `input()` / `@Input()` bindings
   * (same shape as `NgComponentOutlet` `inputs`).
   */
  inputs?: Record<string, unknown>;
}

export interface ToasterItem {
  readonly id: string;
  readonly message: string;
  readonly variant: ToastVariant;
  /** When set, replaces the default icon + message; body is `.toast-custom` only (no `.toast-main`), still sanitized by Angular. */
  readonly html?: string;
  /**
   * When set (without `html`), the toast body is this standalone component only — same stack and motion as other toasts, without host chrome or a close button.
   */
  readonly component?: Type<unknown>;
  /** Bound to the headless component via `NgComponentOutlet`. */
  readonly componentInputs?: Record<string, unknown>;
  /** Per-toast override; see {@link ToastOptions.icon}. */
  readonly icon?: Type<unknown> | null;
  /** Per-toast host inline styles; see {@link ToastOptions.style}. */
  readonly style?: Record<string, string | number | undefined>;
  /** Per-toast extra classes; see {@link ToastOptions.classNames}. */
  readonly classNames?: ToastChromeClassNames;
  /** See {@link ToastOptions.onDismiss}. */
  readonly onDismiss?: () => void;
  /** See {@link ToastOptions.onAutoClose}. */
  readonly onAutoClose?: () => void;
  /**
   * Primary row action from {@link ToasterService.action} or {@link ToasterService.cancel}.
   * Renders a text button next to the message (no icon column).
   */
  readonly toastAction?: {
    readonly role: 'action' | 'cancel';
    readonly label: string;
    /** Same contract as {@link ToastMethodButtonConfig.onClick}. */
    readonly onClick: (event: Event) => void;
  };
}

/**
 * Labels for `ToasterService.promise` (loading vs settled states).
 * `success` / `error` may be static strings or functions that receive the settled value / rejection reason.
 */
export interface ToastPromiseLabels<T = unknown> {
  readonly loading: string;
  readonly success: string | ((data: T) => string);
  readonly error: string | ((reason: unknown) => string);
}
