import { Component, inject, input } from '@angular/core';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'app-custom-music-player-toast',
  imports: [],
  template: `
    <div
      class="w-fit inset-shadow-md shadow-lg shadow-black/10 ring-1 ring-black/10 dark:ring-zinc-800 px-4 py-2 rounded-xl bg-zinc-50/10 backdrop-blur-sm dark:bg-zinc-800/10"
    >
      <div class="grid  gap-2">
        <p class="text-[0.65rem] uppercase font-semibold text-zinc-500 dark:text-zinc-400">
          Currently playing
        </p>

        <div class="flex gap-2">
          <div class="size-14 rounded-lg overflow-hidden">
            <img [src]="songImage()" alt="Stay" class="size-full object-cover" />
          </div>
          <div class="self-center">
            <h3 class="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
              {{ songTitle() }}
            </h3>
            <p class="text-[15px] text-zinc-700 dark:text-zinc-300">{{ songArtist() }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="px-4">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
              class="text-zinc-400 dark:text-zinc-400 size-6"
            >
              <path
                d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l7.1-1.01L12 2z"
              />
            </svg>
          </div>

          <div class="flex items-center gap-2">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="size-13 text-zinc-800 dark:text-zinc-100 cursor-pointer active:scale-95 transition-all duration-200"
            >
              <path d="M11 7.8l-5 4.2 5 4.2c.4.35 1 .05 1-.5V8.3c0-.55-.6-.85-1-.5z" />
              <path d="M17.2 7.8l-5 4.2 5 4.2c.4.35 1 .05 1-.5V8.3c0-.55-.6-.85-1-.5z" />
            </svg>

            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="size-13 text-zinc-800 dark:text-zinc-100 cursor-pointer active:scale-95 transition-all duration-200"
            >
              <rect x="7" y="5" width="4.5" height="14" rx="1.5" />
              <rect x="12.5" y="5" width="4.5" height="14" rx="1.5" />
            </svg>

            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="rotate-180 size-13 text-zinc-800 dark:text-zinc-100 cursor-pointer active:scale-95 transition-all duration-200"
            >
              <path d="M11 7.8l-5 4.2 5 4.2c.4.35 1 .05 1-.5V8.3c0-.55-.6-.85-1-.5z" />
              <path d="M17.2 7.8l-5 4.2 5 4.2c.4.35 1 .05 1-.5V8.3c0-.55-.6-.85-1-.5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CustomMusicPlayerToast {
  protected readonly toaster = inject(ToasterService);

  /** Same id returned from `ToasterService.headless()`; use with `dismiss()`. */
  protected readonly toastId = input<string>('');

  protected readonly songTitle = input<string>('');
  protected readonly songImage = input<string>('');
  protected readonly songArtist = input<string>('');
}
