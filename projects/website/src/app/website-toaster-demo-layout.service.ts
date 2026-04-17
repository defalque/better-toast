import { Injectable, signal } from '@angular/core';
import type { ToasterPosition } from 'better-toast';

/** Shared demo state so the home page can drive `<better-toaster [position]>` in `App`. */
@Injectable({ providedIn: 'root' })
export class WebsiteToasterDemoLayoutService {
  readonly position = signal<ToasterPosition>('top-right');
}
