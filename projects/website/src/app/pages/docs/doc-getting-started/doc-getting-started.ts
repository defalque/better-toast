import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
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

type GettingStartedDocSection =
  | 'installation'
  | 'add-better-toaster-to-your-app'
  | 'render-a-toast';

@Component({
  selector: 'app-doc-getting-started',
  templateUrl: './doc-getting-started.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  styleUrl: './doc-getting-started.css',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocGettingStarted {
  private readonly meta = inject(Meta);
  private copyResetTimeout: ReturnType<typeof setTimeout> | null = null;
  protected readonly enterEnabled = signal(false);

  protected readonly installationCodeCopied = signal(false);
  protected readonly usageCodeCopied = signal(false);
  protected readonly typesCodeCopied = signal(false);

  protected activeSection = signal<GettingStartedDocSection>('installation');
  protected readonly destroyRef = inject(DestroyRef);

  private watchTocTargets(): void {
    const tocLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.toc-content a[href*="#"]'),
    );

    const sections = tocLinks
      .map((link) => {
        const id = link.hash.slice(1);
        const target = document.getElementById(id);

        return this.isGettingStartedDocSection(id) && target ? { id, target } : null;
      })
      .filter(
        (section): section is { id: GettingStartedDocSection; target: HTMLElement } =>
          section !== null,
      );

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (!visibleEntry) {
          return;
        }

        const activeSection = sections.find((section) => section.target === visibleEntry.target);

        if (activeSection) {
          this.activeSection.set(activeSection.id);
        }
      },
      {
        rootMargin: '-120px 0px -70% 0px',
        threshold: 0,
      },
    );

    for (const section of sections) {
      observer.observe(section.target);
    }

    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private isGettingStartedDocSection(id: string): id is GettingStartedDocSection {
    return ['installation', 'add-better-toaster-to-your-app', 'render-a-toast'].includes(id);
  }

  protected tocLinkClass(section: GettingStartedDocSection): string {
    return this.activeSection() === section
      ? 'text-black dark:text-white'
      : 'text-zinc-600 dark:text-zinc-300/75';
  }

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

      this.watchTocTargets();
    });
  }

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
