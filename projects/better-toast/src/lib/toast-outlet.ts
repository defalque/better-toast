import {
  Directive,
  Input,
  type OnChanges,
  type SimpleChanges,
  type Type,
  ViewContainerRef,
  inject,
} from '@angular/core';

/**
 * Tiny dynamic-component host used for headless toasts, custom bodies, and icon overrides.
 * Intentionally smaller than `NgComponentOutlet` (no ngModule / projector / injector inputs).
 */
@Directive({
  selector: '[betterToastOutlet]',
})
export class BetterToastOutlet implements OnChanges {
  private readonly viewContainer = inject(ViewContainerRef);

  @Input({ required: true }) betterToastOutlet!: Type<unknown>;
  @Input() betterToastOutletInputs?: Record<string, unknown>;

  private ref?: ReturnType<ViewContainerRef['createComponent']>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['betterToastOutlet']) {
      this.viewContainer.clear();
      this.ref = undefined;
      if (this.betterToastOutlet) {
        this.ref = this.viewContainer.createComponent(this.betterToastOutlet);
      }
    }
    if (!this.ref || !this.betterToastOutletInputs) {
      return;
    }
    for (const name of Object.keys(this.betterToastOutletInputs)) {
      this.ref.setInput(name, this.betterToastOutletInputs[name]);
    }
  }
}
