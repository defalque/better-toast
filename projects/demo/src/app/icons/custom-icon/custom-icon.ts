import { Component } from '@angular/core';

/**
 * Example **standalone** toast icon: passed to `<app-toaster [icons]="{ success: CustomIcon }">`.
 * Uses `currentColor` so toast variant styles (via the library’s `::ng-deep` rules) apply.
 */
@Component({
  selector: 'app-custom-icon',
  imports: [],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
      />
      <path d="m9 12 2 2 4-4" />
    </svg>
  `,
})
export class CustomIcon {}
