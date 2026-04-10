import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AppToaster,
  AppToasterService,
  TOASTER_POSITIONS,
  type ToasterPosition,
} from 'better-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppToaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly toaster = inject(AppToasterService);
  protected readonly title = signal('demo');
  protected readonly positions = TOASTER_POSITIONS;
  protected readonly toasterPosition = signal<ToasterPosition>('bottom-right');

  protected showDefaultToast(): void {
    this.toaster.show('Default toast — neutral message. A very long message that should wrap.');
  }

  protected showSuccessToast(): void {
    this.toaster.success('Saved successfully.');
  }

  protected showErrorToast(): void {
    this.toaster.error('Something went wrong.');
  }

  protected showInfoToast(): void {
    this.toaster.info('Tip: you can stack multiple toasts.');
  }

  protected showWarningToast(): void {
    this.toaster.warning('Your session will expire soon.');
  }

  protected showLoadingToast(): void {
    this.toaster.loading('Loading…');
  }

  protected clearToasts(): void {
    this.toaster.clear();
  }

  protected onPositionChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if ((TOASTER_POSITIONS as readonly string[]).includes(select.value)) {
      this.toasterPosition.set(select.value as ToasterPosition);
    }
  }
}
