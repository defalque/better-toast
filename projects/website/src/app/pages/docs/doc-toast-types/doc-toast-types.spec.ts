import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocToastTypes } from './doc-toast-types';

describe('DocToastTypes', () => {
  let component: DocToastTypes;
  let fixture: ComponentFixture<DocToastTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocToastTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocToastTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
