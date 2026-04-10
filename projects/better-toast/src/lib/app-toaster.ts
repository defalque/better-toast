import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { AppToasterService } from './app-toaster.service';
import type { ToasterPosition } from './toaster.types';

/**
 * Renders the toaster stack. Add once near the root of your app (e.g. in `App`).
 */
@Component({
  selector: 'app-toaster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <section aria-label="Toaster" aria-live="polite" aria-relevant="additions text">
      <ol
        class="toast-container"
        [attr.data-position]="position()"
        aria-live="polite"
        aria-relevant="additions text"
      >
        @for (toast of toaster.toasts(); track toast.id) {
          <li class="toast" [attr.data-variant]="toast.variant" role="status" animate.leave="leave">
            <div class="toast-main">
              <span
                class="toast-icon"
                [class.toast-icon--spin]="toast.variant === 'loading'"
                aria-hidden="true"
              >
                @switch (toast.variant) {
                  @case ('success') {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  }
                  @case ('error') {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  }
                  @case ('info') {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                      />
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
                  @default {
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 0 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 0-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3.375 3.375 0 1 1-5.714 0"
                      />
                    </svg>
                  }
                }
              </span>
              <p class="msg">{{ toast.message }}</p>
            </div>
            <button
              type="button"
              class="close-btn"
              (click)="toaster.dismiss(toast.id)"
              aria-label="Dismiss"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.75"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </li>
        }
      </ol>
    </section>
  `,
  styleUrl: './styles.css',
})
export class AppToaster {
  protected readonly toaster = inject(AppToasterService);

  /** Where the stack is anchored on the viewport. */
  readonly position = input<ToasterPosition>('bottom-right');
}
