import { NgOptimizedImage } from '@angular/common';
import { Component, model, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeToggle } from '../../../components/theme-toggle/theme-toggle';
import {
  BetterDrawerRoot,
  BetterDrawerTrigger,
  BetterDrawerOverlay,
  BetterDrawerContent,
  BetterDrawerTitle,
  BetterDrawerPortal,
} from 'better-drawer';

@Component({
  selector: 'app-docs-shell',
  imports: [
    NgOptimizedImage,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ThemeToggle,
    BetterDrawerRoot,
    BetterDrawerTrigger,
    BetterDrawerOverlay,
    BetterDrawerContent,
    BetterDrawerTitle,
    BetterDrawerPortal,
  ],
  templateUrl: './docs-shell.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './docs-shell.css',
})
export class DocsShell {
  protected openDrawer = model(false);
}
