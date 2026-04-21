import { Component, computed } from '@angular/core';
import hljs from 'highlight.js';
import bash from 'highlight.js/lib/languages/bash';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('typescript', typescript);

@Component({
  selector: 'app-doc-getting-started',
  templateUrl: './doc-getting-started.html',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocGettingStarted {
  protected readonly toastInstallationSource = computed(() => {
    return hljs.highlight(`npm install better-toast`, { language: 'bash' }).value;
  });

  protected readonly toastUsageSource = computed(() => {
    return hljs.highlight(
      `import { BetterToaster, ToasterService } from 'better-toast';
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
export class App {}`,
      { language: 'typescript' },
    ).value;
  });

  protected readonly toastTypesSource = computed(() => {
    return hljs.highlight(
      `import { BetterToaster, ToasterService } from 'better-toast';
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
}`,
      { language: 'typescript' },
    ).value;
  });
}
