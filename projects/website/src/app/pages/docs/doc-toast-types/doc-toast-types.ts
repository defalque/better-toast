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

  protected toastCodeCopied = signal(false);
  protected toastWithOptionsCodeCopied = signal(false);

  private copyResetTimeout: ReturnType<typeof setTimeout> | null = null;

  protected renderToast(message: string): void {
    this.toaster.show(message);
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

  protected async copyToastCode(): Promise<void> {
    await this.copyToClipboard(RENDER_TOAST_SOURCE, this.toastCodeCopied);
  }

  protected async copyToastWithOptionsCode(): Promise<void> {
    await this.copyToClipboard(TOAST_WITH_OPTIONS_SOURCE, this.toastWithOptionsCodeCopied);
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

  protected readonly renderToastSource = computed(
    () => hljs.highlight(RENDER_TOAST_SOURCE, { language: 'typescript' }).value,
  );
  protected readonly toastWithOptionsSource = computed(
    () => hljs.highlight(TOAST_WITH_OPTIONS_SOURCE, { language: 'typescript' }).value,
  );
}
