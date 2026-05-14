import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import hljs from 'highlight.js';
import xml from 'highlight.js/lib/languages/xml';
import { RouterLink } from '@angular/router';

hljs.registerLanguage('xml', xml);

type BetterToasterDocSection =
  | 'customization'
  | 'position'
  | 'duration'
  | 'offsets'
  | 'theme'
  | 'rich-colors'
  | 'close-button'
  | 'icons'
  | 'accessibility-labels'
  | 'api-reference';

@Component({
  selector: 'app-doc-better-toaster',
  imports: [RouterLink],
  templateUrl: './doc-better-toaster.html',
  styleUrl: './doc-better-toaster.css',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocBetterToaster {
  private readonly meta = inject(Meta);

  protected activeSection = signal<BetterToasterDocSection>('customization');
  protected readonly destroyRef = inject(DestroyRef);

  private watchTocTargets(): void {
    const tocLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.toc-content a[href*="#"]'),
    );

    const sections = tocLinks
      .map((link) => {
        const id = link.hash.slice(1);
        const target = document.getElementById(id);

        return this.isBetterToasterDocSection(id) && target ? { id, target } : null;
      })
      .filter(
        (section): section is { id: BetterToasterDocSection; target: HTMLElement } =>
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

  private isBetterToasterDocSection(id: string): id is BetterToasterDocSection {
    return [
      'customization',
      'position',
      'duration',
      'offsets',
      'theme',
      'rich-colors',
      'close-button',
      'icons',
      'accessibility-labels',
      'api-reference',
    ].includes(id);
  }

  protected tocLinkClass(section: BetterToasterDocSection): string {
    return this.activeSection() === section
      ? 'text-black dark:text-white'
      : 'text-zinc-500 dark:text-zinc-300/75';
  }

  constructor() {
    this.meta.updateTag({
      name: 'description',
      content:
        'Host component for the toast stack. Position, theming, and configuration options for the BetterToaster in Angular.',
    });

    afterNextRender(() => {
      this.watchTocTargets();
    });
  }

  protected readonly positionSource = computed(() => {
    return hljs.highlight(
      `<!-- Render toasts at the bottom right corner of the viewport -->
<!-- Available positions: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right -->
<better-toaster position="bottom-right" />`,
      {
        language: 'xml',
      },
    ).value;
  });

  protected readonly durationSource = computed(() => {
    return hljs.highlight(
      `<!-- Duration must be specified in milliseconds -->
<!-- To keep toasts visible until manually dismissed use "Infinity" literal -->
<better-toaster [duration]="4000" />`,
      {
        language: 'xml',
      },
    ).value;
  });

  protected readonly offsetsSource = computed(() => {
    return hljs.highlight(
      `<!-- All sides will have 32px offset -->
<better-toaster  offset="32px" />

<!-- All sides will have 10vh offset -->
<better-toaster  offset="10vh" />

<!-- 24px from the bottom, 16px from the right and left -->
<better-toaster  [offset]="{ bottom: '24px', right: '16px', left: '16px' }" />

<!-- All sides will have 32px offset in mobile devices -->
<better-toaster 
  [mobileOffset]="{ top: '32px', right: '32px', bottom: '32px', left: '32px' }"
/>`,
      {
        language: 'xml',
      },
    ).value;
  });

  protected readonly themeSource = computed(() => {
    return hljs.highlight(
      `<!-- Available themes: light, dark, system -->
<better-toaster theme="light" />`,
      {
        language: 'xml',
      },
    ).value;
  });

  protected readonly richColorsSource = computed(() => {
    return hljs.highlight(`<better-toaster [richColors]="true" />`, {
      language: 'xml',
    }).value;
  });

  protected readonly closeButtonSource = computed(() => {
    return hljs.highlight(`<better-toaster [closeButton]="false" />`, {
      language: 'xml',
    }).value;
  });

  protected readonly iconsSource = computed(() => {
    return hljs.highlight(
      `<!-- app-custom-success-icon.component.ts -->
<!-- Use fill/stroke utilities (including dark: variants) on the SVG so the icon matches light and dark themes. -->
<!-- recommended stroke-width is "1.75" -->
@Component({
  selector: 'app-custom-success-icon',
  standalone: true,
  template: \`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
      stroke-width="1.75"  
      class="fill-black! dark:fill-none! stroke-black! dark:stroke-white! size-4!"
    >
      <!-- Your SVG code here -->
    </svg>
  \`,
})
export class CustomSuccessIconComponent {}

<!-- app.html -->
<better-toaster 
  [icons]="{
    default: CustomDefaultIconComponent,
    description: CustomDescriptionIconComponent,
    success: CustomSuccessIconComponent,
    error: null,
    info: CustomInfoIconComponent,
    warning: null,
    loading: CustomLoadingIconComponent,
  }"
/>`,
      {
        language: 'xml',
      },
    ).value;
  });

  protected readonly accessibilityLabelsSource = computed(() => {
    return hljs.highlight(
      `<!-- Override the default accessibility labels to italian -->
<better-toaster
  [accessibilityLabels]="{
    notificationsRegion: 'Notifiche',
    dismissButton: 'Chiudi',
  }"
/>`,
      {
        language: 'xml',
      },
    ).value;
  });
}
