import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import hljs from 'highlight.js';
import bash from 'highlight.js/lib/languages/bash';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('typescript', typescript);

const TOAST_INSTALLATION_SOURCE = 'npm install better-toast';

const TOAST_USAGE_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <better-toaster />
    <router-outlet />
  \`,
})
export class App {}`;

const TOAST_TYPES_SOURCE = `import { BetterToaster, ToasterService } from 'better-toast';
import { inject, ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [BetterToaster],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <better-toaster />
    <button (click)="showToast()">Show Toast</button>
    <router-outlet />
  \`,
}
export class App {
  protected readonly toaster = inject(ToasterService);

  protected showToast(): void {
      this.toaster.show('Hello, world!');
  }
}`;

@Component({
  selector: 'app-doc-getting-started',
  templateUrl: './doc-getting-started.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './doc-getting-started.css',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocGettingStarted {
  private readonly meta = inject(Meta);
  private copyResetTimeout: ReturnType<typeof setTimeout> | null = null;

  protected readonly installationCodeCopied = signal(false);
  protected readonly usageCodeCopied = signal(false);
  protected readonly typesCodeCopied = signal(false);

  constructor() {
    this.meta.updateTag({
      name: 'description',
      content:
        'Install Better Toast, register the provider, and show your first toast. A step-by-step guide for Angular applications.',
    });

    afterNextRender(() => {
      setTimeout(() => {
        this.enterEnabled.set(true);
      }, 100);
    });
  }

  protected readonly enterEnabled = signal(false);

  protected readonly toastInstallationSource = computed(() => {
    return hljs.highlight(TOAST_INSTALLATION_SOURCE, { language: 'bash' }).value;
  });

  protected readonly toastUsageSource = computed(() => {
    return hljs.highlight(TOAST_USAGE_SOURCE, { language: 'typescript' }).value;
  });

  protected readonly toastTypesSource = computed(() => {
    return hljs.highlight(TOAST_TYPES_SOURCE, { language: 'typescript' }).value;
  });

  protected async copyInstallationCode(): Promise<void> {
    await this.copyToClipboard(TOAST_INSTALLATION_SOURCE, this.installationCodeCopied);
  }

  protected async copyUsageCode(): Promise<void> {
    await this.copyToClipboard(TOAST_USAGE_SOURCE, this.usageCodeCopied);
  }

  protected async copyTypesCode(): Promise<void> {
    await this.copyToClipboard(TOAST_TYPES_SOURCE, this.typesCodeCopied);
  }

  private async copyToClipboard(
    source: string,
    copiedSignal: ReturnType<typeof signal<boolean>>,
  ): Promise<void> {
    try {
      if (copiedSignal()) {
        return;
      }
      this.installationCodeCopied.set(false);
      this.usageCodeCopied.set(false);
      this.typesCodeCopied.set(false);
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
