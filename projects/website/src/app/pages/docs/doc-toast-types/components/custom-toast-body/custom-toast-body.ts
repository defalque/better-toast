import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-home-custom-toast-body',
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <span>
    Check my website:
    <a
      href="https://marcodefalco.dev"
      target="_blank"
      rel="noopener noreferrer"
      class="text-orange-600 dark:text-orange-400 font-medium italic hover:underline"
    >
      marcodefalco.dev
    </a>
  </span>`,
})
export class HomeCustomToastBody {
  readonly toastId = input<string>('');
}
