import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { ToasterService } from 'better-toast';

type UploadPhase = 'uploading' | 'complete';

@Component({
  selector: 'app-upload-progress-toast',
  imports: [],
  template: `
    <div
      class="w-full min-w-72 max-w-sm relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg shadow-black/10 p-4"
      role="status"
      [attr.aria-label]="ariaLabel()"
    >
      <div class="flex items-start justify-between gap-3 pr-8">
        <div class="min-w-0 flex-1 space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {{ phaseLabel() }}
          </p>
          <p
            class="truncate text-[13px] font-semibold text-zinc-900 dark:text-zinc-50"
            [title]="fileName()"
          >
            {{ fileName() }}
          </p>
        </div>
        <span class="tabular-nums text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {{ progressRounded() }}%
        </span>
      </div>

      <div
        class="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
        role="progressbar"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="100"
        [attr.aria-valuenow]="progressRounded()"
        [attr.aria-valuetext]="progressRounded() + ' percent'"
      >
        <div
          class="h-full rounded-full bg-lime-500 transition-[width] duration-200 ease-out dark:bg-lime-400"
          [style.width.%]="progress()"
        ></div>
      </div>

      <button
        type="button"
        aria-label="Dismiss"
        class="absolute top-3 right-3 cursor-pointer rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        (click)="toaster.dismiss(toastId())"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  `,
})
export class UploadProgressToast {
  protected readonly toaster = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);

  /** Set automatically by `ToasterService.headless()`; use with `dismiss()`. */
  protected readonly toastId = input<string>('');
  protected readonly fileName = input<string>('');

  protected readonly progress = signal(0);
  protected readonly phase = signal<UploadPhase>('uploading');

  protected readonly progressRounded = computed(() => Math.min(100, Math.round(this.progress())));

  protected readonly phaseLabel = computed(() => {
    const phase = this.phase();
    switch (phase) {
      case 'uploading':
        return 'Uploading';
      case 'complete':
        return 'Complete';
      default: {
        const _exhaustive: never = phase;
        return _exhaustive;
      }
    }
  });

  protected readonly ariaLabel = computed(() => {
    const name = this.fileName();
    const phase = this.phase();
    const pct = this.progressRounded();
    switch (phase) {
      case 'uploading':
        return name ? `Uploading ${name}, ${pct} percent` : `Uploading, ${pct} percent`;
      case 'complete':
        return name ? `Upload complete for ${name}` : 'Upload complete';
      default: {
        const _exhaustive: never = phase;
        return _exhaustive;
      }
    }
  });

  constructor() {
    const tickMs = 220;
    const handle = globalThis.setInterval(() => {
      const bump = 4 + Math.floor(Math.random() * 12);
      const next = Math.min(100, this.progress() + bump);
      this.progress.set(next);
      if (next >= 100) {
        globalThis.clearInterval(handle);
        this.phase.set('complete');
        globalThis.setTimeout(() => this.toaster.dismiss(this.toastId()), 1800);
      }
    }, tickMs);

    this.destroyRef.onDestroy(() => globalThis.clearInterval(handle));
  }
}
