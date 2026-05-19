import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TOASTER_POSITIONS, ToasterService, type ToasterPosition } from 'better-toast';
import { HelperService } from '../../helper.service';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { HeadlessComponent } from '../../components/headless-component/headless-component';
import { HomeCustomToastBody } from '../docs/doc-toast-types/components/custom-toast-body/custom-toast-body';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

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
  custom: `this.toaster.custom(CustomToastBody, {
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
  headless: `this.toaster.headless(MusicPlayerToast, {
  durationMs: 'Infinity',
  inputs: {
    songTitle: 'Stay',
    songImage: 'https://cdn-images.dzcdn.net/images/cover/dd6fe7fa9267185c4b835bd4f155d1d2/0x1900-000000-80-0-0.jpg',
    songArtist: 'The Kid Laroi, Justin Bieber',
  },
});`,
} as const;

type ToastType = keyof typeof TOAST_TYPE_SOURCE;
type RichColorType = 'success' | 'error' | 'info' | 'warning';

const POSITION_DEMO_SOURCE = Object.fromEntries(
  TOASTER_POSITIONS.map((p) => [p, `<better-toaster position="${p}" />`]),
) as Record<ToasterPosition, string>;

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly meta = inject(Meta);

  constructor() {
    this.meta.updateTag({
      name: 'description',
      content:
        'Toast notifications for Angular. Lightweight, accessible, and headless. Style with CSS and ship better UX in minutes.',
    });
  }

  protected readonly toaster = inject(ToasterService);
  protected readonly helper = inject(HelperService);

  protected readonly toastTypes = Object.keys(TOAST_TYPE_SOURCE) as ToastType[];
  protected readonly toasterPositions = TOASTER_POSITIONS;
  protected readonly richColorTypes: readonly RichColorType[] = [
    'success',
    'error',
    'info',
    'warning',
  ];

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
    this.helper.position.set(pos);
  }
  /** highlight.js HTML for better-toaster position. */
  protected readonly activePositionDemoHtml = computed(() => {
    return hljs.highlight(POSITION_DEMO_SOURCE[this.helper.position()], {
      language: 'xml',
    }).value;
  });

  protected readonly activeTypeDemo = signal<ToastType>('default');
  protected readonly activeRichColorDemo = signal<RichColorType>('success');
  /** highlight.js HTML for the active type example. */
  protected readonly activeTypeDemoHtml = computed(() => {
    return hljs.highlight(TOAST_TYPE_SOURCE[this.activeTypeDemo()], { language: 'typescript' })
      .value;
  });

  protected runTypeDemo(id: ToastType): void {
    this.activeTypeDemo.set(id);
    if (this.helper.richColors()) this.helper.richColors.set(false);
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
        this.toaster.custom(HomeCustomToastBody);
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
      case 'headless':
        this.toaster.headless(HeadlessComponent, {
          durationMs: 'Infinity',
          inputs: {
            songTitle: 'Stay',
            songImage:
              'https://cdn-images.dzcdn.net/images/cover/dd6fe7fa9267185c4b835bd4f155d1d2/0x1900-000000-80-0-0.jpg',
            songArtist: 'The Kid Laroi, Justin Bieber',
          },
        });
        break;
      default: {
        const _exhaustive: never = id;
        return _exhaustive;
      }
    }
  }

  protected runRichColorsDemo(id: RichColorType): void {
    this.activeRichColorDemo.set(id);
    this.helper.richColors.set(true);
    switch (id) {
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
