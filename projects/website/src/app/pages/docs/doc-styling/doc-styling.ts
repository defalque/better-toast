import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ToasterService } from 'better-toast';
import hljs from 'highlight.js';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { HeadlessComponent } from '../../../components/headless-component/headless-component';
import { RouterLink } from '@angular/router';

hljs.registerLanguage('xml', xml);
hljs.registerLanguage('typescript', typescript);

const GLOBAL_STYLES_SOURCE = `<better-toaster
  [toastOptions]="{
    style: {
      background: 'red',
    },
  }"
/>`;

const SPECIFIC_STYLES_SOURCE = `this.toaster.show('Hello, world!', {
  style: {
    background: 'green',
  },
});`;

const STYLING_SPECIFIC_ELEMENTS_SOURCE = `<app-toaster
  [toastOptions]="{
    classNames: {
      toast: 'my-toast',
      message: 'my-toast-title',
      description: 'my-toast-description',
      closeButton: 'my-toast-close',
      actionButton: 'my-toast-action',
      cancelButton: 'my-toast-cancel'
    }
  }"
/>`;

const STYLING_SPECIFIC_ELEMENTS_TAILWIND_SOURCE = `<app-toaster
  [toastOptions]="{
    classNames: {
      toast: 'bg-red-500! text-white!',
    },
  }"
/>`;

const STYLING_SPECIFIC_ELEMENT_SOURCE = `this.toaster.show('Hello, world!', {
  classNames: {
     message: 'my-toast-title',
  },
});`;

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

type StylingDocSection = 'global-styles' | 'styling-specific-elements' | 'headless';

@Component({
  selector: 'app-doc-styling',
  imports: [RouterLink],
  templateUrl: './doc-styling.html',
  styleUrl: './doc-styling.css',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocStyling {
  private readonly meta = inject(Meta);
  protected readonly enterEnabled = signal(false);

  protected activeSection = signal<StylingDocSection>('global-styles');
  protected readonly destroyRef = inject(DestroyRef);

  private watchTocTargets(): void {
    const tocLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.toc-content a[href*="#"]'),
    );

    const sections = tocLinks
      .map((link) => {
        const id = link.hash.slice(1);
        const target = document.getElementById(id);

        return this.isStylingDocSection(id) && target ? { id, target } : null;
      })
      .filter(
        (section): section is { id: StylingDocSection; target: HTMLElement } => section !== null,
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

  private isStylingDocSection(id: string): id is StylingDocSection {
    return ['global-styles', 'styling-specific-elements', 'headless'].includes(id);
  }

  protected tocLinkClass(section: StylingDocSection): string {
    return this.activeSection() === section
      ? 'text-black dark:text-white'
      : 'text-zinc-600 dark:text-zinc-300/75';
  }

  constructor() {
    this.meta.updateTag({
      name: 'description',
      content:
        'Style Better Toast to match your app. Theming, CSS class hooks, and design tokens for light and dark UI.',
    });

    afterNextRender(() => {
      setTimeout(() => {
        this.enterEnabled.set(true);
      }, 100);

      this.watchTocTargets();
    });
  }

  private copyResetTimeout: ReturnType<typeof setTimeout> | null = null;

  protected readonly toaster = inject(ToasterService);
  protected headlessToastTab = signal<'preview' | 'code'>('preview');
  protected headlessCodeCopied = signal(false);

  protected renderHeadlessToast() {
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

  protected globalStylesSource() {
    return hljs.highlight(GLOBAL_STYLES_SOURCE, { language: 'xml' }).value;
  }

  protected specificStylesSource() {
    return hljs.highlight(SPECIFIC_STYLES_SOURCE, { language: 'typescript' }).value;
  }

  protected stylingSpecificElementsSource() {
    return hljs.highlight(STYLING_SPECIFIC_ELEMENTS_SOURCE, { language: 'xml' }).value;
  }

  protected stylingSpecificElementsTailwindSource() {
    return hljs.highlight(STYLING_SPECIFIC_ELEMENTS_TAILWIND_SOURCE, { language: 'xml' }).value;
  }

  protected stylingSpecificElementSource() {
    return hljs.highlight(STYLING_SPECIFIC_ELEMENT_SOURCE, { language: 'typescript' }).value;
  }

  protected headlessSource() {
    return hljs.highlight(HEADLESS_TOAST_SOURCE, { language: 'typescript' }).value;
  }

  protected async copyCustomToastCode(): Promise<void> {
    await this.copyToClipboard(HEADLESS_TOAST_SOURCE, this.headlessCodeCopied);
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
