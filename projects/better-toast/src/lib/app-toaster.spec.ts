import { TestBed } from '@angular/core/testing';

import { AppToaster } from './app-toaster';
import { AppToasterService } from './app-toaster.service';

describe('better-toast', () => {
  it('shows and dismisses a toast via the service', () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const toaster = TestBed.inject(AppToasterService);

    expect(toaster.toasts().length).toBe(0);
    toaster.show('Hello', 0);
    expect(toaster.toasts().length).toBe(1);
    expect(toaster.toasts()[0].message).toBe('Hello');
    expect(toaster.toasts()[0].variant).toBe('default');

    toaster.dismiss(toaster.toasts()[0].id);
    expect(toaster.toasts().length).toBe(0);
  });

  it('uses the position input on the container', async () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const fixture = TestBed.createComponent(AppToaster);
    fixture.componentRef.setInput('position', 'top-left');
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.getAttribute('data-position')).toBe('top-left');
  });

  it('sets variant on items from typed helpers', () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const toaster = TestBed.inject(AppToasterService);

    toaster.success('ok');
    expect(toaster.toasts()[0].variant).toBe('success');

    toaster.error('bad');
    expect(toaster.toasts()[1].variant).toBe('error');

    toaster.loading('wait');
    expect(toaster.toasts()[2].variant).toBe('loading');
  });
});
