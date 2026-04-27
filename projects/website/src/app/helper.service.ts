import { Injectable, signal } from '@angular/core';
import type { ToasterPosition } from 'better-toast';

@Injectable({ providedIn: 'root' })
export class HelperService {
  readonly position = signal<ToasterPosition>('bottom-right');
  readonly richColors = signal(false);
}
