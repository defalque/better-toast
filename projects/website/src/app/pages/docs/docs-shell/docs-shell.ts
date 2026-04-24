import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeToggle } from '../../../components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-docs-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggle],
  templateUrl: './docs-shell.html',
  styleUrl: './docs-shell.css',
})
export class DocsShell {
  private readonly document = inject(DOCUMENT);

  protected openDrawer = signal(false);

  constructor() {
    effect((onCleanup) => {
      const open = this.openDrawer();
      const root = this.document.documentElement;
      const body = this.document.body;

      if (open) {
        root.classList.add('docs-shell-drawer-open');
        body.classList.add('docs-shell-drawer-open');
      } else {
        root.classList.remove('docs-shell-drawer-open');
        body.classList.remove('docs-shell-drawer-open');
      }

      onCleanup(() => {
        root.classList.remove('docs-shell-drawer-open');
        body.classList.remove('docs-shell-drawer-open');
      });
    });
  }
}
