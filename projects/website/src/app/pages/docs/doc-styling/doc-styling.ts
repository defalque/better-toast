import { Component } from '@angular/core';

@Component({
  selector: 'app-doc-styling',
  imports: [],
  templateUrl: './doc-styling.html',
  styleUrl: './doc-styling.css',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocStyling {}
