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
 * Optional extra classes for toast chrome, keyed by the element they bind to via **`[class]`**.
 * Used by {@link ToasterToastOptions.classNames} and {@link ToastOptions.classNames}.
 *
 * The library ships encapsulated styles (`toast-item.css`, etc.). Global rules for your class names often **lose to those defaults**, so properties you expect to change **usually need `!important`** (or stronger specificity) to actually apply.
 */
export type ToastChromeClassNames = Partial<
  Record<'toast' | 'message' | 'closeButton', string>
>;

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
   *
   * Omitted keys add no extra classes for that part; values are typically space-separated class names (same as a static `class` attribute).
   *
   * **Overriding built-in look:** see {@link ToastChromeClassNames} — your CSS generally needs **`!important`** on the declarations that must win.
   */
  classNames?: ToastChromeClassNames;
}

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
   */
  classNames?: ToastChromeClassNames;
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
