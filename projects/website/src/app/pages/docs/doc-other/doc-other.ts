import { Component, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ToasterService } from 'better-toast';
import hljs from 'highlight.js';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('typescript', typescript);

const ON_DISMISS_CALLBACK_SOURCE = `import { Component, inject } from '@angular/core';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'app-on-dismiss-callback',
  imports: [],
  template: '
    <button (click)="renderToast()" type="button" class="btn">Render a toast</button>
  ',
})
export class OnDismissCallback {
  protected readonly toaster = inject(ToasterService);

  protected renderToast(): void {
    this.toaster.show('This is a toast', {
      durationMs: 3000,
      onDismiss: () => {
        console.log('Toast dismissed');
      },
    });
  }
}`;

const ON_AUTO_CLOSE_CALLBACK_SOURCE = `import { Component, inject } from '@angular/core';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'app-on-auto-close-callback',
  imports: [],
  template: '
    <button (click)="renderToast()" type="button" class="btn">Render a toast</button>
  ',
})
export class OnAutoCloseCallback {
  protected readonly toaster = inject(ToasterService);

  protected renderToast(): void {
    this.toaster.show('This is a toast', {
      durationMs: 3000,
      onAutoClose: () => {
        console.log('Toast auto closed');
      },
    });
  }
}`;

@Component({
  selector: 'app-doc-other',
  imports: [],
  templateUrl: './doc-other.html',
  styleUrl: './doc-other.css',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocOther {
  private readonly meta = inject(Meta);

  constructor() {
    this.meta.updateTag({
      name: 'description',
      content:
        'Callbacks, auto-close, duration, and extra behaviors. Dismiss handling and patterns beyond basic toasts in Better Toast.',
    });
  }

  protected readonly toaster = inject(ToasterService);

  protected programmaticDismissSource(): string {
    return hljs.highlight(
      `protected readonly toaster = inject(ToasterService);
const toastId = this.toaster.show('This is a toast');
this.toaster.dismiss(toastId);`,
      {
        language: 'typescript',
      },
    ).value;
  }

  protected clearAllToastsSource(): string {
    return hljs.highlight(
      `protected readonly toaster = inject(ToasterService);
this.toaster.clear();`,
      {
        language: 'typescript',
      },
    ).value;
  }

  private copyResetTimeout: ReturnType<typeof setTimeout> | null = null;

  protected onDismissCallbackTab = signal<'preview' | 'code'>('preview');
  protected onDismissCallbackCodeCopied = signal(false);
  protected onDismissCallbackSource(): string {
    return hljs.highlight(ON_DISMISS_CALLBACK_SOURCE, { language: 'typescript' }).value;
  }
  protected async copyOnDismissCallbackCode(): Promise<void> {
    await this.copyToClipboard(ON_DISMISS_CALLBACK_SOURCE, this.onDismissCallbackCodeCopied);
  }

  protected onAutoCloseCallbackTab = signal<'preview' | 'code'>('preview');
  protected onAutoCloseCallbackCodeCopied = signal(false);
  protected onAutoCloseCallbackSource(): string {
    return hljs.highlight(ON_AUTO_CLOSE_CALLBACK_SOURCE, { language: 'typescript' }).value;
  }
  protected async copyOnAutoCloseCallbackCode(): Promise<void> {
    await this.copyToClipboard(ON_AUTO_CLOSE_CALLBACK_SOURCE, this.onAutoCloseCallbackCodeCopied);
  }

  protected renderToast(): void {
    this.toaster.show('This is a toast', {
      durationMs: 3000,
      onDismiss: () => {
        console.log('Toast dismissed');
      },
      onAutoClose: () => {
        console.log('Toast auto closed');
      },
    });
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
