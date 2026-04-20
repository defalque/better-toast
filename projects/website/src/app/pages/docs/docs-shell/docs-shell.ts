import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-docs-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './docs-shell.html',
})
export class DocsShell {}
