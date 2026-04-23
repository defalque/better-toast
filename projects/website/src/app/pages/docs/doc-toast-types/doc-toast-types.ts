import { Component, computed, inject, signal } from '@angular/core';
import { ToasterService } from 'better-toast';
import hljs from 'highlight.js';
import typescript from 'highlight.js/lib/languages/typescript';
import { CustomIcon } from './components/custom-icon/custom-icon';

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

@Component({
  selector: 'app-doc-toast-types',
  imports: [],
  templateUrl: './doc-toast-types.html',
  styleUrl: './doc-toast-types.css',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocToastTypes {
  protected readonly toaster = inject(ToasterService);

  protected toastTab = signal<'preview' | 'code'>('preview');
  protected toastWithOptionsTab = signal<'preview' | 'code'>('preview');
  protected successToastTab = signal<'preview' | 'code'>('preview');
  protected errorToastTab = signal<'preview' | 'code'>('preview');
  protected infoToastTab = signal<'preview' | 'code'>('preview');
  protected warningToastTab = signal<'preview' | 'code'>('preview');
  protected loadingToastTab = signal<'preview' | 'code'>('preview');

  protected toastCodeCopied = signal(false);
  protected toastWithOptionsCodeCopied = signal(false);
  protected successToastCodeCopied = signal(false);
  protected errorToastCodeCopied = signal(false);
  protected infoToastCodeCopied = signal(false);
  protected warningToastCodeCopied = signal(false);
  protected loadingToastCodeCopied = signal(false);

  private copyResetTimeout: ReturnType<typeof setTimeout> | null = null;

  protected renderToast(message: string): void {
    this.toaster.show(message);
  }
  protected readonly renderToastSource = computed(
    () => hljs.highlight(RENDER_TOAST_SOURCE, { language: 'typescript' }).value,
  );
  protected renderToastWithOptions() {
    this.toaster.show('This is a toast with options', {
      durationMs: 5000,
      icon: CustomIcon,
      classNames: {
        message: 'font-mono! text-[13px]!',
      },
    });
  }
  protected readonly toastWithOptionsSource = computed(
    () => hljs.highlight(TOAST_WITH_OPTIONS_SOURCE, { language: 'typescript' }).value,
  );
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

  private async copyToClipboard(
    source: string,
    copiedSignal: ReturnType<typeof signal<boolean>>,
  ): Promise<void> {
    try {
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
