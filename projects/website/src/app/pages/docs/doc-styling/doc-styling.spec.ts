import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocStyling } from './doc-styling';

describe('DocStyling', () => {
  let component: DocStyling;
  let fixture: ComponentFixture<DocStyling>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocStyling]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocStyling);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
