import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ToasterService } from 'better-toast';
import hljs from 'highlight.js';
import typescript from 'highlight.js/lib/languages/typescript';
import { CustomIcon } from './components/custom-icon/custom-icon';
import { HeadlessComponent } from '../../../components/headless-component/headless-component';
import { HomeCustomToastBody } from './components/custom-toast-body/custom-toast-body';
import { Meta } from '@angular/platform-browser';

hljs.registerLanguage('typescript', typescript);

const RENDER_TOAST_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-default-toast',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button (click)="renderToast()" type="button" class="btn">Render a toast</button>
  \`,
})
export class DefaultToastComponent {
  protected readonly toaster = inject(ToasterService);

  protected renderToast(): void {
    this.toaster.show('This is a toast');
  }
}`;
const TOAST_WITH_OPTIONS_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';
import { CustomIcon } from './components/custom-icon';

@Component({
  selector: 'app-toast-with-options',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button (click)="renderToast()" type="button" class="btn">Render a toasts</button>
  \`,
})
export class ToastWithOptionsComponent {
  protected readonly toaster = inject(ToasterService);

  protected renderToast() {
    this.toaster.show('This is a toast with options', {
      durationMs: 5000,
      icon: CustomIcon,
      classNames: {
        message: 'font-mono! text-[13px]!',
      },
    });
  }
}`;
const SUCCESS_TOAST_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-success-toast',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button (click)="renderSuccessToast()" type="button" class="btn">Render a success toast</button>
  \`,
})
export class SuccessToastComponent {
  protected readonly toaster = inject(ToasterService);

  protected renderSuccessToast(): void {
    this.toaster.success ('This is a success toast');
  }
}`;
const ERROR_TOAST_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-error-toast',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button (click)="renderErrorToast()" type="button" class="btn">Render a error toast</button>
  \`,
})
export class ErrorToastComponent {
  protected readonly toaster = inject(ToasterService);

  protected renderErrorToast(): void {
    this.toaster.error ('This is a error toast');
  }
}`;
const INFO_TOAST_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-info-toast',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button (click)="renderInfoToast()" type="button" class="btn">Render an info toast</button>
  \`,
})
export class InfoToastComponent {
  protected readonly toaster = inject(ToasterService);

  protected renderInfoToast(): void {
    this.toaster.info('This is an info toast');
  }
}`;
const WARNING_TOAST_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-warning-toast',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button (click)="renderWarningToast()" type="button" class="btn">Render a warning toast</button>
  \`,
})
export class WarningToastComponent {
  protected readonly toaster = inject(ToasterService);

  protected renderWarningToast(): void {
    this.toaster.warning('This is a warning toast');
  }
}`;
const LOADING_TOAST_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-loading-toast',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button (click)="renderLoadingToast()" type="button" class="btn">Render a loading toast</button>
  \`,
})
export class LoadingToastComponent {
  protected readonly toaster = inject(ToasterService);

  protected renderLoadingToast(): void {
    this.toaster.loading('Loading...');
  }
}`;
const ACTION_TOAST_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-action-toast',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button (click)="renderActionToast()" type="button" class="btn">Render a action toast</button>
  \`,
})
export class ActionToastComponent {
  protected readonly toaster = inject(ToasterService);

  protected renderActionToast(): void {
    this.toaster.action('This is an action toast', {
      action: {
        label: 'Action',
        onClick: () => {
          console.log('Action clicked');
        },
      },
    });
  }
}`;
const CANCEL_TOAST_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-cancel-toast',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button (click)="renderCancelToast()" type="button" class="btn">Render a cancel toast</button>
  \`,
})
export class CancelToastComponent {
  protected readonly toaster = inject(ToasterService);

  protected renderCancelToast(): void {
    this.toaster.cancel('This is a cancel toast', {
      cancel: {
        label: 'Cancel',
        onClick: () => {
          console.log('Cancel clicked');
        },
      },
    });
  }
}`;
const PROMISE_TOAST_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-promise-toast',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button (click)="renderPromiseToast()" type="button" class="btn">Render a promise toast</button>
  \`,
})
export class PromiseToastComponent {
  protected readonly toaster = inject(ToasterService);

  protected renderPromiseToast(): void {
    const myPromise = new Promise<{ message: string }>((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Better-toast rendered successfully' });
      }, 3000);
    });

    this.toaster.promise(myPromise, {
      loading: 'Loading...',
      success: 'Promise resolved',
      error: 'Promise rejected',
    });
  }
}`;
const HEADLESS_TOAST_SOURCE = `import { Component, inject, input } from '@angular/core';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'app-headless-component',
  imports: [],
  template: '
    <div
      class="w-fit dark:ring-zinc-800/90 px-4 py-2 rounded-2xl bg-zinc-50/10 backdrop-blur-sm dark:bg-zinc-950/10 ..."
    >
       <!-- Your headless toast code here -->
    </div>
  ',
})
export class HeadlessComponent {
  protected readonly toaster = inject(ToasterService);

  /** Same id returned from 'ToasterService.headless()'; use with 'dismiss()'. */
  protected readonly toastId = input<string>('');

  protected readonly songTitle = input<string>('');
  protected readonly songImage = input<string>('');
  protected readonly songArtist = input<string>('');
}

import { Component, inject } from '@angular/core';
import { ToasterService } from 'better-toast';
import { HeadlessComponent } from './components/headless-component/headless-component';

@Component({
  selector: 'app-headless-toast',
  imports: [],
  template: '
    <button (click)="renderHeadlessToast()" type="button" class="btn">Render a headless toast</button>
  ',
})
export class HeadlessToast {
  protected readonly toaster = inject(ToasterService);

  protected renderHeadlessToast(): void {
    this.toaster.headless(HeadlessComponent, {
      durationMs: 'Infinity',
      inputs: {
        songTitle: 'Stay',
        songImage:
          'https://cdn-images.dzcdn.net/images/cover/dd6fe7fa9267185c4b835bd4f155d1d2/0x1900-000000-80-0-0.jpg',
        songArtist: 'The Kid Laroi, Justin Bieber',
      },
    });
  }
}`;
const CUSTOM_TOAST_SOURCE = `import { Component, inject, input } from '@angular/core';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'app-custom-toast-component',
  imports: [],
  template: '
    <span>
    Check my website:
    <a
      href="https://marcodefalco.dev"
      target="_blank"
      rel="noopener noreferrer"
      class="text-orange-600 dark:text-orange-400 font-medium italic hover:underline"
    >
      marcodefalco.dev
    </a>
  </span>
  ',
})
export class CustomToastComponent {
  /** Same id returned from 'ToasterService.headless()'; use with 'dismiss()'. */
  protected readonly toastId = input<string>('');
}

import { Component, inject } from '@angular/core';
import { ToasterService } from 'better-toast';
import { CustomToastComponent } from './components/custom-toast-component/custom-toast-component';

@Component({
  selector: 'app-custom-toast',
  imports: [],
  template: '
    <button (click)="renderCustomToast()" type="button" class="btn">Render a custom toast</button>
  ',
})
export class CustomToast {
  protected readonly toaster = inject(ToasterService);

  protected renderCustomToast(): void {
    this.toaster.custom(CustomToastComponent);
  }
}`;

@Component({
  selector: 'app-doc-toast-types',
  imports: [],
  templateUrl: './doc-toast-types.html',
  styleUrl: './doc-toast-types.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocToastTypes {
  private readonly meta = inject(Meta);
  protected readonly enterEnabled = signal(false);

  constructor() {
    this.meta.updateTag({
      name: 'description',
      content:
        'Create success, error, and custom toasts. API examples and options for all toast types in Better Toast for Angular.',
    });

    afterNextRender(() => {
      setTimeout(() => {
        this.enterEnabled.set(true);
      }, 100);
    });
  }

  protected readonly toaster = inject(ToasterService);

  protected toastTab = signal<'preview' | 'code'>('preview');
  protected toastWithOptionsTab = signal<'preview' | 'code'>('preview');
  protected successToastTab = signal<'preview' | 'code'>('preview');
  protected errorToastTab = signal<'preview' | 'code'>('preview');
  protected infoToastTab = signal<'preview' | 'code'>('preview');
  protected warningToastTab = signal<'preview' | 'code'>('preview');
  protected loadingToastTab = signal<'preview' | 'code'>('preview');
  protected actionToastTab = signal<'preview' | 'code'>('preview');
  protected cancelToastTab = signal<'preview' | 'code'>('preview');
  protected promiseToastTab = signal<'preview' | 'code'>('preview');
  protected headlessToastTab = signal<'preview' | 'code'>('preview');
  protected customToastTab = signal<'preview' | 'code'>('preview');

  protected toastCodeCopied = signal(false);
  protected toastWithOptionsCodeCopied = signal(false);
  protected successToastCodeCopied = signal(false);
  protected errorToastCodeCopied = signal(false);
  protected infoToastCodeCopied = signal(false);
  protected warningToastCodeCopied = signal(false);
  protected loadingToastCodeCopied = signal(false);
  protected actionToastCodeCopied = signal(false);
  protected cancelToastCodeCopied = signal(false);
  protected promiseToastCodeCopied = signal(false);
  protected headlessToastCodeCopied = signal(false);
  protected customToastCodeCopied = signal(false);

  private copyResetTimeout: ReturnType<typeof setTimeout> | null = null;

  protected renderToast(message: string): void {
    this.toaster.show(message);
  }
  protected renderToastSource() {
    return hljs.highlight(RENDER_TOAST_SOURCE, { language: 'typescript' }).value;
  }
  protected renderToastWithOptions() {
    this.toaster.show('This is a toast with options', {
      durationMs: 5000,
      icon: CustomIcon,
      classNames: {
        message: 'font-mono! text-[13px]!',
      },
    });
  }
  protected toastWithOptionsSource() {
    return hljs.highlight(TOAST_WITH_OPTIONS_SOURCE, { language: 'typescript' }).value;
  }
  protected renderSuccessToast() {
    this.toaster.success('This is a success toast');
  }
  protected renderSuccessToastSource(): string {
    return hljs.highlight(SUCCESS_TOAST_SOURCE, { language: 'typescript' }).value;
  }
  protected renderErrorToast(): void {
    this.toaster.error('This is an error toast');
  }
  protected renderErrorToastSource(): string {
    return hljs.highlight(ERROR_TOAST_SOURCE, { language: 'typescript' }).value;
  }
  protected renderInfoToast(): void {
    this.toaster.info('This is an info toast');
  }
  protected renderInfoToastSource(): string {
    return hljs.highlight(INFO_TOAST_SOURCE, { language: 'typescript' }).value;
  }
  protected renderWarningToast(): void {
    this.toaster.warning('This is a warning toast');
  }
  protected renderWarningToastSource(): string {
    return hljs.highlight(WARNING_TOAST_SOURCE, { language: 'typescript' }).value;
  }
  protected renderLoadingToast(): void {
    this.toaster.loading('Loading...');
  }
  protected renderLoadingToastSource(): string {
    return hljs.highlight(LOADING_TOAST_SOURCE, { language: 'typescript' }).value;
  }
  protected renderActionToast(): void {
    this.toaster.action('This is an action toast', {
      action: {
        label: 'Action',
        onClick: () => {
          console.log('Action clicked');
        },
      },
    });
  }
  protected renderActionToastSource(): string {
    return hljs.highlight(ACTION_TOAST_SOURCE, { language: 'typescript' }).value;
  }
  protected renderCancelToast(): void {
    this.toaster.cancel('This is a cancel toast', {
      cancel: {
        label: 'Cancel',
        onClick: () => {
          console.log('Cancel clicked');
        },
      },
    });
  }
  protected renderCancelToastSource(): string {
    return hljs.highlight(CANCEL_TOAST_SOURCE, { language: 'typescript' }).value;
  }
  protected renderPromiseToast(): void {
    const myPromise = new Promise<{ message: string }>((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Better-toast rendered successfully' });
      }, 3000);
    });

    this.toaster.promise(myPromise, {
      loading: 'Loading...',
      success: 'Promise resolved',
      error: 'Promise rejected',
    });
  }
  protected renderPromiseToastSource(): string {
    return hljs.highlight(PROMISE_TOAST_SOURCE, { language: 'typescript' }).value;
  }
  protected renderHeadlessToast(): void {
    this.toaster.headless(HeadlessComponent, {
      durationMs: 'Infinity',
      inputs: {
        songTitle: 'Stay',
        songImage:
          'https://cdn-images.dzcdn.net/images/cover/dd6fe7fa9267185c4b835bd4f155d1d2/0x1900-000000-80-0-0.jpg',
        songArtist: 'The Kid Laroi, Justin Bieber',
      },
    });
  }
  protected renderHeadlessToastSource(): string {
    return hljs.highlight(HEADLESS_TOAST_SOURCE, { language: 'typescript' }).value;
  }
  protected renderCustomToast(): void {
    this.toaster.custom(HomeCustomToastBody, {});
  }
  protected renderCustomToastSource(): string {
    return hljs.highlight(CUSTOM_TOAST_SOURCE, { language: 'typescript' }).value;
  }

  protected async copyToastCode(): Promise<void> {
    await this.copyToClipboard(RENDER_TOAST_SOURCE, this.toastCodeCopied);
  }
  protected async copyToastWithOptionsCode(): Promise<void> {
    await this.copyToClipboard(TOAST_WITH_OPTIONS_SOURCE, this.toastWithOptionsCodeCopied);
  }
  protected async copySuccessToastCode(): Promise<void> {
    await this.copyToClipboard(SUCCESS_TOAST_SOURCE, this.successToastCodeCopied);
  }
  protected async copyErrorToastCode(): Promise<void> {
    await this.copyToClipboard(ERROR_TOAST_SOURCE, this.errorToastCodeCopied);
  }
  protected async copyInfoToastCode(): Promise<void> {
    await this.copyToClipboard(INFO_TOAST_SOURCE, this.infoToastCodeCopied);
  }
  protected async copyWarningToastCode(): Promise<void> {
    await this.copyToClipboard(WARNING_TOAST_SOURCE, this.warningToastCodeCopied);
  }
  protected async copyLoadingToastCode(): Promise<void> {
    await this.copyToClipboard(LOADING_TOAST_SOURCE, this.loadingToastCodeCopied);
  }
  protected async copyActionToastCode(): Promise<void> {
    await this.copyToClipboard(ACTION_TOAST_SOURCE, this.actionToastCodeCopied);
  }
  protected async copyCancelToastCode(): Promise<void> {
    await this.copyToClipboard(CANCEL_TOAST_SOURCE, this.cancelToastCodeCopied);
  }
  protected async copyPromiseToastCode(): Promise<void> {
    await this.copyToClipboard(PROMISE_TOAST_SOURCE, this.promiseToastCodeCopied);
  }
  protected async copyHeadlessToastCode(): Promise<void> {
    await this.copyToClipboard(HEADLESS_TOAST_SOURCE, this.headlessToastCodeCopied);
  }
  protected async copyCustomToastCode(): Promise<void> {
    await this.copyToClipboard(CUSTOM_TOAST_SOURCE, this.customToastCodeCopied);
  }

  private async copyToClipboard(
    source: string,
    copiedSignal: ReturnType<typeof signal<boolean>>,
  ): Promise<void> {
    try {
      if (copiedSignal()) {
        return;
      }
      await navigator.clipboard.writeText(source);
      copiedSignal.set(true);
      if (this.copyResetTimeout !== null) {
        clearTimeout(this.copyResetTimeout);
      }
      this.copyResetTimeout = setTimeout(() => copiedSignal.set(false), 2000);
    } catch {
      copiedSignal.set(false);
    }
  }
}
