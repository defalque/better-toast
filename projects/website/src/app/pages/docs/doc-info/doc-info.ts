import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';

type InfoDocSection = 'bundle-size' | 'caveats';

@Component({
  selector: 'app-doc-info',
  imports: [],
  templateUrl: './doc-info.html',
  styleUrl: './doc-info.css',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-auto',
  },
})
export class DocInfo {
  private readonly meta = inject(Meta);
  protected activeSection = signal<InfoDocSection>('bundle-size');
  protected readonly destroyRef = inject(DestroyRef);

  private watchTocTargets(): void {
    const tocLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.toc-content a[href*="#"]'),
    );

    const sections = tocLinks
      .map((link) => {
        const id = link.hash.slice(1);
        const target = document.getElementById(id);

        return this.isInfoDocSection(id) && target ? { id, target } : null;
      })
      .filter(
        (section): section is { id: InfoDocSection; target: HTMLElement } => section !== null,
      );

    if (sections.length === 0) {
      return;
    }

    /** Match sidebar offset used elsewhere (-120px region); keeps TOC in sync on short pages where IntersectionObserver often misses. */
    const scrollLinePx = 130;

    const updateActiveFromScroll = (): void => {
      const scrollable = document.documentElement;
      const nearBottom = window.scrollY + window.innerHeight >= scrollable.scrollHeight - 8;

      if (nearBottom) {
        this.activeSection.set(sections[sections.length - 1].id);
        return;
      }

      let active = sections[0].id;
      for (const s of sections) {
        if (s.target.getBoundingClientRect().top <= scrollLinePx) {
          active = s.id;
        }
      }
      this.activeSection.set(active);
    };

    updateActiveFromScroll();
    window.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    window.addEventListener('resize', updateActiveFromScroll, { passive: true });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', updateActiveFromScroll);
      window.removeEventListener('resize', updateActiveFromScroll);
    });
  }

  private isInfoDocSection(id: string): id is InfoDocSection {
    return ['bundle-size', 'caveats'].includes(id);
  }

  protected tocLinkClass(section: InfoDocSection): string {
    return this.activeSection() === section
      ? 'text-black dark:text-white'
      : 'text-zinc-600 dark:text-zinc-300/75';
  }

  constructor() {
    this.meta.updateTag({
      name: 'description',
      content:
        'Considerations for Better Toast: bundle size, browser compatibility, and CSS @starting-style support for entrance animations.',
    });

    afterNextRender(() => {
      this.watchTocTargets();
    });
  }
}
