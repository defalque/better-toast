import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeToggle } from '../../../components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-docs-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggle],
  templateUrl: './docs-shell.html',
})
export class DocsShell {}
