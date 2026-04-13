import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AppToaster } from './app-toaster';
import { AppToasterService, TOAST_DURATION_MANUAL_DISMISS } from './app-toaster.service';

@Component({
  selector: 'bt-spec-success-icon',
  standalone: true,
  template: '<span class="bt-spec-custom-success-icon" aria-hidden="true">★</span>',
})
class SpecSuccessIcon {}

describe('better-toast', () => {
  it('shows and dismisses a toast via the service', () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const toaster = TestBed.inject(AppToasterService);

    expect(toaster.toasts().length).toBe(0);
    toaster.show('Hello', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    expect(toaster.toasts().length).toBe(1);
    expect(toaster.toasts()[0].message).toBe('Hello');
    expect(toaster.toasts()[0].variant).toBe('default');

    toaster.dismiss(toaster.toasts()[0].id);
    expect(toaster.toasts().length).toBe(0);
  });

  it('treats durationMs 0 as manual dismiss (backward compatible)', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [AppToaster] });
      const toaster = TestBed.inject(AppToasterService);
      toaster.show('Stay', { durationMs: 0 });
      expect(toaster.toasts().length).toBe(1);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(toaster.toasts().length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('treats per-toast durationMs literal Infinity as manual dismiss', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [AppToaster] });
      const toaster = TestBed.inject(AppToasterService);
      toaster.show('Stay', { durationMs: 'Infinity' });
      expect(toaster.toasts().length).toBe(1);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(toaster.toasts().length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('uses the position input on the container', async () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const fixture = TestBed.createComponent(AppToaster);
    fixture.componentRef.setInput('position', 'top-left');
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.getAttribute('data-position')).toBe('top-left');
    expect(container.getAttribute('data-rich-colors')).toBe('false');
  });

  it('enables semantic colors when richColors is true', async () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const fixture = TestBed.createComponent(AppToaster);
    fixture.componentRef.setInput('richColors', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.getAttribute('data-rich-colors')).toBe('true');
  });

  it('auto-dismisses using duration from AppToaster when duration is omitted', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [AppToaster] });
      const fixture = TestBed.createComponent(AppToaster);
      fixture.componentRef.setInput('duration', 1000);
      fixture.detectChanges();
      await fixture.whenStable();

      const toaster = TestBed.inject(AppToasterService);
      toaster.show('Hello');
      expect(toaster.toasts().length).toBe(1);
      await vi.advanceTimersByTimeAsync(1000);
      expect(toaster.toasts().length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('treats duration literal string Infinity as manual dismiss', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [AppToaster] });
      const fixture = TestBed.createComponent(AppToaster);
      fixture.componentRef.setInput('duration', 'Infinity');
      fixture.detectChanges();
      await fixture.whenStable();

      const toaster = TestBed.inject(AppToasterService);
      toaster.show('Stay');
      expect(toaster.toasts().length).toBe(1);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(toaster.toasts().length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not apply AppToaster duration to loading()', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [AppToaster] });
      const fixture = TestBed.createComponent(AppToaster);
      fixture.componentRef.setInput('duration', 500);
      fixture.detectChanges();
      await fixture.whenStable();

      const toaster = TestBed.inject(AppToasterService);
      toaster.loading('Wait');
      await vi.advanceTimersByTimeAsync(2000);
      expect(toaster.toasts().length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
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

  it('renders a custom success icon component when icons.success is set', async () => {
    TestBed.configureTestingModule({ imports: [AppToaster, SpecSuccessIcon] });
    const fixture = TestBed.createComponent(AppToaster);
    fixture.componentRef.setInput('icons', { success: SpecSuccessIcon });
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(AppToasterService);
    toaster.success('Custom icon', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.bt-spec-custom-success-icon')).toBeTruthy();
  });

  it('renders a per-toast icon from options.icon without global [icons]', async () => {
    TestBed.configureTestingModule({ imports: [AppToaster, SpecSuccessIcon] });
    const fixture = TestBed.createComponent(AppToaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(AppToasterService);
    toaster.success('Per-toast icon', { durationMs: TOAST_DURATION_MANUAL_DISMISS, icon: SpecSuccessIcon });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.bt-spec-custom-success-icon')).toBeTruthy();
  });

  it('hides the close button when closeButton is false', async () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const fixture = TestBed.createComponent(AppToaster);
    fixture.componentRef.setInput('closeButton', false);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(AppToasterService);
    toaster.show('No close', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.close-btn')).toBeNull();
  });

  it('shows the close button by default', async () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const fixture = TestBed.createComponent(AppToaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(AppToasterService);
    toaster.show('With close', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.close-btn')).toBeTruthy();
  });

  it('hides the icon when options.icon is null', async () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const fixture = TestBed.createComponent(AppToaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(AppToasterService);
    toaster.success('No icon', { durationMs: TOAST_DURATION_MANUAL_DISMISS, icon: null });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.toast-icon')).toBeNull();
  });

  it('hides the icon when [icons] sets that variant to null', async () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const fixture = TestBed.createComponent(AppToaster);
    fixture.componentRef.setInput('icons', { success: null });
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(AppToasterService);
    toaster.success('No global icon', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.toast-icon')).toBeNull();
  });

  it('custom() stores html and omits the default icon/message branch', async () => {
    TestBed.configureTestingModule({ imports: [AppToaster] });
    const fixture = TestBed.createComponent(AppToaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(AppToasterService);
    toaster.custom('<p class="x">Rich</p>', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toaster.toasts()[0].html).toBe('<p class="x">Rich</p>');
    expect(toaster.toasts()[0].message).toBe('');
    expect(toaster.toasts()[0].variant).toBe('default');

    const host = fixture.nativeElement.querySelector('li.toast') as HTMLElement;
    expect(host.querySelector('.toast-custom')?.innerHTML).toContain('Rich');
    expect(host.querySelector('.toast-main')).toBeNull();
    expect(host.querySelector('.toast-icon')).toBeNull();
    expect(host.querySelector('.msg')).toBeNull();
  });
});
