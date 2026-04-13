import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import { RouterOutlet } from '@angular/router';
import {
  AppToaster,
  AppToasterService,
  DEFAULT_TOAST_DURATION_MS,
  TOAST_DURATION_MANUAL_DISMISS,
  TOASTER_POSITIONS,
  type ToasterPosition,
} from 'better-toast';
import { CustomIcon } from './icons/custom-icon/custom-icon';
import { CustomWarning } from './icons/custom-warning/custom-warning';
import { CustomLoading } from './icons/custom-loading/custom-loading';

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

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppToaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly toaster = inject(AppToasterService);
  protected readonly title = signal('demo');
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
  protected readonly richColors = signal(false);

  protected readonly selectedToastDemo = signal<ToastDemoKind>('default');

  protected readonly toastDemoSnippets: Record<ToastDemoKind, string> = {
    default: `this.toaster.show('Default toast. A very super long message that should wrap.');`,
    success: `this.toaster.success('Saved successfully', { icon: CustomIcon });`,
    error: `this.toaster.error('Something went wrong', { icon: null });`,
    info: `this.toaster.info('Tip: you can stack multiple toasts');`,
    warning: `this.toaster.warning('Your session will expire soon');`,
    custom: `this.toaster.custom(\`
      <div class="font-medium">Go check my website: 
        <a href="https://marcodefalco.dev" target="_blank" rel="noopener noreferrer" 
        class="hover:underline italic text-orange-600 dark:text-orange-400">
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

  protected showDefaultToast(): void {
    this.toaster.show('Default toast. A very super long message that should wrap.');
  }

  protected showSuccessToast(): void {
    this.toaster.success('Saved successfully', {
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
      <div class="font-medium">Go check my website:
        <a href="https://marcodefalco.dev" target="_blank" rel="noopener noreferrer" class="hover:underline italic text-orange-600 dark:text-orange-400">
          marcodefalco.dev
        </a>
      </div>
    `);
  }

  protected toggleRichColors(): void {
    this.richColors.set(!this.richColors());
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
}
