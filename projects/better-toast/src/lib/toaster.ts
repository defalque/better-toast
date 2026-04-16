import { NgComponentOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  DEFAULT_TOAST_DURATION_MS,
  parseToasterDurationMs,
  ToasterService,
} from './toaster.service';
import {
  DEFAULT_TOASTER_ARIA_DISMISS_BUTTON,
  DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION,
  type ToastChromeClassNames,
  type ToasterAccessibilityLabels,
  type ToasterDuration,
  type ToasterIcons,
  type ToasterItem,
  type ToasterOffset,
  type ToasterPosition,
  type ToasterToastOptions,
  type ToastOptions,
  type ToastVariant,
} from './toaster.types';

function swipeDirectionForPosition(position: ToasterPosition): 'down' | 'up' {
  return position.startsWith('bottom') ? 'down' : 'up';
}

const GAP = 16;

function resolveToasterOffsetSide(
  offset: ToasterOffset | undefined,
  side: 'top' | 'right' | 'bottom' | 'left',
): string | undefined {
  if (offset == null) {
    return undefined;
  }
  if (typeof offset === 'string') {
    return offset;
  }
  return offset[side];
}

function mergeToastHostStyles(
  base: Record<string, string | number | undefined> | undefined,
  override: Record<string, string | number | undefined> | undefined,
): Record<string, string | number | undefined> | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;
  return { ...base, ...override };
}

function mergeToastClassNames(
  base: ToastChromeClassNames | undefined,
  override: ToastChromeClassNames | undefined,
): ToastChromeClassNames | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;
  return { ...base, ...override };
}

@Component({
  selector: 'li[betterToastItem]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  host: {
    role: 'listitem',
    tabindex: '0',
    class: 'toast',
    '[class]': 'resolvedClassNames()?.toast',
    '[attr.data-variant]': 'variant()',
    '[attr.data-icon]': 'shouldShowIconColumn() ? "true" : "false"',
    '[attr.data-headless]': 'isHeadless() ? "true" : null',
    '[attr.data-swipe-direction]': 'swipeDirection()',
    '[style.--offset]': 'offset() + "px"',
    '[style]': 'isHeadless() ? undefined : hostStyle()',
    '[animate.leave]': '"leave"',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp()',
    '(pointercancel)': 'onPointerCancel()',
    '(pointerenter)': 'onPointerEnter()',
    '(pointerleave)': 'onPointerLeave()',
  },
  template: `
    @if (toast()?.html) {
      <div class="toast-custom" [innerHTML]="toast()!.html!"></div>
    } @else if (toast()?.component) {
      <ng-container *ngComponentOutlet="toast()!.component!; inputs: componentOutletInputs()" />
    } @else {
      @if (shouldShowIconColumn()) {
        <span class="toast-icon" aria-hidden="true">
          @if (toast()?.icon) {
            <ng-container *ngComponentOutlet="toast()!.icon!" />
          } @else if (iconComponent(); as IconCmp) {
            <ng-container *ngComponentOutlet="IconCmp" />
          } @else {
            @switch (variant()) {
              @case ('success') {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.75"
                  />
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.75"
                    d="M8.48 12.22 10.9 14.64 15.74 9.14"
                  />
                </svg>
              }
              @case ('error') {
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
              }
              @case ('info') {
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              }
              @case ('warning') {
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.75"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              }
              @case ('loading') {
                <div class="toast-icon-loading" aria-hidden="true"></div>
              }
              @case ('default') {}
            }
          }
        </span>
      }

      <p class="msg" [class]="resolvedClassNames()?.message">{{ toast()?.message }}</p>

      @if (toast()?.toastAction; as rowAction) {
        @switch (rowAction.role) {
          @case ('action') {
            <button
              type="button"
              class="toast-row-btn action-btn"
              [class]="resolvedClassNames()?.actionButton"
              [attr.data-row-btn]="rowAction.role"
              (pointerdown)="onRowButtonPointerDown($event)"
              (click)="onToastRowClick($event)"
            >
              {{ rowAction.label }}
            </button>
          }
          @case ('cancel') {
            <button
              type="button"
              class="toast-row-btn cancel-btn"
              [class]="resolvedClassNames()?.cancelButton"
              [attr.data-row-btn]="rowAction.role"
              (pointerdown)="onRowButtonPointerDown($event)"
              (click)="onToastRowClick($event)"
            >
              {{ rowAction.label }}
            </button>
          }
        }
      }
    }

    @if (closeButton() && !isHeadless()) {
      <button
        type="button"
        class="close-btn"
        [class]="resolvedClassNames()?.closeButton"
        (click)="toaster.dismiss(toast()?.id ?? '')"
        [attr.aria-label]="dismissButtonAriaLabel()"
      >
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.75"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    }
  `,
  styleUrl: './toast-item.css',
})
export class BetterToastItem {
  /** Shared toaster service (e.g. dismiss from the close button). */
  protected readonly toaster = inject(ToasterService);

  /** Host element ref used to read `offsetHeight` after the first render. */
  protected readonly host = inject(ElementRef);

  /** Toast payload (message, id, variant from the service). */
  toast = input<ToasterItem>();

  /**
   * Styles from `<app-toaster [toastOptions]>`; merged with {@link ToasterItem.style} so per-toast keys win.
   */
  toasterStyle = input<Record<string, string | number | undefined> | undefined>();

  /**
   * Classes from `<app-toaster [toastOptions]>` — same shape as {@link ToasterToastOptions.classNames}.
   * Merged with {@link ToasterItem.classNames}; per-toast keys replace the same keys from the toaster.
   * Styles for those classes usually need **`!important`** to override the library’s encapsulated CSS; see {@link ToastChromeClassNames}.
   */
  toasterClassNames = input<ToastChromeClassNames | undefined>();

  /** Which icon and color treatment to show for this row. */
  variant = input<ToastVariant>('default');

  /** Merged inline styles for the toast (`[toastOptions].style` then per-toast `style`). */
  protected readonly hostStyle = computed(() =>
    mergeToastHostStyles(this.toasterStyle(), this.toast()?.style),
  );

  /** Merged `[class]` strings (`[toastOptions].classNames` then per-toast `classNames`). */
  protected readonly resolvedClassNames = computed(() =>
    mergeToastClassNames(this.toasterClassNames(), this.toast()?.classNames),
  );

  /**
   * Per-variant icon overrides from `<app-toaster [icons]>`.
   * Each override must be a standalone component whose template includes the SVG artwork.
   */
  customIcons = input<ToasterIcons | undefined>();

  /** Resolved standalone SVG icon component from `[icons]`, if any (not `null`). */
  protected readonly iconComponent = computed(() => {
    const customIcon = this.customIcons()?.[this.variant()];
    if (customIcon === null) {
      return undefined;
    }
    return customIcon;
  });

  /**
   * Renders the icon column unless the toast or `[icons]` opts out with `icon: null` / a `null` entry for that variant.
   * The `default` variant has no built-in icon: the column appears only with a per-toast `icon` or `[icons].default`.
   */
  protected readonly shouldShowIconColumn = computed(() => {
    const toast = this.toast();

    if (!toast) return false;
    if (toast.icon === null) return false;

    const toastVariant = toast.variant;
    if (toastVariant === 'default') {
      if (toast.icon != null) {
        return true;
      }
      const defaultIcon = this.customIcons()?.default;
      if (defaultIcon === null) {
        return false;
      }
      return defaultIcon !== undefined;
    }

    if (toast.icon != null) {
      return true;
    }

    if (this.customIcons()?.[toastVariant] === null) {
      return false;
    }

    return true;
  });

  /** Vertical stack offset in px; bound to `--offset` on the host for layout. */
  offset = input.required<number>();

  /** Bound to {@link ToasterItem.componentInputs} for headless (`NgComponentOutlet`) toasts. */
  protected readonly componentOutletInputs = computed(
    (): Record<string, unknown> => this.toast()?.componentInputs ?? {},
  );

  /** When true, host uses no default toast chrome (border, padding, surface) — only stack + motion. */
  protected readonly isHeadless = computed(() => this.toast()?.component != null);

  /** When false, the dismiss control is not rendered (toasts may still auto-dismiss or be cleared via the service). */
  closeButton = input(true);

  /**
   * `aria-label` for the dismiss control; set from `<better-toaster [accessibilityLabels]>`.
   * Default {@link DEFAULT_TOASTER_ARIA_DISMISS_BUTTON}.
   */
  dismissButtonAriaLabel = input<string>(DEFAULT_TOASTER_ARIA_DISMISS_BUTTON);

  /** Stack anchor from `<better-toaster [position]>` — drives swipe axis and `data-swipe-direction`. */
  stackPosition = input<ToasterPosition>('bottom-right');

  /** `down` when anchored to the bottom (dismiss by swiping down), `up` when anchored to the top. */
  protected readonly swipeDirection = computed(() =>
    swipeDirectionForPosition(this.stackPosition()),
  );

  /** Emits the measured host height in px once after the first render so the parent can stack siblings. */
  heightChange = output<number>();

  constructor() {
    afterNextRender(() => {
      const height = this.host.nativeElement.offsetHeight;
      this.heightChange.emit(height);
    });
  }

  /** True once the user has passed the drag threshold and is actively swiping. */
  isDragging = signal(false);
  private tracking = false;
  private startY = 0;
  private pointerId = -1;
  private readonly dragStartThreshold = 0;
  private readonly swipeCloseThreshold = 30;

  /** Transform applied when swipe-dismiss completes (matches leave direction / headless centering). */
  protected readonly swipeDismissTransform = computed(() => {
    const pos = this.stackPosition();
    const down = this.swipeDirection() === 'down';
    const y = down ? '130%' : '-130%';
    if (this.isHeadless() && (pos === 'bottom-center' || pos === 'top-center')) {
      return `translateX(-50%) translateY(${y})`;
    }
    return `translateY(${y})`;
  });

  /** Prevents swipe-to-dismiss from starting when pressing the row action / cancel control. */
  onRowButtonPointerDown(event: PointerEvent): void {
    event.stopPropagation();
  }

  onToastRowClick(event: Event): void {
    const toast = this.toast();
    toast?.toastAction?.onClick(event);
    if (event.defaultPrevented) return;
    this.toaster.dismiss(toast?.id ?? '');
  }

  onPointerEnter() {
    const id = this.toast()?.id;
    if (id) {
      this.toaster.pauseAutoDismiss(id);
    }
  }

  onPointerLeave() {
    const id = this.toast()?.id;
    if (id) {
      this.toaster.resumeAutoDismiss(id);
    }
  }

  onPointerDown(event: PointerEvent) {
    this.tracking = true;
    this.startY = event.clientY;
    this.pointerId = event.pointerId;
  }

  onPointerMove(event: PointerEvent) {
    if (!this.tracking && !this.isDragging()) return;

    const el = this.host.nativeElement;
    const rawDy = event.clientY - this.startY;
    const down = this.swipeDirection() === 'down';
    const dragDy = down ? Math.max(0, rawDy) : Math.min(0, rawDy);

    if (!this.isDragging()) {
      const passed =
        this.dragStartThreshold > 0
          ? down
            ? rawDy >= this.dragStartThreshold
            : rawDy <= -this.dragStartThreshold
          : down
            ? rawDy > 0
            : rawDy < 0;
      if (passed) {
        this.isDragging.set(true);
        el.setPointerCapture(this.pointerId);
      }
      return;
    }

    el.style.translate = `0 ${dragDy}px`;
  }

  onPointerUp() {
    this.tracking = false;

    if (!this.isDragging()) return;
    this.isDragging.set(false);

    const el = this.host.nativeElement;
    const id = this.toast()?.id ?? '';

    const dy = parseFloat(el.style.translate?.split(' ')[1]) || 0;

    try {
      el.releasePointerCapture(this.pointerId);
    } catch {
      /* pointer already released */
    }

    const down = this.swipeDirection() === 'down';
    const shouldDismiss = down ? dy >= this.swipeCloseThreshold : dy <= -this.swipeCloseThreshold;

    if (shouldDismiss) {
      el.style.transform = this.swipeDismissTransform();
      this.toaster.dismiss(id);
    } else {
      el.style.transition = 'translate 400ms ease';
      el.style.translate = '0 0';
      const cleanup = () => {
        el.style.transition = '';
        el.style.translate = '';
      };
      el.addEventListener('transitionend', cleanup, { once: true });
      setTimeout(cleanup, 450);
    }
  }

  onPointerCancel() {
    this.tracking = false;

    if (!this.isDragging()) return;
    this.isDragging.set(false);

    const el = this.host.nativeElement;
    el.style.translate = '';

    try {
      el.releasePointerCapture(this.pointerId);
    } catch {
      /* pointer already released */
    }
  }
}

/**
 * Renders the toaster stack. Add once near the root of your app (e.g. in `App`).
 * Variant-colored surfaces are off by default; set `[richColors]="true"` to enable them.
 * Set `[duration]` for auto-dismiss when service helpers omit their duration argument.
 * Use **`duration="Infinity"`** (that exact literal) or `[duration]="…"` with a number / {@link TOAST_DURATION_MANUAL_DISMISS} for persist until dismissed; `0` still works.
 * Pass `[icons]` with optional **standalone** components for `default` / `success` / `error` / `info` / `warning` / `loading`:
 * replace the default artwork (or add an icon for the neutral `default` variant), or use **`null`** to hide that variant’s icon.
 * Each component should render an **SVG** (import its class where you configure `[icons]`).
 * Set `[closeButton]="false"` to hide the per-toast dismiss button.
 * Set `[accessibilityLabels]` to override default English `aria-label` strings (live region and dismiss control).
 * Set `[offset]` for `--toast-offset-*` and `[mobileOffset]` for `--toast-offset-mobile-*` (string all sides, or per-side object).
 * {@link ToasterService.action} / {@link ToasterService.cancel} render a message plus one text button (no icon column).
 */
@Component({
  selector: 'better-toaster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BetterToastItem],
  template: `
    <section
      [attr.aria-label]="notificationsRegionAriaLabel()"
      tabindex="-1"
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
    >
      <ol
        class="toast-container"
        [style.--toast-offset-top]="offsetTop()"
        [style.--toast-offset-right]="offsetRight()"
        [style.--toast-offset-bottom]="offsetBottom()"
        [style.--toast-offset-left]="offsetLeft()"
        [style.--toast-offset-mobile-top]="mobileOffsetTop()"
        [style.--toast-offset-mobile-right]="mobileOffsetRight()"
        [style.--toast-offset-mobile-bottom]="mobileOffsetBottom()"
        [style.--toast-offset-mobile-left]="mobileOffsetLeft()"
        [attr.data-position]="position()"
        [attr.data-rich-colors]="richColors()"
        tabindex="-1"
      >
        @for (toast of toaster.toasts(); track toast.id) {
          <li
            betterToastItem
            [toast]="toast"
            [toasterStyle]="toastOptions()?.style"
            [toasterClassNames]="toastOptions()?.classNames"
            [variant]="toast.variant"
            [customIcons]="icons()"
            [offset]="offsets()[toast.id]"
            [closeButton]="closeButton()"
            [dismissButtonAriaLabel]="dismissButtonAriaLabel()"
            [stackPosition]="position()"
            (heightChange)="onHeightChange(toast.id, $event)"
            [attr.data-position]="position()"
            [attr.data-rich-colors]="richColors()"
          ></li>
        }
      </ol>
    </section>
  `,
  styleUrl: './toaster.css',
})
export class BetterToaster {
  protected readonly toaster = inject(ToasterService);

  /** Where the stack is anchored on the viewport. */
  readonly position = input<ToasterPosition>('bottom-right');

  /**
   * Viewport inset for the toast stack: a single CSS value for all sides, or an object with any of `top` / `right` / `bottom` / `left`.
   * Binds `--toast-offset-top` / `right` / `bottom` / `left` on `.toast-container`.
   */
  readonly offset = input<ToasterOffset | undefined>(undefined);

  /**
   * Viewport inset for narrow layouts: binds `--toast-offset-mobile-top` / `right` / `bottom` / `left` on `.toast-container`.
   * Same shape as {@link offset}.
   */
  readonly mobileOffset = input<ToasterOffset | undefined>(undefined);

  /** When true, success/error/info/warning use semantic background and border colors. */
  readonly richColors = input(false);

  /**
   * Default auto-dismiss time in ms for `show` / `success` / `error` / `info` / `warning` when the second argument omits `durationMs`.
   * Bind **`duration="Infinity"`** (literal only) or a numeric ms value via `[duration]`; {@link TOAST_DURATION_MANUAL_DISMISS} is accepted as a number.
   * `0` still works. Does not apply to `loading()`. Defaults to the library default (4000ms).
   */
  readonly durationMs = input<number, ToasterDuration>(DEFAULT_TOAST_DURATION_MS, {
    alias: 'duration',
    transform: parseToasterDurationMs,
  });

  /**
   * Optional per-variant **standalone** components that replace the default SVG (or loading indicator).
   * Import each icon component in the host and pass its class here; each one should render an SVG
   * (e.g. root `<svg>` with `stroke="currentColor"` / `fill="currentColor"` where appropriate).
   * Omitted keys keep the built-in icons (the `default` variant has none unless you set `default` here).
   * **`null`** for a variant hides that variant’s icon.
   */
  readonly icons = input<ToasterIcons | undefined>();

  /**
   * Defaults for every toast — shape is {@link ToasterToastOptions}.
   *
   * - **`style`** — merged onto each toast host with per-toast {@link ToastOptions.style}; identical keys from the service call win.
   * - **`classNames`** — extra classes on host / `.msg` / `.close-btn` / row buttons via **`[class]`**; see {@link ToasterToastOptions.classNames} (**`!important`** is usually required for overrides). Per-toast {@link ToastOptions.classNames} replaces host/message/close keys; row overrides come from {@link ToasterService.action} / {@link ToasterService.cancel}.
   */
  readonly toastOptions = input<ToasterToastOptions | undefined>();

  /** When true (default), each toast shows a dismiss button; set to false to hide it. */
  readonly closeButton = input(true);

  /**
   * Overrides for built-in English `aria-label` values (live region and per-toast dismiss).
   * Omitted keys keep {@link DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION} and {@link DEFAULT_TOASTER_ARIA_DISMISS_BUTTON}.
   */
  readonly accessibilityLabels = input<ToasterAccessibilityLabels | undefined>();

  /** Measured height in px per toast id, updated when a toast item reports `heightChange`. */
  readonly heights = signal<Record<string, number>>({} as Record<string, number>);

  /** Resolved `aria-label` for the outer `<section>` live region. */
  protected readonly notificationsRegionAriaLabel = computed(
    () =>
      this.accessibilityLabels()?.notificationsRegion ??
      DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION,
  );

  /** Resolved `aria-label` for each toast’s dismiss control. */
  protected readonly dismissButtonAriaLabel = computed(
    () => this.accessibilityLabels()?.dismissButton ?? DEFAULT_TOASTER_ARIA_DISMISS_BUTTON,
  );

  protected readonly offsetTop = computed(() => resolveToasterOffsetSide(this.offset(), 'top'));
  protected readonly offsetRight = computed(() => resolveToasterOffsetSide(this.offset(), 'right'));
  protected readonly offsetBottom = computed(() =>
    resolveToasterOffsetSide(this.offset(), 'bottom'),
  );
  protected readonly offsetLeft = computed(() => resolveToasterOffsetSide(this.offset(), 'left'));

  protected readonly mobileOffsetTop = computed(() =>
    resolveToasterOffsetSide(this.mobileOffset(), 'top'),
  );
  protected readonly mobileOffsetRight = computed(() =>
    resolveToasterOffsetSide(this.mobileOffset(), 'right'),
  );
  protected readonly mobileOffsetBottom = computed(() =>
    resolveToasterOffsetSide(this.mobileOffset(), 'bottom'),
  );
  protected readonly mobileOffsetLeft = computed(() =>
    resolveToasterOffsetSide(this.mobileOffset(), 'left'),
  );

  /**
   * Vertical offset in px for each toast id so stacked toasts do not overlap.
   * Walks newest-to-oldest (end of the list first): the latest toast has offset 0; each older toast sits above by the sum of heights below plus the inter-toast gap.
   */
  readonly offsets = computed(() => {
    const toastsList = this.toaster.toasts();
    const heights = this.heights();
    const result: Record<string, number> = {};
    let cumulative = 0;

    for (let i = toastsList.length - 1; i >= 0; i--) {
      const toast = toastsList[i];
      result[toast.id] = cumulative;
      cumulative += (heights[toast.id] ?? 0) + GAP;
    }

    return result;
  });

  /** Merges a toast item’s reported height into `heights` so `offsets` can recompute. */
  onHeightChange(toastId: string, height: number) {
    this.heights.update((h) => ({ ...h, [toastId]: height }));
  }

  constructor() {
    effect(() => {
      this.toaster.setDefaultDurationMs(this.durationMs());
    });
  }
}
