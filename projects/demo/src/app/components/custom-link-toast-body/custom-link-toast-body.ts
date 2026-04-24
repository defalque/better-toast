import { Component, input } from '@angular/core';

@Component({
  selector: 'app-custom-link-toast-body',
  imports: [],
  template: `
    <span>
      Check my website:
      <a
        href="https://marcodefalco.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="text-orange-600 dark:text-orange-400 font-medium italic hover:underline"
      >
        marcodefalco.dev
      </a>
    </span>
  `,
})
export class CustomLinkToastBody {
  readonly toastId = input<string>('');
}
