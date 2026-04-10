import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetterToast } from './better-toast';

describe('BetterToast', () => {
  let component: BetterToast;
  let fixture: ComponentFixture<BetterToast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BetterToast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetterToast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
