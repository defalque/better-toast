import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToasterService, BetterToaster } from 'better-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BetterToaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly toaster = inject(ToasterService);

  ngOnInit(): void {
    this.toaster.show('Welcome to the Better Toast library!');
  }
}
