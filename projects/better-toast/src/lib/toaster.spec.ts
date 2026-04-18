import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { BetterToaster as Toaster } from './toaster';
import { ToasterService, TOAST_DURATION_MANUAL_DISMISS } from './toaster.service';
import {
  DEFAULT_TOASTER_ARIA_DISMISS_BUTTON,
  DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION,
} from './toaster.types';

@Component({
  selector: 'bt-spec-success-icon',
  standalone: true,
  template: '<span class="bt-spec-custom-success-icon" aria-hidden="true">★</span>',
})
class SpecSuccessIcon {}

@Component({
  selector: 'bt-spec-default-icon',
  standalone: true,
  template: '<span class="bt-spec-custom-default-icon" aria-hidden="true">D</span>',
})
class SpecDefaultIcon {}

@Component({
  imports: [Toaster],
  template: '<better-toaster [duration]="\'Infinity\'" />',
})
class StartupDurationHost {
  private readonly toaster = inject(ToasterService);

  ngOnInit(): void {
    this.toaster.show('Startup toast');
  }
}

describe('better-toast', () => {
  it('shows and dismisses a toast via the service', () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const toaster = TestBed.inject(ToasterService);

    expect(toaster.toasts().length).toBe(0);
    toaster.show('Hello', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    expect(toaster.toasts().length).toBe(1);
    expect(toaster.toasts()[0].message).toBe('Hello');
    expect(toaster.toasts()[0].variant).toBe('default');

    toaster.dismiss(toaster.toasts()[0].id);
    expect(toaster.toasts().length).toBe(0);
  });

  it('description() uses the description variant and stores options.description', () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const toaster = TestBed.inject(ToasterService);

    toaster.description('Title', {
      description: 'Secondary line',
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
    });
    expect(toaster.toasts()[0].variant).toBe('description');
    expect(toaster.toasts()[0].message).toBe('Title');
    expect(toaster.toasts()[0].description).toBe('Secondary line');
  });

  it('description() renders a column stack with title and description', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.description('Hello', {
      description: 'Details here',
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector('li.toast') as HTMLElement;
    expect(host.getAttribute('data-variant')).toBe('description');
    const stack = host.querySelector('.toast-text-stack');
    expect(stack).toBeTruthy();
    expect(host.querySelector('.msg')?.textContent?.trim()).toBe('Hello');
    expect(host.querySelector('.description')?.textContent?.trim()).toBe('Details here');
  });

  it('success with options.description uses stacked layout and keeps success variant', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.success('Saved', {
      description: 'Your file is in Downloads.',
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector('li.toast') as HTMLElement;
    expect(host.getAttribute('data-variant')).toBe('success');
    expect(host.querySelector('.toast-text-stack')).toBeTruthy();
    expect(host.querySelector('.msg')?.textContent?.trim()).toBe('Saved');
    expect(host.querySelector('.description')?.textContent?.trim()).toBe(
      'Your file is in Downloads.',
    );
  });

  it('treats durationMs 0 as manual dismiss (backward compatible)', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [Toaster] });
      const toaster = TestBed.inject(ToasterService);
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
      TestBed.configureTestingModule({ imports: [Toaster] });
      const toaster = TestBed.inject(ToasterService);
      toaster.show('Stay', { durationMs: 'Infinity' });
      expect(toaster.toasts().length).toBe(1);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(toaster.toasts().length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('uses the toaster [duration] for toasts shown during host ngOnInit', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [StartupDurationHost] });
      const fixture = TestBed.createComponent(StartupDurationHost);
      fixture.detectChanges();
      await fixture.whenStable();

      const toaster = TestBed.inject(ToasterService);
      expect(toaster.toasts().length).toBe(1);

      await vi.advanceTimersByTimeAsync(60_000);

      expect(toaster.toasts().length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('uses the position input on the container', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('position', 'top-left');
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.getAttribute('data-position')).toBe('top-left');
    expect(container.getAttribute('data-rich-colors')).toBe('false');
  });

  it('sets data-theme on the toast container (default system, overridable)', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    let container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.getAttribute('data-theme')).toBe('system');

    fixture.componentRef.setInput('theme', 'dark');
    fixture.detectChanges();
    await fixture.whenStable();
    container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.getAttribute('data-theme')).toBe('dark');
  });

  it('uses default English aria-labels on the live region and dismiss control', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    const toaster = TestBed.inject(ToasterService);
    toaster.show('Hi', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(section.getAttribute('aria-label')).toBe(DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION);

    const close = fixture.nativeElement.querySelector('.close-btn') as HTMLButtonElement | null;
    expect(close?.getAttribute('aria-label')).toBe(DEFAULT_TOASTER_ARIA_DISMISS_BUTTON);
  });

  it('applies [accessibilityLabels] overrides for live region and dismiss aria-label', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('accessibilityLabels', {
      notificationsRegion: 'Notifiche',
      dismissButton: 'Chiudi',
    });
    const toaster = TestBed.inject(ToasterService);
    toaster.show('Ciao', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(section.getAttribute('aria-label')).toBe('Notifiche');

    const close = fixture.nativeElement.querySelector('.close-btn') as HTMLButtonElement | null;
    expect(close?.getAttribute('aria-label')).toBe('Chiudi');
  });

  it('merges partial [accessibilityLabels] with defaults for omitted keys', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('accessibilityLabels', { dismissButton: 'Chiudi avviso' });
    const toaster = TestBed.inject(ToasterService);
    toaster.show('X', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(section.getAttribute('aria-label')).toBe(DEFAULT_TOASTER_ARIA_NOTIFICATIONS_REGION);

    const close = fixture.nativeElement.querySelector('.close-btn') as HTMLButtonElement | null;
    expect(close?.getAttribute('aria-label')).toBe('Chiudi avviso');
  });

  it('applies string offset to all --toast-offset-* vars on the container', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('offset', '40px');
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.style.getPropertyValue('--toast-offset-top').trim()).toBe('40px');
    expect(container.style.getPropertyValue('--toast-offset-right').trim()).toBe('40px');
    expect(container.style.getPropertyValue('--toast-offset-bottom').trim()).toBe('40px');
    expect(container.style.getPropertyValue('--toast-offset-left').trim()).toBe('40px');
  });

  it('applies object offset only to specified sides', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('offset', { top: '8px', left: '12px' });
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.style.getPropertyValue('--toast-offset-top').trim()).toBe('8px');
    expect(container.style.getPropertyValue('--toast-offset-left').trim()).toBe('12px');
    expect(container.style.getPropertyValue('--toast-offset-right').trim()).toBe('');
    expect(container.style.getPropertyValue('--toast-offset-bottom').trim()).toBe('');
  });

  it('applies string mobileOffset to all --toast-offset-mobile-* vars on the container', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('mobileOffset', '12px');
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.style.getPropertyValue('--toast-offset-mobile-top').trim()).toBe('12px');
    expect(container.style.getPropertyValue('--toast-offset-mobile-right').trim()).toBe('12px');
    expect(container.style.getPropertyValue('--toast-offset-mobile-bottom').trim()).toBe('12px');
    expect(container.style.getPropertyValue('--toast-offset-mobile-left').trim()).toBe('12px');
  });

  it('applies object mobileOffset only to specified sides', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('mobileOffset', { top: '4px', right: '8px' });
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.style.getPropertyValue('--toast-offset-mobile-top').trim()).toBe('4px');
    expect(container.style.getPropertyValue('--toast-offset-mobile-right').trim()).toBe('8px');
    expect(container.style.getPropertyValue('--toast-offset-mobile-left').trim()).toBe('');
    expect(container.style.getPropertyValue('--toast-offset-mobile-bottom').trim()).toBe('');
  });

  it('enables semantic colors when richColors is true', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('richColors', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.getAttribute('data-rich-colors')).toBe('true');
  });

  it('auto-dismisses using duration from Toaster when duration is omitted', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [Toaster] });
      const fixture = TestBed.createComponent(Toaster);
      fixture.componentRef.setInput('duration', 1000);
      fixture.detectChanges();
      await fixture.whenStable();

      const toaster = TestBed.inject(ToasterService);
      toaster.show('Hello');
      expect(toaster.toasts().length).toBe(1);
      await vi.advanceTimersByTimeAsync(1000);
      expect(toaster.toasts().length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('pauses auto-dismiss while the pointer hovers the toast', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [Toaster] });
      const fixture = TestBed.createComponent(Toaster);
      fixture.componentRef.setInput('duration', 10_000);
      fixture.detectChanges();
      await fixture.whenStable();

      const svc = TestBed.inject(ToasterService);
      svc.show('Hover me');
      fixture.detectChanges();
      await fixture.whenStable();

      const toastHost = fixture.nativeElement.querySelector('li.toast') as HTMLElement;
      expect(toastHost).toBeTruthy();

      await vi.advanceTimersByTimeAsync(7000);
      expect(svc.toasts().length).toBe(1);

      toastHost.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(20_000);
      expect(svc.toasts().length).toBe(1);

      toastHost.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(2999);
      expect(svc.toasts().length).toBe(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(svc.toasts().length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('treats duration literal string Infinity as manual dismiss', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [Toaster] });
      const fixture = TestBed.createComponent(Toaster);
      fixture.componentRef.setInput('duration', 'Infinity');
      fixture.detectChanges();
      await fixture.whenStable();

      const toaster = TestBed.inject(ToasterService);
      toaster.show('Stay');
      expect(toaster.toasts().length).toBe(1);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(toaster.toasts().length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not apply Toaster duration to loading()', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [Toaster] });
      const fixture = TestBed.createComponent(Toaster);
      fixture.componentRef.setInput('duration', 500);
      fixture.detectChanges();
      await fixture.whenStable();

      const toaster = TestBed.inject(ToasterService);
      toaster.loading('Wait');
      await vi.advanceTimersByTimeAsync(2000);
      expect(toaster.toasts().length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('sets variant on items from typed helpers', () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const toaster = TestBed.inject(ToasterService);

    toaster.success('ok');
    expect(toaster.toasts()[0].variant).toBe('success');

    toaster.error('bad');
    expect(toaster.toasts()[1].variant).toBe('error');

    toaster.loading('wait');
    expect(toaster.toasts()[2].variant).toBe('loading');
  });

  it('renders a custom success icon component when icons.success is set', async () => {
    TestBed.configureTestingModule({ imports: [Toaster, SpecSuccessIcon] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('icons', { success: SpecSuccessIcon });
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.success('Custom icon', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.bt-spec-custom-success-icon')).toBeTruthy();
  });

  it('renders a per-toast icon from options.icon without global [icons]', async () => {
    TestBed.configureTestingModule({ imports: [Toaster, SpecSuccessIcon] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.success('Per-toast icon', { durationMs: TOAST_DURATION_MANUAL_DISMISS, icon: SpecSuccessIcon });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.bt-spec-custom-success-icon')).toBeTruthy();
  });

  it('does not render an icon column for default toasts without [icons].default or per-toast icon', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.show('Neutral', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.toast-icon')).toBeNull();
  });

  it('renders a custom default icon when [icons].default is set', async () => {
    TestBed.configureTestingModule({ imports: [Toaster, SpecDefaultIcon] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('icons', { default: SpecDefaultIcon });
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.show('With default icon', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.bt-spec-custom-default-icon')).toBeTruthy();
  });

  it('renders a per-toast icon on show() when options.icon is set', async () => {
    TestBed.configureTestingModule({ imports: [Toaster, SpecDefaultIcon] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.show('Per-toast default', { durationMs: TOAST_DURATION_MANUAL_DISMISS, icon: SpecDefaultIcon });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.bt-spec-custom-default-icon')).toBeTruthy();
  });

  it('hides the default icon when [icons].default is null', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('icons', { default: null });
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.show('No default icon', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.toast-icon')).toBeNull();
  });

  it('per-toast icon: null overrides [icons].default', async () => {
    TestBed.configureTestingModule({ imports: [Toaster, SpecDefaultIcon] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('icons', { default: SpecDefaultIcon });
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.show('Hidden', { durationMs: TOAST_DURATION_MANUAL_DISMISS, icon: null });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.toast-icon')).toBeNull();
  });

  it('hides the close button when closeButton is false', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('closeButton', false);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.show('No close', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.close-btn')).toBeNull();
  });

  it('shows the close button by default', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.show('With close', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.close-btn')).toBeTruthy();
  });

  it('hides the icon when options.icon is null', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.success('No icon', { durationMs: TOAST_DURATION_MANUAL_DISMISS, icon: null });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.toast-icon')).toBeNull();
  });

  it('hides the icon when [icons] sets that variant to null', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('icons', { success: null });
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.success('No global icon', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.toast-icon')).toBeNull();
  });

  it('custom() stores html and omits the default icon/message branch', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.custom('<p class="x">Rich</p>', { durationMs: TOAST_DURATION_MANUAL_DISMISS });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toaster.toasts()[0].html).toBe('<p class="x">Rich</p>');
    expect(toaster.toasts()[0].message).toBe('');
    expect(toaster.toasts()[0].variant).toBe('default');

    const host = fixture.nativeElement.querySelector('li.toast') as HTMLElement;
    expect(host.querySelector('.toast-custom')?.innerHTML).toContain('Rich');
    expect(host.querySelector('.toast-text-stack')).toBeNull();
    expect(host.querySelector('.toast-icon')).toBeNull();
    expect(host.querySelector('.msg')).toBeNull();
  });

  it('calls onAutoClose when the toast auto-dismisses', async () => {
    vi.useFakeTimers();
    try {
      TestBed.configureTestingModule({ imports: [Toaster] });
      const toaster = TestBed.inject(ToasterService);
      const onAutoClose = vi.fn();
      const onDismiss = vi.fn();
      toaster.show('Bye', { durationMs: 1000, onAutoClose, onDismiss });
      await vi.advanceTimersByTimeAsync(1000);
      expect(toaster.toasts().length).toBe(0);
      expect(onAutoClose).toHaveBeenCalledTimes(1);
      expect(onDismiss).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('calls onDismiss when the toast is dismissed manually', () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const toaster = TestBed.inject(ToasterService);
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    const id = toaster.show('Hi', {
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
      onAutoClose,
      onDismiss,
    });
    toaster.dismiss(id);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onAutoClose).not.toHaveBeenCalled();
  });

  it('calls onDismiss for each toast when clear() runs', () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const toaster = TestBed.inject(ToasterService);
    const a = vi.fn();
    const b = vi.fn();
    toaster.show('1', { durationMs: TOAST_DURATION_MANUAL_DISMISS, onDismiss: a });
    toaster.show('2', { durationMs: TOAST_DURATION_MANUAL_DISMISS, onDismiss: b });
    toaster.clear();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('action() renders no icon, an action row button, and invokes onClick', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    const onClick = vi.fn();
    toaster.action('Saved', {
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
      action: { label: 'Undo', onClick },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toaster.toasts()[0].icon).toBeNull();
    expect(toaster.toasts()[0].toastAction?.role).toBe('action');
    expect(toaster.toasts()[0].toastAction?.label).toBe('Undo');

    expect(fixture.nativeElement.querySelector('.toast-icon')).toBeNull();
    const btn = fixture.nativeElement.querySelector('.toast-row-btn') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.textContent?.trim()).toBe('Undo');
    expect(btn.getAttribute('data-row-btn')).toBe('action');

    btn.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0]).toBeInstanceOf(Event);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(toaster.toasts().length).toBe(0);
  });

  it('action() row button does not dismiss when onClick calls preventDefault', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    const onClick = vi.fn((e: Event) => e.preventDefault());
    toaster.action('Saved', {
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
      action: { label: 'Undo', onClick },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('.toast-row-btn') as HTMLButtonElement;
    btn.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(toaster.toasts().length).toBe(1);
  });

  it('action() uses default label when action.label is omitted', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.action('Prompt', {
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
      action: { onClick: () => {} },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('.toast-row-btn') as HTMLButtonElement;
    expect(btn.textContent?.trim()).toBe('Action');
  });

  it('cancel() renders a cancel row button with default label', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    const onClick = vi.fn();
    toaster.cancel('Nothing to see', {
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
      cancel: { label: 'Dismiss', onClick },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toaster.toasts()[0].icon).toBeNull();
    expect(toaster.toasts()[0].toastAction?.role).toBe('cancel');

    const btn = fixture.nativeElement.querySelector('.toast-row-btn') as HTMLButtonElement;
    expect(btn.textContent?.trim()).toBe('Dismiss');
    expect(btn.getAttribute('data-row-btn')).toBe('cancel');
  });

  it('cancel() uses default label when cancel.label is omitted', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.cancel('Stopped', {
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
      cancel: { onClick: () => {} },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('.toast-row-btn') as HTMLButtonElement;
    expect(btn.textContent?.trim()).toBe('Cancel');
  });

  it('merges toastOptions.classNames.actionButton; per-toast action classNames replace toaster', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('toastOptions', {
      classNames: { actionButton: 'host-action' },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.action('Hi', {
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
      action: { onClick: () => {} },
      classNames: { actionButton: 'toast-action' },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('.action-btn') as HTMLButtonElement;
    expect(btn.classList.contains('toast-action')).toBe(true);
    expect(btn.classList.contains('host-action')).toBe(false);
  });

  it('merges classNames.actionButton from action(); toaster base classNames still merge for shared keys', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('toastOptions', {
      classNames: { message: 'host-msg' },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.action('Hi', {
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
      action: { onClick: () => {} },
      classNames: { actionButton: 'toast-action', message: 'toast-msg' },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('.action-btn') as HTMLButtonElement;
    expect(btn.classList.contains('toast-action')).toBe(true);

    const msg = fixture.nativeElement.querySelector('.msg') as HTMLElement;
    expect(msg.classList.contains('toast-msg')).toBe(true);
    expect(msg.classList.contains('host-msg')).toBe(false);
  });

  it('merges toastOptions.classNames.cancelButton; per-toast cancel classNames replace toaster', async () => {
    TestBed.configureTestingModule({ imports: [Toaster] });
    const fixture = TestBed.createComponent(Toaster);
    fixture.componentRef.setInput('toastOptions', {
      classNames: { cancelButton: 'host-cancel' },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const toaster = TestBed.inject(ToasterService);
    toaster.cancel('Bye', {
      durationMs: TOAST_DURATION_MANUAL_DISMISS,
      cancel: { onClick: () => {} },
      classNames: { cancelButton: 'toast-cancel' },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('.cancel-btn') as HTMLButtonElement;
    expect(btn.classList.contains('toast-cancel')).toBe(true);
    expect(btn.classList.contains('host-cancel')).toBe(false);
  });
});
