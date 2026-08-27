import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DocChangelog } from './doc-changelog';

describe('DocChangelog', () => {
  let component: DocChangelog;
  let fixture: ComponentFixture<DocChangelog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocChangelog],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DocChangelog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the 0.2.0 stacked toasts screenshot', () => {
    const img = fixture.nativeElement.querySelector(
      'img[alt="Collapsed card stack with the latest toast in front"]',
    ) as HTMLImageElement | null;

    expect(img).toBeTruthy();
    expect(img?.getAttribute('ng-src') ?? img?.getAttribute('src')).toContain(
      'changelog-stacked-toasts.png',
    );
  });
});
