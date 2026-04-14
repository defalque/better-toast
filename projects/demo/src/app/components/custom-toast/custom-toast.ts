import { Component, computed, inject, input, signal } from '@angular/core';
import { ToasterService } from 'better-toast';

type CustomToastActionState = 'idle' | 'loading' | 'done';

@Component({
  selector: 'app-custom-toast',
  imports: [],
  template: `
    <div class="w-fit md:w-120 relative border p-4 shadow-xl bg-sky-50 dark:bg-sky-950">
      <div class="grid gap-2">
        <h2 class="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
          {{ title() }}
        </h2>
        <p class="text-sm text-zinc-700 dark:text-zinc-300 max-w-92 md:max-w-none">
          {{ message() }}
        </p>
        <div class="flex items-center gap-2 ml-auto">
          <button
            type="button"
            class="bg-black dark:bg-white hover:opacity-80 text-sm font-semibold text-white dark:text-black px-4 py-1 cursor-pointer shadow-sm transition duration-200  disabled:cursor-not-allowed"
            [disabled]="actionState() !== 'idle'"
            [attr.aria-busy]="actionState() === 'loading'"
            [class.opacity-50]="actionState() === 'loading'"
            (click)="onAction()"
          >
            {{ actionLabelComputed() }}
          </button>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          class="absolute top-2 right-2 cursor-pointer text-zinc-800 dark:text-zinc-100"
          (click)="toaster.dismiss(toastId())"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class CustomToast {
  protected readonly toaster = inject(ToasterService);

  /** Set automatically by `ToasterService.headless()`; use with `dismiss()`. */
  protected readonly toastId = input<string>('');
  protected readonly title = input<string>('');
  protected readonly message = input<string>('');
  protected readonly actionLabel = input<string>('');
  protected readonly onActionDone = input<() => void>();

  protected readonly actionState = signal<CustomToastActionState>('idle');

  protected readonly actionLabelComputed = computed(() => {
    const state = this.actionState();
    switch (state) {
      case 'idle':
        return this.actionLabel();
      case 'loading':
        return 'Loading…';
      case 'done':
        return 'Done';
      default: {
        const _exhaustive: never = state;
        return _exhaustive;
      }
    }
  });

  protected onAction(): void {
    void this.runFakeAction();
  }

  private async runFakeAction(): Promise<void> {
    if (this.actionState() !== 'idle') {
      return;
    }
    this.actionState.set('loading');
    await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 1500));
    this.actionState.set('done');
    this.onActionDone()?.();
    globalThis.setTimeout(() => this.toaster.dismiss(this.toastId()), 1000);
  }
}
