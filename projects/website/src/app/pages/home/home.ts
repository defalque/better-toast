import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
  description: `this.toaster.description('Backup complete', {
  description:
    '12 files were uploaded to the cloud. You can restore them anytime from Settings.',
});`,
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
  protected readonly toaster = inject(ToasterService);
  protected readonly toasterDemoLayout = inject(WebsiteToasterDemoLayoutService);

  protected readonly toastTypes = Object.keys(TOAST_TYPE_SOURCE) as ToastType[];
  protected readonly toasterPositions = TOASTER_POSITIONS;

  protected readonly toastInstallationSource = computed(() => {
    return hljs.highlight(TOAST_DEMO_SOURCE.installation, { language: 'bash' }).value;
  });
  protected readonly toastUsageSource = computed(() => {
    const { value } = hljs.highlight(TOAST_DEMO_SOURCE.usage, { language: 'typescript' });
    return wrapInjectableImportBinding(value);
  });
  protected readonly toastRichColorsSource = computed(() => {
    return hljs.highlight(TOAST_DEMO_SOURCE.richColors, { language: 'xml' }).value;
  });

  protected selectPositionDemo(pos: ToasterPosition): void {
    this.toasterDemoLayout.position.set(pos);
  }
  /** highlight.js HTML for better-toaster position. */
  protected readonly activePositionDemoHtml = computed(() => {
    return hljs.highlight(POSITION_DEMO_SOURCE[this.toasterDemoLayout.position()], {
      language: 'xml',
    }).value;
  });

  protected readonly activeTypeDemo = signal<ToastType>('default');
  /** highlight.js HTML for the active type example. */
  protected readonly activeTypeDemoHtml = computed(() => {
    return hljs.highlight(TOAST_TYPE_SOURCE[this.activeTypeDemo()], { language: 'typescript' })
      .value;
  });

  protected runTypeDemo(id: ToastType): void {
    this.activeTypeDemo.set(id);
    switch (id) {
      case 'default':
        this.toaster.show('Default toast. A very super long message that should wrap.');
        break;
      case 'description':
        this.toaster.description('Backup complete', {
          description:
            '12 files were uploaded to the cloud. You can restore them anytime from Settings.',
        });
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
