import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToasterService, BetterToaster } from 'better-toast';
import { HelperService } from './helper.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BetterToaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly toaster = inject(ToasterService);
  protected readonly helper = inject(HelperService);

  protected readonly richColors = computed(() => this.helper.richColors());

  /* ngOnInit(): void {
    this.toaster.show('Hello, world!');
  }

  ngAfterViewInit(): void {
    this.toaster.show('Hello, world!');
  } */
}
