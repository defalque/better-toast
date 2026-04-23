import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService, type ThemePreference } from '../../theme.service';

interface Option {
  readonly value: ThemePreference;
  readonly label: string;
}

const OPTIONS: readonly Option[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-toggle.html',
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
  protected readonly options = OPTIONS;

  protected select(value: ThemePreference): void {
    this.theme.setPreference(value);
  }
}
