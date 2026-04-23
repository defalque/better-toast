import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToasterService, BetterToaster } from 'better-toast';
import { HelperService } from './helper.service';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BetterToaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly toaster = inject(ToasterService);
  protected readonly helper = inject(HelperService);
  protected readonly theme = inject(ThemeService);

  protected readonly richColors = computed(() => this.helper.richColors());

  /* ngOnInit(): void {
    this.toaster.show('Hello, world!');
  }

  ngAfterViewInit(): void {
    this.toaster.show('Hello, world!');
  } */
}
