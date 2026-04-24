import { Component, computed, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import hljs from 'highlight.js';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('xml', xml);

@Component({
  selector: 'app-doc-better-toaster',
  imports: [],
  templateUrl: './doc-better-toaster.html',
  styleUrl: './doc-better-toaster.css',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocBetterToaster {
  private readonly meta = inject(Meta);

  constructor() {
    this.meta.updateTag({
      name: 'description',
      content:
        'Host component for the toast stack. Position, theming, and configuration options for the BetterToaster in Angular.',
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
<!-- recommended to use "currentColor" for fill and stroke -->
<!-- recommended stroke-width is "1.75" -->
@Component({
  selector: 'app-custom-success-icon',
  standalone: true,
  template: \`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
      fill="currentColor"  
      stroke="currentColor" 
      stroke-width="1.75"  
      ...
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
