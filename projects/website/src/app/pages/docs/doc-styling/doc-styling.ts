import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-doc-styling',
  imports: [],
  templateUrl: './doc-styling.html',
  styleUrl: './doc-styling.css',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocStyling {
  private readonly meta = inject(Meta);

  constructor() {
    this.meta.updateTag({
      name: 'description',
      content:
        'Style Better Toast to match your app. Theming, CSS class hooks, and design tokens for light and dark UI.',
    });
  }
}
