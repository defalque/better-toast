import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocBetterToaster } from './doc-better-toaster';

describe('DocBetterToaster', () => {
  let component: DocBetterToaster;
  let fixture: ComponentFixture<DocBetterToaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocBetterToaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocBetterToaster);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
