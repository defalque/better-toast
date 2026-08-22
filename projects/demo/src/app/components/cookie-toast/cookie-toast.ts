import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'app-cookie-toast',
  imports: [],
  templateUrl: './cookie-toast.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './cookie-toast.css',
})
export class CookieToast {
  protected readonly toaster = inject(ToasterService);

  /** Set automatically by `ToasterService.headless()`; use with `dismiss()`. */
  protected readonly toastId = input<string>('');

  protected readonly title = input<string>('');
  protected readonly message = input<string>('');
  protected readonly subMessage = input<string>('');
}
