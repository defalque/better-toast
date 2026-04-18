import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { TOASTER_POSITIONS, ToasterService, type ToasterPosition } from 'better-toast';
import { WebsiteToasterDemoLayoutService } from '../../website-toaster-demo-layout.service';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

/** highlight.js does not wrap camelCase bindings in `import { … }` (only PascalCase types). Match `inject()` styling. */
function wrapInjectableImportBinding(html: string): string {
  return html.replace(/\{ inject,/g, '{ <span class="hljs-title function_">inject</span>,');
}

const TOAST_DEMO_SOURCE = {
  installation: `npm install better-toast`,
  usage: `import { BetterToaster, ToasterService } from 'better-toast';
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
})
export class App {
  protected readonly toaster = inject(ToasterService);

  protected showToast(): void {
    this.toaster.show('Hello, world!');
  }
}`,
  richColors: `<better-toaster [richColors]="true" />`,
};

const TOAST_TYPE_SOURCE = {
  default: `this.toaster.show('Default toast. A very super long message that should wrap.');`,
  success: `this.toaster.success('Saved successfully');`,
  error: `this.toaster.error('Something went wrong');`,
  info: `this.toaster.info('Tip: you can stack multiple toasts');`,
  warning: `this.toaster.warning('Your session will expire soon');`,
  loading: `this.toaster.loading('Loading…');`,
  action: `this.toaster.action('Archive this item?', {
  action: {
    label: 'Archive',
    onClick: () => {
     console.log('Item archived');
    },
  },
});`,
  cancel: `this.toaster.cancel('Undo sent message?', {
  cancel: {
    label: 'Undo',
    onClick: () => {
     console.log('Message undone');
    },
  },
});`,
  custom: `this.toaster.custom('<strong>HTML</strong> is allowed.', {
  durationMs: 4000,
});`,
  promise: `const myPromise = new Promise<{ message: string }>((resolve) => {
  setTimeout(() => {
    resolve({ message: 'Better Toast rendered successfully' });
  }, 3000);
});

this.toaster.promise(myPromise, {
  loading: 'Saving…',
  success: (data) => \`\${data.message}\`,
  error: 'Promise rejected',
});`,
} as const;

type ToastType = keyof typeof TOAST_TYPE_SOURCE;

const POSITION_DEMO_SOURCE = Object.fromEntries(
  TOASTER_POSITIONS.map((p) => [p, `<better-toaster position="${p}" />`]),
) as Record<ToasterPosition, string>;

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly toaster = inject(ToasterService);
  protected readonly toasterDemoLayout = inject(WebsiteToasterDemoLayoutService);

  protected readonly toastInstallationSource = computed(() => {
    const { value } = hljs.highlight(TOAST_DEMO_SOURCE.installation, { language: 'bash' });
    return this.sanitizer.bypassSecurityTrustHtml(value);
  });

  protected readonly toastUsageSource = computed(() => {
    const { value } = hljs.highlight(TOAST_DEMO_SOURCE.usage, { language: 'typescript' });
    return this.sanitizer.bypassSecurityTrustHtml(wrapInjectableImportBinding(value));
  });

  protected readonly toastRichColorsSource = computed(() => {
    const { value } = hljs.highlight(TOAST_DEMO_SOURCE.richColors, { language: 'xml' });
    return this.sanitizer.bypassSecurityTrustHtml(value);
  });

  protected readonly toasterPositions = TOASTER_POSITIONS;

  /** highlight.js HTML for the selected `<better-toaster>` position snippet. */
  protected readonly activePositionDemoHtml = computed<SafeHtml>(() => {
    const src = POSITION_DEMO_SOURCE[this.toasterDemoLayout.position()];
    const { value } = hljs.highlight(src, { language: 'xml' });
    return this.sanitizer.bypassSecurityTrustHtml(value);
  });

  protected selectPositionDemo(pos: ToasterPosition): void {
    this.toasterDemoLayout.position.set(pos);
  }

  /** Which example’s source is shown in the preview (updates on button click). */
  protected readonly activeTypeDemo = signal<ToastType>('default');

  /** highlight.js HTML for the active example. */
  protected readonly activeTypeDemoHtml = computed<SafeHtml>(() => {
    const src = TOAST_TYPE_SOURCE[this.activeTypeDemo()];
    const { value } = hljs.highlight(src, { language: 'typescript' });
    return this.sanitizer.bypassSecurityTrustHtml(value);
  });

  protected runTypeDemo(id: ToastType): void {
    this.activeTypeDemo.set(id);
    switch (id) {
      case 'default':
        this.toaster.show('Default toast. A very super long message that should wrap.');
        break;
      case 'success':
        this.toaster.success('Saved successfully');
        break;
      case 'error':
        this.toaster.error('Something went wrong');
        break;
      case 'info':
        this.toaster.info('Tip: you can stack multiple toasts');
        break;
      case 'warning':
        this.toaster.warning('Your session will expire soon');
        break;
      case 'loading':
        this.toaster.loading('Loading…');
        break;
      case 'action': {
        this.toaster.action('Archive this item?', {
          action: {
            label: 'Archive',
            onClick: () => {
              console.log('Item archived');
            },
          },
        });
        break;
      }
      case 'cancel': {
        this.toaster.cancel('Undo sent message?', {
          cancel: {
            label: 'Undo',
            onClick: () => {
              console.log('Message undone');
            },
          },
        });
        break;
      }
      case 'custom':
        this.toaster.custom('<strong>HTML</strong> is allowed.', { durationMs: 4000 });
        break;
      case 'promise':
        this.toaster.promise(
          new Promise<{ message: string }>((resolve) => {
            setTimeout(() => resolve({ message: 'Better Toast rendered successfully' }), 2000);
          }),
          {
            loading: 'Saving…',
            success: (data) => `${data.message}`,
            error: 'Failed to save',
          },
        );
        break;
      default: {
        const _exhaustive: never = id;
        return _exhaustive;
      }
    }
  }

  protected renderToast() {
    this.toaster.show('This is a toast, swipe and release to dismiss.');
  }
}
