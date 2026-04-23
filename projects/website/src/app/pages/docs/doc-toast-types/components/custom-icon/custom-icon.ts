import { Component } from '@angular/core';

@Component({
  selector: 'app-custom-icon',
  imports: [],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="fill-black! dark:fill-none! stroke-black! dark:stroke-white! size-4!"
    >
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M22 8c0-2.3-.8-4.3-2-6" />
      <path
        d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
      />
      <path d="M4 2C2.8 3.7 2 5.7 2 8" />
    </svg>
  `,
})
export class CustomIcon {}
