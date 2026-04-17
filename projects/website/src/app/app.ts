import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToasterService, BetterToaster } from 'better-toast';
import { WebsiteToasterDemoLayoutService } from './website-toaster-demo-layout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BetterToaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly toaster = inject(ToasterService);
  protected readonly toasterDemoLayout = inject(WebsiteToasterDemoLayoutService);

  ngOnInit(): void {
    this.toaster.show('ngOnInit', { durationMs: 3000 });
  }
}
