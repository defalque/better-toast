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
import { AppToasterService, DEFAULT_TOAST_DURATION_MS } from './app-toaster.service';
import type {
  ToasterIcons,
  ToasterItem,
  ToasterPosition,
  ToasterToastOptions,
  ToastVariant,
} from './toaster.types';

const GAP = 16;

function mergeToastHostStyles(
  base: Record<string, string | number | undefined> | undefined,
  override: Record<string, string | number | undefined> | undefined,
): Record<string, string | number | undefined> | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;
  return { ...base, ...override };
}

@Component({
  selector: 'li[appToastItem]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  host: {
    role: 'listitem',
    tabindex: '0',
    class: 'toast',
    '[attr.data-variant]': 'variant()',
    '[attr.data-icon]': 'shouldShowIconColumn() ? "true" : "false"',
    '[style.--offset]': 'offset() + "px"',
    '[style]': 'hostStyle()',
    '[animate.leave]': '"leave"',
  },
  template: `
    @if (toast()?.html) {
      <div class="toast-custom" [innerHTML]="toast()!.html!"></div>
    } @else {
      <div class="toast-main">
        @if (shouldShowIconColumn()) {
          <span class="toast-icon" aria-hidden="true">
            @if (toast()?.icon) {
              <span class="toast-custom-icon">
                <ng-container *ngComponentOutlet="toast()!.icon!" />
              </span>
            } @else if (iconComponent(); as IconCmp) {
              <span class="toast-custom-icon">
                <ng-container *ngComponentOutlet="IconCmp" />
              </span>
            } @else {
              @switch (variant()) {
                @case ('success') {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        <p class="msg">{{ toast()?.message }}</p>
      </div>
    }

    <button
      type="button"
      class="close-btn"
      (click)="toaster.dismiss(toast()?.id ?? '')"
      aria-label="Dismiss"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.75"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </button>
  `,
  styleUrl: './toast-item.css',
})
export class AppToastItem {
  /** Shared toaster service (e.g. dismiss from the close button). */
  protected readonly toaster = inject(AppToasterService);

  /** Host element ref used to read `offsetHeight` after the first render. */
  protected readonly host = inject(ElementRef);

  /** Toast payload (message, id, variant from the service). */
  toast = input<ToasterItem>();

  /**
   * Styles from `<app-toaster [toastOptions]>`; merged with {@link ToasterItem.style} so per-toast keys win.
   */
  toasterStyle = input<Record<string, string | number | undefined> | undefined>();

  /** Which icon and color treatment to show for this row. */
  variant = input<ToastVariant>('default');

  /** Merged inline styles for the toast (`[toastOptions].style` then per-toast `style`). */
  protected readonly hostStyle = computed(() =>
    mergeToastHostStyles(this.toasterStyle(), this.toast()?.style),
  );

  /**
   * Per-variant icon overrides from `<app-toaster [icons]>`.
   * Each override must be a standalone component whose template includes the SVG artwork.
   */
  customIcons = input<ToasterIcons | undefined>();

  /** Resolved standalone SVG icon component from `[icons]`, if any (not `null`). */
  protected readonly iconComponent = computed(() => {
    const v = this.variant();
    if (v === 'default') {
      return undefined;
    }
    const g = this.customIcons()?.[v];
    return g === null ? undefined : g;
  });

  /**
   * Renders the icon column unless the toast or `[icons]` opts out with `icon: null` / `success:
   * null` (etc.), or it is the `default` variant with no per-toast `icon` (neutral toasts stay
   * text-only).
   */
  protected readonly shouldShowIconColumn = computed(() => {
    const t = this.toast();
    if (!t) return false;
    if (t.icon === null) return false;
    const v = t.variant;
    if (v === 'default') {
      return t.icon != null;
    }
    if (t.icon != null) {
      return true;
    }
    if (this.customIcons()?.[v] === null) {
      return false;
    }
    return true;
  });

  /** Vertical stack offset in px; bound to `--offset` on the host for layout. */
  offset = input.required<number>();

  /** Emits the measured host height in px once after the first render so the parent can stack siblings. */
  heightChange = output<number>();

  constructor() {
    afterNextRender(() => {
      const height = this.host.nativeElement.offsetHeight;
      this.heightChange.emit(height);
    });
  }
}

/**
 * Renders the toaster stack. Add once near the root of your app (e.g. in `App`).
 * Variant-colored surfaces are off by default; set `[richColors]="true"` to enable them.
 * Set `[duration]` for auto-dismiss when service helpers omit their duration argument (`0` = persist until dismissed).
 * Pass `[icons]` with optional **standalone** components for `success` / `error` / `info` / `warning` / `loading`
 * to replace the default artwork, or **`null`** for a variant to hide its icon. Each component should render an **SVG** (import its class where you configure `[icons]`).
 */
@Component({
  selector: 'app-toaster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppToastItem],
  template: `
    <section aria-label="Toaster" aria-live="polite" aria-relevant="additions text">
      <ol
        class="toast-container"
        [attr.data-position]="position()"
        [attr.data-rich-colors]="richColors()"
        aria-live="polite"
        aria-relevant="additions text"
      >
        @for (toast of toaster.toasts(); track toast.id) {
          <li
            appToastItem
            [toast]="toast"
            [toasterStyle]="toastOptions()?.style"
            [variant]="toast.variant"
            [customIcons]="icons()"
            [offset]="offsets()[toast.id]"
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
export class AppToaster {
  protected readonly toaster = inject(AppToasterService);

  /** Where the stack is anchored on the viewport. */
  readonly position = input<ToasterPosition>('bottom-right');

  /** When true, success/error/info/warning use semantic background and border colors. */
  readonly richColors = input(false);

  /**
   * Default auto-dismiss time in ms for `show` / `success` / `error` / `info` / `warning` when the second argument omits `durationMs`.
   * `0` keeps toasts until dismissed. Does not apply to `loading()`. Defaults to the library default (4000ms).
   */
  readonly durationMs = input(DEFAULT_TOAST_DURATION_MS, { alias: 'duration' });

  /**
   * Optional per-variant **standalone** components that replace the default SVG (or loading indicator).
   * Import each icon component in the host and pass its class here; each one should render an SVG
   * (e.g. root `<svg>` with `stroke="currentColor"` / `fill="currentColor"` where appropriate).
   * Omitted keys keep the built-in icons; **`null`** for a variant hides that variant’s icon.
   */
  readonly icons = input<ToasterIcons | undefined>();

  /**
   * Defaults applied to every toast (e.g. `style` on the toast host).
   * Per-toast options passed to the service override on a per-key basis.
   */
  readonly toastOptions = input<ToasterToastOptions | undefined>();

  /** Measured height in px per toast id, updated when a toast item reports `heightChange`. */
  readonly heights = signal<Record<string, number>>({} as Record<string, number>);

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
