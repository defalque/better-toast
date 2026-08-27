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
  OnInit,
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
  type ToasterTheme,
  type ToasterToastOptions,
  type ToastOptions,
  type ToastVariant,
} from './toaster.types';

const GAP = 16;
/**
 * Visible layers in the collapsed stack. Older toasts stay in the list and appear on hover.
 * CSS hides the rest with `:nth-last-child(n + 4)` — keep that selector in sync.
 */
const VISIBLE_TOASTS = 3;

function swipeDirectionForPosition(position: ToasterPosition): 'down' | 'up' {
  return position.startsWith('bottom') ? 'down' : 'up';
}

/** True when the event target is a toast row (not the list itself, which can steal focus on dismiss). */
function isInsideToastItem(target: EventTarget | null): boolean {
  if (target instanceof Element) {
    return target.closest('.toast') != null;
  }
  if (target instanceof Node && target.parentElement) {
    return target.parentElement.closest('.toast') != null;
  }
  return false;
}

/**
 * Touch and pen pointers do not hover. `pointerleave` fires on lift, which would collapse
 * the stack before a second tap can reach a toast behind the front card.
 */
function isNonHoverPointer(event: PointerEvent): boolean {
  return event.pointerType === 'touch' || event.pointerType === 'pen';
}

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

/** Newest measured height in the stack. Skips the front toast until it has been measured. */
function resolveFrontToastHeightPx(
  toasts: readonly { readonly id: string }[],
  heights: Record<string, number>,
): number | undefined {
  for (let i = toasts.length - 1; i >= 0; i--) {
    const height = heights[toasts[i].id];
    if (height) {
      return height;
    }
  }
  return undefined;
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
    '[attr.data-theme]': 'theme()',
    '[style.--initial-height]': 'initialHeightCss()',
    '[style]': 'isHeadless() ? undefined : hostStyle()',
    '[animate.leave]': '"leave"',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp()',
    '(pointercancel)': 'onPointerCancel()',
    '(pointerenter)': 'onPointerEnter()',
    '(pointerleave)': 'onPointerLeave($event)',
  },
  template: `
    @if (toast()?.component) {
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
                <svg fill="none" viewBox="0 0 24 24">
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
                  fill="none"
                  viewBox="0 0 24 24"
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
                  fill="none"
                  viewBox="0 0 24 24"
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
                <svg fill="none" viewBox="0 0 24 24">
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
                <div class="toast-icon-loading"></div>
              }
            }
          }
        </span>
      }

      @if (hasDescription()) {
        <div class="stack">
          @if (toast()?.contentComponent) {
            <div class="msg" [class]="resolvedClassNames()?.message">
              <ng-container
                *ngComponentOutlet="
                  toast()!.contentComponent!;
                  inputs: contentComponentOutletInputs()
                "
              />
            </div>
          } @else {
            <p class="msg" [class]="resolvedClassNames()?.message">{{ toast()?.message }}</p>
          }
          @if (toast()?.description) {
            <p class="description" [class]="resolvedClassNames()?.description">
              {{ toast()!.description }}
            </p>
          }
        </div>
      } @else {
        @if (toast()?.contentComponent) {
          <div class="msg" [class]="resolvedClassNames()?.message">
            <ng-container
              *ngComponentOutlet="
                toast()!.contentComponent!;
                inputs: contentComponentOutletInputs()
              "
            />
          </div>
        } @else {
          <p class="msg" [class]="resolvedClassNames()?.message">{{ toast()?.message }}</p>
        }
      }

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

    @if (showCloseButton()) {
      <button
        type="button"
        class="close-btn"
        [class]="resolvedClassNames()?.closeButton"
        [animate.enter]="closeButtonEnterClass()"
        [animate.leave]="closeButtonLeaveClass()"
        (click)="toaster.dismiss(toast()?.id ?? '')"
        [attr.aria-label]="dismissButtonAriaLabel()"
      >
        <svg fill="none" viewBox="0 0 24 24" aria-hidden="true">
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
  /** When false, the dismiss control is not rendered (toasts may still auto-dismiss or be cleared via the service). */
  closeButton = input(true);
  /**
   * Per-variant icon overrides from `<app-toaster [icons]>`.
   * Each override must be a standalone component whose template includes the SVG artwork.
   */
  customIcons = input<ToasterIcons | undefined>();
  /**
   * `aria-label` for the dismiss control; set from `<better-toaster [accessibilityLabels]>`.
   * Default {@link DEFAULT_TOASTER_ARIA_DISMISS_BUTTON}.
   */
  dismissButtonAriaLabel = input<string>(DEFAULT_TOASTER_ARIA_DISMISS_BUTTON);
  /** Stack anchor from `<better-toaster [position]>` — drives swipe axis and `data-swipe-direction`. */
  stackPosition = input<ToasterPosition>('bottom-right');
  /** True while the stack is hovered or focus is inside it (expanded layout). */
  stackExpanded = input(false);
  /** True when this toast is the newest (front) layer in the stack. */
  stackFront = input(false);
  /** Tells the parent whether the pointer is still over the toast stack. */
  stackHover = output<boolean>();
  /**
   * Color palette from `<better-toaster [theme]>`; mirrored on the host as `data-theme`
   * so item-scoped CSS can react to the chosen mode without `:host-context()`.
   */
  theme = input<ToasterTheme>('system');
  /** Emits the measured host height in px once after the first render so the parent can stack siblings. */
  heightChange = output<number>();
  /** Natural host height in px, captured once after first paint (used to restore height on expand). */
  private readonly initialHeight = signal<number | undefined>(undefined);
  /** Bound as `--initial-height` so collapsed layers can return to their own size. */
  protected readonly initialHeightCss = computed(() => {
    const height = this.initialHeight();
    return height ? `${height}px` : null;
  });

  /**
   * Stacked title + optional secondary line: {@link ToastVariant} **`description`**, or any variant with
   * non-empty {@link ToasterItem.description} ({@link ToastOptions.description} on `show` / `success` / etc.).
   */
  protected readonly hasDescription = computed(() => {
    const toast = this.toast();
    if (!toast) return false;
    if (toast.variant === 'description') return true;
    return !!toast.description?.trim();
  });
  /** Merged inline styles for the toast (`[toastOptions].style` then per-toast `style`). */
  protected readonly hostStyle = computed(() =>
    mergeToastHostStyles(this.toasterStyle(), this.toast()?.style),
  );
  /** Merged `[class]` strings (`[toastOptions].classNames` then per-toast `classNames`). */
  protected readonly resolvedClassNames = computed(() =>
    mergeToastClassNames(this.toasterClassNames(), this.toast()?.classNames),
  );
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
    if (toastVariant === 'default' || toastVariant === 'description') {
      if (toast.icon != null) {
        return true;
      }
      const neutralIcon =
        toastVariant === 'default'
          ? this.customIcons()?.default
          : (this.customIcons()?.description ?? this.customIcons()?.default);
      if (neutralIcon === null) {
        return false;
      }
      return neutralIcon !== undefined;
    }

    if (toast.icon != null) {
      return true;
    }

    if (this.customIcons()?.[toastVariant] === null) {
      return false;
    }

    return true;
  });
  /** Bound to {@link ToasterItem.componentInputs} for headless (`NgComponentOutlet`) toasts. */
  protected readonly componentOutletInputs = computed(
    (): Record<string, unknown> => this.toast()?.componentInputs ?? {},
  );
  /** Bound to {@link ToasterItem.contentComponentInputs} for {@link ToasterService.custom} body components. */
  protected readonly contentComponentOutletInputs = computed(
    (): Record<string, unknown> => this.toast()?.contentComponentInputs ?? {},
  );
  /** When true, host uses no default toast chrome (border, padding, surface) — only stack + motion. */
  protected readonly isHeadless = computed(() => this.toast()?.component != null);
  /**
   * Dismiss control stays on the front toast. Stacked toasts mount it only while the stack is
   * expanded so `animate.enter` / `animate.leave` can run without moving the front control.
   */
  protected readonly showCloseButton = computed(
    () => this.closeButton() && !this.isHeadless() && (this.stackFront() || this.stackExpanded()),
  );
  /** Enter class for stacked close buttons; the front control does not animate in. */
  protected readonly closeButtonEnterClass = computed(() =>
    this.stackFront() ? null : 'close-enter',
  );
  /** Leave class for stacked close buttons; the front control does not animate out. */
  protected readonly closeButtonLeaveClass = computed(() =>
    this.stackFront() ? null : 'close-leave',
  );
  /** `down` when anchored to the bottom (dismiss by swiping down), `up` when anchored to the top. */
  protected readonly swipeDirection = computed(() =>
    swipeDirectionForPosition(this.stackPosition()),
  );

  /**
   * Emits the measured host height in px once after the first render so the parent can stack siblings.
   */
  constructor() {
    afterNextRender(() => {
      const height = this.host.nativeElement.offsetHeight;
      this.initialHeight.set(height);
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
  /**
   * Dismisses the toast when the row action / cancel control is clicked.
   * @param event - The event object.
   */
  onToastRowClick(event: Event): void {
    const toast = this.toast();
    toast?.toastAction?.onClick(event);
    if (event.defaultPrevented) return;
    this.toaster.dismiss(toast?.id ?? '');
  }

  /**
   * Pauses auto-dismiss when the pointer enters the toast.
   */
  onPointerEnter() {
    this.stackHover.emit(true);
    const id = this.toast()?.id;
    if (id) {
      this.toaster.pauseAutoDismiss(id);
    }
  }
  /**
   * Resumes auto-dismiss when a hover pointer leaves the toast stack.
   * Moving onto a sibling toast keeps the stack expanded.
   * Touch/pen leave is ignored: the stack stays expanded until a tap outside.
   */
  onPointerLeave(event: PointerEvent) {
    if (isNonHoverPointer(event)) {
      return;
    }
    const stillInStack = isInsideToastItem(event.relatedTarget);
    this.stackHover.emit(stillInStack);
    if (stillInStack || this.stackExpanded()) {
      return;
    }
    const id = this.toast()?.id;
    if (id) {
      this.toaster.resumeAutoDismiss(id);
    }
  }
  /**
   * Starts tracking the pointer down event.
   * @param event - The pointer down event object.
   */
  onPointerDown(event: PointerEvent) {
    if (this.variant() === 'loading') {
      return;
    }
    this.tracking = true;
    this.startY = event.clientY;
    this.pointerId = event.pointerId;
  }
  /**
   * Updates the toast position when the pointer moves.
   * @param event - The pointer move event object.
   */
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
  /**
   * Ends tracking the pointer up event and dismisses the toast if the pointer has moved beyond the swipe threshold.
   */
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
  /**
   * Ends tracking the pointer cancel event and resets the toast position.
   */
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
 * With `[stacked]="true"` (default), extra toasts collapse into a 3-layer card stack (latest in front); hover, focus, or a press on touch expands the full list.
 * Set `[stacked]="false"` to keep every toast fully visible, spaced by height plus gap.
 * Variant-colored surfaces are off by default; set `[richColors]="true"` to enable them.
 * Set `[duration]` for auto-dismiss when service helpers omit their duration argument.
 * Use **`duration="Infinity"`** (that exact literal) or `[duration]="…"` with a number / {@link TOAST_DURATION_MANUAL_DISMISS} for persist until dismissed; `0` still works.
 * Pass `[icons]` with optional **standalone** components for `default` / `description` / `success` / `error` / `info` / `warning` / `loading`:
 * replace the default artwork (or add an icon for the neutral `default` variant), or use **`null`** to hide that variant’s icon.
 * Each component should render an **SVG** (import its class where you configure `[icons]`).
 * Set `[closeButton]="false"` to hide the per-toast dismiss button.
 * Set `[accessibilityLabels]` to override default English `aria-label` strings (live region and dismiss control).
 * Set `[offset]` for `--toast-offset-*` and `[mobileOffset]` for `--toast-offset-mobile-*` (string all sides, or per-side object).
 * Set `[theme]` to `light`, `dark`, or `system` (default): semantic colors follow the chosen mode; `system` uses `prefers-color-scheme`.
 * {@link ToasterService.action} / {@link ToasterService.cancel} render a message plus one text button (no icon column).
 */
@Component({
  selector: 'better-toaster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BetterToastItem],
  host: {
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
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
        [style.--toast-gap]="stackGapPx + 'px'"
        [style.--front-toast-height]="frontToastHeightCss()"
        [attr.data-position]="position()"
        [attr.data-rich-colors]="richColors()"
        [attr.data-theme]="theme()"
        [attr.data-stacked]="stacked() ? 'true' : 'false'"
        [attr.data-expanded]="layoutExpanded() ? 'true' : 'false'"
        tabindex="-1"
        (focusin)="onStackFocusIn($event)"
        (focusout)="onStackFocusOut($event)"
      >
        @for (toast of toaster.toasts(); track toast.id) {
          <li
            betterToastItem
            [toast]="toast"
            [toasterStyle]="toastOptions()?.style"
            [toasterClassNames]="toastOptions()?.classNames"
            [variant]="toast.variant"
            [customIcons]="icons()"
            [closeButton]="closeButton()"
            [dismissButtonAriaLabel]="dismissButtonAriaLabel()"
            [stackPosition]="position()"
            [stackExpanded]="layoutExpanded()"
            [stackFront]="$last"
            [theme]="theme()"
            (heightChange)="onHeightChange(toast.id, $event)"
            (stackHover)="onItemStackHover($event)"
            [style.--index]="$count - 1 - $index"
            [style.--offset]="toastOffsetCss(toast.id)"
            [attr.data-position]="position()"
            [attr.data-rich-colors]="richColors()"
            [attr.data-expanded]="layoutExpanded() ? 'true' : 'false'"
            [attr.data-front]="$last ? 'true' : null"
            [attr.aria-hidden]="hiddenToastIds().has(toast.id) ? 'true' : null"
            [attr.inert]="hiddenToastIds().has(toast.id) ? true : null"
          ></li>
        }
      </ol>
    </section>
  `,
  styleUrl: './toaster.css',
})
export class BetterToaster implements OnInit {
  protected readonly toaster = inject(ToasterService);

  /**
   * Default auto-dismiss time in ms for `show` / `success` / `error` / `info` / `warning` when the second argument omits `durationMs`.
   * Bind **`duration="Infinity"`** (literal only) or a numeric ms value via `[duration]`; {@link TOAST_DURATION_MANUAL_DISMISS} is accepted as a number.
   * `0` still works. Does not apply to `loading()`. Defaults to the library default (4000ms).
   */
  readonly durationMs = input<number, ToasterDuration>(DEFAULT_TOAST_DURATION_MS, {
    alias: 'duration',
    transform: (value) => {
      const durationMs = parseToasterDurationMs(value);
      this.toaster.setDefaultDurationMs(durationMs);
      return durationMs;
    },
  });
  /** Where the stack is anchored on the viewport. */
  readonly position = input<ToasterPosition>('bottom-right');
  /**
   * When true (default), extra toasts collapse into a 3-layer card stack; hover, focus, or a press on touch expands the list.
   * When false, every toast stays fully visible, spaced by measured height plus gap.
   */
  readonly stacked = input(true);
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
  /**
   * When true, success/error/info/warning use semantic background and border colors.
   */
  readonly richColors = input(false);
  /**
   * Color palette for the stack. `system` (default) follows `prefers-color-scheme`; `light` / `dark` pin the palette regardless of OS.
   * Reflected as `data-theme` on the toast container (`<ol class="toast-container">`).
   */
  readonly theme = input<ToasterTheme>('system');
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
   * - **`classNames`** — extra classes on host / `.msg` / `.description` / `.close-btn` / row buttons via **`[class]`**; see {@link ToasterToastOptions.classNames} (**`!important`** is usually required for overrides). Per-toast {@link ToastOptions.classNames} replaces host/message/close keys; row overrides come from {@link ToasterService.action} / {@link ToasterService.cancel}.
   */
  readonly toastOptions = input<ToasterToastOptions | undefined>();
  /** When true, each toast shows a dismiss button. */
  readonly closeButton = input(true);
  /**
   * Overrides for built-in English `aria-label` values (live region and per-toast dismiss).
   * Omitted keys keep {@link DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION} and {@link DEFAULT_TOASTER_ARIA_DISMISS_BUTTON}.
   */
  readonly accessibilityLabels = input<ToasterAccessibilityLabels | undefined>();

  /** Measured height in px per toast id, updated when a toast item reports `heightChange`. */
  readonly heights = signal<Record<string, number>>({} as Record<string, number>);
  /** Gap between expanded toasts; kept in sync with layout math and the CSS hit-area. */
  protected readonly stackGapPx = GAP;
  /** Height of the newest measured toast, used so collapsed layers share one silhouette. */
  protected readonly frontToastHeightCss = computed(() => {
    const height = resolveFrontToastHeightPx(this.toaster.toasts(), this.heights());
    return height ? `${height}px` : null;
  });
  /** Pointer is over a toast (or moving between toasts in the stack). */
  private readonly hovering = signal(false);
  /** Keyboard focus is inside the toast list. */
  private readonly focusWithin = signal(false);
  /** Hover or focus: expands a stacked list and pauses auto-dismiss. */
  protected readonly expanded = computed(() => this.hovering() || this.focusWithin());
  /** Layout uses the expanded list while stacked is off, or while the stack is hovered / focused. */
  protected readonly layoutExpanded = computed(() => !this.stacked() || this.expanded());

  constructor() {
    effect(() => {
      if (this.toaster.toasts().length === 0) {
        this.hovering.set(false);
        this.focusWithin.set(false);
      }
    });
    effect(() => {
      if (!this.expanded()) {
        return;
      }
      for (const toast of this.toaster.toasts()) {
        this.toaster.pauseAutoDismiss(toast.id);
      }
    });
  }

  /** Resolved `aria-label` for the outer `<section>` live region. */
  protected readonly notificationsRegionAriaLabel = computed(
    () =>
      this.accessibilityLabels()?.notificationsRegion ?? DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION,
  );
  /** Resolved `aria-label` for each toast’s dismiss control. */
  protected readonly dismissButtonAriaLabel = computed(
    () => this.accessibilityLabels()?.dismissButton ?? DEFAULT_TOASTER_ARIA_DISMISS_BUTTON,
  );

  /** Vertical offset in px for the toast stack. */
  protected readonly offsetTop = computed(() => resolveToasterOffsetSide(this.offset(), 'top'));
  /** Horizontal offset in px for the toast stack. */
  protected readonly offsetRight = computed(() => resolveToasterOffsetSide(this.offset(), 'right'));
  /** Vertical offset in px for the toast stack. */
  protected readonly offsetBottom = computed(() =>
    resolveToasterOffsetSide(this.offset(), 'bottom'),
  );
  /** Horizontal offset in px for the toast stack. */
  protected readonly offsetLeft = computed(() => resolveToasterOffsetSide(this.offset(), 'left'));

  /** Vertical offset in px for the toast stack on narrow layouts. */
  protected readonly mobileOffsetTop = computed(() =>
    resolveToasterOffsetSide(this.mobileOffset(), 'top'),
  );
  /** Horizontal offset in px for the toast stack on narrow layouts. */
  protected readonly mobileOffsetRight = computed(() =>
    resolveToasterOffsetSide(this.mobileOffset(), 'right'),
  );
  /** Vertical offset in px for the toast stack on narrow layouts. */
  protected readonly mobileOffsetBottom = computed(() =>
    resolveToasterOffsetSide(this.mobileOffset(), 'bottom'),
  );
  /** Horizontal offset in px for the toast stack on narrow layouts. */
  protected readonly mobileOffsetLeft = computed(() =>
    resolveToasterOffsetSide(this.mobileOffset(), 'left'),
  );

  /**
   * `--index` is the stack depth: last item is 0 (front), older items count up.
   * Collapsed peek, scale, front, and hidden layers are CSS from that index / `:last-child`.
   * Expanded offset still needs measured heights: each toast sits at the sum of those in front plus gap.
   */
  protected readonly expandedOffsets = computed(() => {
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

  /** Oldest toasts past the 3 visible collapsed layers. */
  protected readonly hiddenToastIds = computed(() => {
    if (this.layoutExpanded()) {
      return new Set<string>();
    }
    const toasts = this.toaster.toasts();
    const hidden = new Set<string>();
    const cutoff = toasts.length - VISIBLE_TOASTS;
    for (let i = 0; i < cutoff; i++) {
      hidden.add(toasts[i].id);
    }
    return hidden;
  });

  /** Expanded stack only: measured height + gap. Collapsed `--offset` comes from `--index` in CSS. */
  protected toastOffsetCss(toastId: string): string | null {
    if (!this.layoutExpanded()) {
      return null;
    }
    return `${this.expandedOffsets()[toastId] ?? 0}px`;
  }

  /** Merges a toast item’s reported height into `heights` so expanded offsets can recompute. */
  onHeightChange(toastId: string, height: number) {
    this.heights.update((h) => ({ ...h, [toastId]: height }));
  }

  /** Expands the stack and pauses auto-dismiss while the pointer is over any toast. */
  onItemStackHover(hovering: boolean): void {
    this.hovering.set(hovering);
    if (hovering || this.focusWithin()) {
      this.pauseAllAutoDismiss();
    } else {
      this.resumeAllAutoDismiss();
    }
  }

  /**
   * Collapses a touch/pen sticky expand when the next press is outside the stack.
   * Hover pointers already collapse on `pointerleave`.
   */
  onDocumentPointerDown(event: PointerEvent): void {
    if (!this.hovering() || isInsideToastItem(event.target)) {
      return;
    }
    this.hovering.set(false);
    if (!this.focusWithin()) {
      this.resumeAllAutoDismiss();
    }
  }

  /** Expands the stack when a toast (or dismiss control) receives keyboard focus. */
  onStackFocusIn(event: FocusEvent): void {
    if (!isInsideToastItem(event.target)) {
      if (event.target instanceof HTMLElement) {
        event.target.blur();
      }
      return;
    }
    this.focusWithin.set(true);
    this.pauseAllAutoDismiss();
  }

  /** Collapses when focus leaves the list, unless the pointer is still over it. */
  onStackFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (isInsideToastItem(next)) {
      return;
    }
    this.focusWithin.set(false);
    if (!this.hovering()) {
      this.resumeAllAutoDismiss();
    }
  }

  private pauseAllAutoDismiss(): void {
    for (const toast of this.toaster.toasts()) {
      this.toaster.pauseAutoDismiss(toast.id);
    }
  }

  private resumeAllAutoDismiss(): void {
    for (const toast of this.toaster.toasts()) {
      this.toaster.resumeAutoDismiss(toast.id);
    }
  }

  /**
   * Initializes the toaster service with the default duration.
   */
  ngOnInit(): void {
    this.toaster.setDefaultDurationMs(this.durationMs());
  }
}
