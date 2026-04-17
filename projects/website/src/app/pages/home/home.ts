import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ToasterService } from 'better-toast';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('typescript', typescript);

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
    resolve({ message: 'Better-toast rendered successfully' });
  }, 3000);
});

this.toaster.promise(myPromise, {
  loading: 'Saving…',
  success: (data) => \`\${data.message}\`,
  error: 'Promise rejected',
});`,
} as const;

type ToastTypeDemoId = keyof typeof TOAST_TYPE_SOURCE;

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly toaster = inject(ToasterService);

  /** Which example’s source is shown in the preview (updates on button click). */
  protected readonly activeTypeDemo = signal<ToastTypeDemoId>('default');

  /** highlight.js HTML for the active example. */
  protected readonly activeTypeDemoHtml = computed<SafeHtml>(() => {
    const src = TOAST_TYPE_SOURCE[this.activeTypeDemo()];
    const { value } = hljs.highlight(src, { language: 'typescript' });
    return this.sanitizer.bypassSecurityTrustHtml(value);
  });

  protected runTypeDemo(id: ToastTypeDemoId): void {
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
          new Promise<string>((resolve) => {
            setTimeout(() => resolve('Done'), 2000);
          }),
          {
            loading: 'Saving…',
            success: 'Saved!',
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
    this.toaster.show('This is a toast, swipe it to dismiss');
  }
}
