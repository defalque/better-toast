import { Injectable, signal } from '@angular/core';
import type { ToasterPosition } from 'better-toast';

@Injectable({ providedIn: 'root' })
export class HelperService {
  readonly position = signal<ToasterPosition>('top-right');
  readonly richColors = signal(false);
}
