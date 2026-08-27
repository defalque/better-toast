import { NgOptimizedImage } from '@angular/common';
import { afterNextRender, Component, ElementRef, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-doc-changelog',
  templateUrl: './doc-changelog.html',
  styleUrl: './doc-changelog.css',
  imports: [NgOptimizedImage, RouterLink],
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
    '(window:scroll)': 'syncActiveSection()',
    '(window:resize)': 'syncActiveSection()',
  },
})
export class DocChangelog {
  private readonly host = inject(ElementRef);
  private readonly meta = inject(Meta);
  protected activeSection = signal('0.2.0');


  constructor() {
    this.meta.updateTag({
      name: 'description',
      content: 'Release history for the better-toast library.',
    });

    afterNextRender(() => this.syncActiveSection());
  }

  /** Match sidebar offset used elsewhere (-120px region); keeps TOC in sync on short pages. */
  protected syncActiveSection(): void {
    const hostEl = this.host.nativeElement as HTMLElement;
    const tocLinks = Array.from(
      hostEl.querySelectorAll<HTMLAnchorElement>('.toc-content a[href*="#"]'),
    );

    const sections = tocLinks
      .map((link) => {
        const id = link.hash.slice(1);
        const target = document.getElementById(id);

        return target ? { id, target } : null;
      })
      .filter((section): section is { id: string; target: HTMLElement } => section !== null);

    if (sections.length === 0) {
      return;
    }

    const scrollLinePx = 130;
    const remaining =
      document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    const lastSection = sections[sections.length - 1];

    if (remaining <= 8) {
      this.activeSection.set(lastSection.id);
      return;
    }

    let active = sections[0].id;
    for (const section of sections) {
      if (section.target.getBoundingClientRect().top <= scrollLinePx) {
        active = section.id;
      }
    }
    this.activeSection.set(active);
  }

  protected tocLinkClass(section: string): string {
    return this.activeSection() === section
      ? 'text-black dark:text-white'
      : 'text-zinc-600 dark:text-zinc-300/75';
  }
}
