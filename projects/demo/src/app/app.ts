import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import { RouterOutlet } from '@angular/router';
import {
  Toaster,
  ToasterService,
  DEFAULT_TOAST_DURATION_MS,
  TOAST_DURATION_MANUAL_DISMISS,
  TOASTER_POSITIONS,
  type ToasterOffset,
  type ToasterPosition,
} from 'better-toast';

type OffsetSide = 'top' | 'right' | 'bottom' | 'left';

const OFFSET_SIDES: readonly OffsetSide[] = ['top', 'right', 'bottom', 'left'];
import { CustomIcon } from './icons/custom-icon/custom-icon';
import { CustomWarning } from './icons/custom-warning/custom-warning';
import { CustomLoading } from './icons/custom-loading/custom-loading';
import { CustomMusicPlayerToast } from './components/custom-music-player-toast/custom-music-player-toast';
import { CustomToast } from './components/custom-toast/custom-toast';
import { CookieToast } from './components/cookie-toast/cookie-toast';
import { UploadProgressToast } from './components/upload-progress-toast/upload-progress-toast';

hljs.registerLanguage('typescript', typescript);

type ToastDemoKind =
  | 'default'
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'custom'
  | 'loading'
  | 'promise';

type HeadlessDemoKind = 'boring' | 'music' | 'cookie' | 'upload';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly toaster = inject(ToasterService);
  protected readonly positions = TOASTER_POSITIONS;
  protected readonly toasterPosition = signal<ToasterPosition>('bottom-right');
  protected readonly toasterDurationMs = signal(DEFAULT_TOAST_DURATION_MS);
  protected readonly durationSliderMaxMs = 10_000;
  protected readonly durationSliderStepMs = 1000;

  protected positionLabel(position: ToasterPosition): string {
    return position
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /** Sliders: 0–100px, step 2. Defaults match `toaster.css` insets. */
  protected readonly offsetSides = OFFSET_SIDES;
  protected readonly offsetPxMin = 0;
  protected readonly offsetPxMax = 100;
  protected readonly offsetPxStep = 2;
  protected readonly offsetTopPx = signal(24);
  protected readonly offsetRightPx = signal(24);
  protected readonly offsetBottomPx = signal(24);
  protected readonly offsetLeftPx = signal(24);
  protected readonly mobileOffsetTopPx = signal(16);
  protected readonly mobileOffsetRightPx = signal(16);
  protected readonly mobileOffsetBottomPx = signal(16);
  protected readonly mobileOffsetLeftPx = signal(16);

  protected readonly toasterOffset = computed(
    (): ToasterOffset => ({
      top: `${this.offsetTopPx()}px`,
      right: `${this.offsetRightPx()}px`,
      bottom: `${this.offsetBottomPx()}px`,
      left: `${this.offsetLeftPx()}px`,
    }),
  );

  protected readonly toasterMobileOffset = computed(
    (): ToasterOffset => ({
      top: `${this.mobileOffsetTopPx()}px`,
      right: `${this.mobileOffsetRightPx()}px`,
      bottom: `${this.mobileOffsetBottomPx()}px`,
      left: `${this.mobileOffsetLeftPx()}px`,
    }),
  );

  protected offsetSideLabel(side: OffsetSide): string {
    switch (side) {
      case 'top':
        return 'Top';
      case 'right':
        return 'Right';
      case 'bottom':
        return 'Bottom';
      case 'left':
        return 'Left';
    }
  }

  protected onOffsetSliderInput(
    target: 'desktop' | 'mobile',
    side: OffsetSide,
    event: Event,
  ): void {
    const v = (event.target as HTMLInputElement).valueAsNumber;
    const n = Number.isFinite(v) ? v : 0;
    if (target === 'desktop') {
      switch (side) {
        case 'top':
          this.offsetTopPx.set(n);
          break;
        case 'right':
          this.offsetRightPx.set(n);
          break;
        case 'bottom':
          this.offsetBottomPx.set(n);
          break;
        case 'left':
          this.offsetLeftPx.set(n);
          break;
      }
    } else {
      switch (side) {
        case 'top':
          this.mobileOffsetTopPx.set(n);
          break;
        case 'right':
          this.mobileOffsetRightPx.set(n);
          break;
        case 'bottom':
          this.mobileOffsetBottomPx.set(n);
          break;
        case 'left':
          this.mobileOffsetLeftPx.set(n);
          break;
      }
    }
  }

  protected readonly richColors = signal(false);

  /** When false, toast rows omit the dismiss control (auto-dismiss / `dismiss()` still work). */
  protected readonly closeButton = signal(true);

  protected readonly selectedToastDemo = signal<ToastDemoKind>('default');
  protected readonly selectedHeadlessDemo = signal<HeadlessDemoKind>('boring');

  protected readonly toastDemoSnippets: Record<ToastDemoKind, string> = {
    default: `this.toaster.show('Default toast. A very super long message that should wrap.');`,
    success: `this.toaster.success('Saved successfully', { icon: CustomIcon });`,
    error: `this.toaster.error('Something went wrong', { icon: null });`,
    info: `this.toaster.info('Tip: you can stack multiple toasts');`,
    warning: `this.toaster.warning('Your session will expire soon');`,
    custom: `this.toaster.custom(\`
      <div class="font-medium">Check my website: 
        <a href="https://marcodefalco.dev" target="_blank" rel="noopener noreferrer" 
        class="text-orange-600 dark:text-orange-400 italic hover:underline">
          marcodefalco.dev
        </a>
      </div>
\`);`,
    loading: `this.toaster.loading('Loading…');`,
    promise: `const myPromise = new Promise<{ message: string }>((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Better-toast rendered successfully' });
      }, 3000);
});

this.toaster.promise(myPromise, {
      loading: 'Loading…',
      success: (data) => \`\${data.message}\`,
      error: 'Promise rejected',
});`,
  };

  protected readonly highlightedToastDemo = computed(() => {
    const code = this.toastDemoSnippets[this.selectedToastDemo()];
    const { value } = hljs.highlight(code, {
      language: 'typescript',
      ignoreIllegals: true,
    });
    return this.sanitizer.bypassSecurityTrustHtml(value);
  });

  protected readonly headlessDemoSnippets: Record<HeadlessDemoKind, string> = {
    boring: `import { ToasterService } from 'better-toast';
...

@Component({
  ...
  template: '
    <div class="w-fit md:w-120 relative border p-4 shadow-xl bg-sky-50 dark:bg-sky-950">
      <div class="grid gap-2">
        <h2 class="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
          {{ title() }}
        </h2>
        <p class="text-sm text-zinc-700 dark:text-zinc-300 max-w-92 md:max-w-none">
          {{ message() }}
        </p>
        ...
        <button
          type="button"
          aria-label="Dismiss"
          aria-hidden="true"
          class="absolute top-2 right-2 cursor-pointer text-zinc-800 dark:text-zinc-100"
          (click)="toaster.dismiss(toastId())"
        >
          ...
        </button>
      </div>
    </div>
  '
})
export class BoringToast {
  protected readonly toaster = inject(ToasterService);

  /** Set automatically by 'ToasterService.headless()'; use with 'dismiss()'. */
  protected readonly toastId = input<string>('');

  protected readonly title = input<string>('');
  protected readonly message = input<string>('');
  protected readonly actionMessage = input<string>('');

  ...
}

this.toaster.headless(BoringToast, {
  inputs: {
    title: 'Boring Toast',
    message:
      'You have full control over the toast content and appearance, while keeping the animations and positioning.',
    actionMessage: 'Action',
  },
});`,
    music: `import { ToasterService } from 'better-toast';
...

@Component({
  ...
  template: '
    <div
      class="w-fit shadow-lg shadow-black/10 ring-1 ring-black/10 dark:ring-zinc-800 px-4 py-2 rounded-xl bg-zinc-50/10 backdrop-blur-sm dark:bg-zinc-800/50"
    >
      ...
    </div>
  '
})
export class CustomMusicPlayerToast {
  protected readonly toaster = inject(ToasterService);

  /** Same id returned from 'ToasterService.headless()'; use with 'dismiss()'. */
  protected readonly toastId = input<string>('');

  protected readonly songTitle = input<string>('');
  protected readonly songImage = input<string>('');
  protected readonly songArtist = input<string>('');

  ...
}

this.toaster.headless(CustomMusicPlayerToast, {
  inputs: {
    songTitle: 'Stay',
    songImage:
      'https://cdn-images.dzcdn.net/images/cover/dd6fe7fa9267185c4b835bd4f155d1d2/0x1900-000000-80-0-0.jpg',
    songArtist: 'The Kid Laroi, Justin Bieber',
  },
});`,
    cookie: `import { ToasterService } from 'better-toast';
...

@Component({
  ...
  template: '
    <div class="w-fit relative border border-zinc-300 p-5 shadow-xl bg-white rounded-2xl">
      ...
    </div>
  '
})
export class CookieToast {
  protected readonly toaster = inject(ToasterService);

  /** Same id returned from 'ToasterService.headless()'; use with 'dismiss()'. */
  protected readonly toastId = input<string>('');

  protected readonly title = input<string>('');
  protected readonly message = input<string>('');
  protected readonly subMessage = input<string>('');
  ...
}

this.toaster.headless(CookieToast, {
  durationMs: 'Infinity',
  inputs: {
    title: 'Legally required cookie banner',
    message: "We don't use third-party cookies to track you.",
    subMessage: 'No data is sent to third-party servers. Ursula von der Leyen would be proud!',
  },
});`,
    upload: `import { ToasterService } from 'better-toast';
...

@Component({
  ...
  template: '
    <div class="... rounded-xl border ... p-4" role="status">
      ...
      <button type="button" aria-label="Dismiss" (click)="toaster.dismiss(toastId())">
        ...
      </button>
    </div>
  '
})
export class UploadProgressToast {
  protected readonly toaster = inject(ToasterService);

  protected readonly toastId = input<string>('');
  protected readonly fileName = input<string>('');

  /** Simulates upload progress; dismisses shortly after reaching 100%. */
  ...
}

this.toaster.headless(UploadProgressToast, {
  durationMs: 'Infinity',
  inputs: { fileName: 'quarterly-report.pdf' },
});`,
  };

  protected readonly highlightedHeadlessDemo = computed(() => {
    const code = this.headlessDemoSnippets[this.selectedHeadlessDemo()];
    const { value } = hljs.highlight(code, {
      language: 'typescript',
      ignoreIllegals: true,
    });
    return this.sanitizer.bypassSecurityTrustHtml(value);
  });

  protected showDefaultToast(): void {
    this.toaster.show('Default toast. A very super long message that should wrap.', {
      /* icon: CustomWarning, */
    });
  }

  protected showSuccessToast(): void {
    this.toaster.success('Saved successfully', {
      /* durationMs: 'Infinity', */
      icon: CustomIcon,
      /* style: { background: 'green', color: 'blue' }, */
    });
  }

  protected showErrorToast(): void {
    this.toaster.error('Something went wrong', { icon: null });
  }

  protected showInfoToast(): void {
    this.toaster.info('Tip: you can stack multiple toasts');
  }

  protected showWarningToast(): void {
    this.toaster.warning('Your session will expire soon');
  }

  protected showLoadingToast(): void {
    this.toaster.loading('Loading…');
  }

  protected showPromiseToast(): void {
    const myPromise = new Promise<{ message: string }>((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Better-toast rendered successfully' });
      }, 3000);
    });

    this.toaster.promise(myPromise, {
      loading: 'Loading…',
      success: (data) => `${data.message}`,
      error: 'Promise rejected',
    });
  }

  protected showErrorPromiseToast(): void {
    const myPromise = new Promise<{ name: string }>((_resolve, reject) => {
      setTimeout(() => {
        reject({ message: 'Better-toast rendered with an error' });
      }, 3000);
    });

    this.toaster.promise(myPromise, {
      loading: 'Loading…',
      success: 'Promise resolved',
      error: (reason: unknown) => `${(reason as { message: string }).message}`,
    });
  }

  protected showCustomToast(): void {
    this.toaster.custom(`
      <div class="font-medium">Check my website:
        <a href="https://marcodefalco.dev" target="_blank" rel="noopener noreferrer" class="hover:underline italic text-orange-600 dark:text-orange-400">
          marcodefalco.dev
        </a>
      </div>
    `);
  }

  protected toggleRichColors(): void {
    this.richColors.set(!this.richColors());
  }

  protected toggleCloseButton(): void {
    this.closeButton.set(!this.closeButton());
  }

  protected onDurationSliderInput(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (!Number.isFinite(value)) {
      this.toasterDurationMs.set(DEFAULT_TOAST_DURATION_MS);
      return;
    }
    this.toasterDurationMs.set(value === 0 ? TOAST_DURATION_MANUAL_DISMISS : value);
  }

  /** Maps manual-dismiss (`Infinity`) to `0` on the range input. */
  protected readonly durationSliderDisplayMs = computed(() => {
    const v = this.toasterDurationMs();
    return Number.isFinite(v) ? v : 0;
  });

  protected isManualDismissDuration(): boolean {
    return !Number.isFinite(this.toasterDurationMs());
  }

  protected clearToasts(): void {
    this.toaster.clear();
  }

  protected readonly toastIcons = {
    // error: null,
    // loading: CustomLoading,
  };

  protected readonly toastOptions = {
    /* style: { background: 'red', color: 'yellow' }, */
  };

  protected showBoringToast(): void {
    this.toaster.headless(CustomToast, {
      inputs: {
        title: 'Boring Toast',
        message:
          'You have full control over the toast content and appearance, while keeping the animations and positioning.',
        actionMessage: 'Action',
      },
    });
  }
  protected showMusicPlayerToast(): void {
    this.toaster.headless(CustomMusicPlayerToast, {
      inputs: {
        songTitle: 'Stay',
        songImage:
          'https://cdn-images.dzcdn.net/images/cover/dd6fe7fa9267185c4b835bd4f155d1d2/0x1900-000000-80-0-0.jpg',
        songArtist: 'The Kid Laroi, Justin Bieber',
      },
    });
  }
  protected showCookieToast(): void {
    this.toaster.headless(CookieToast, {
      durationMs: 'Infinity',
      inputs: {
        title: 'Legally required cookie banner',
        message: "We don't use third-party cookies to track you.",
        subMessage: 'No data is sent to third-party servers. Ursula von der Leyen would be proud!',
      },
    });
  }

  protected showUploadProgressToast(): void {
    this.toaster.headless(UploadProgressToast, {
      durationMs: 'Infinity',
      inputs: { fileName: 'quarterly-report.pdf' },
    });
  }
}
