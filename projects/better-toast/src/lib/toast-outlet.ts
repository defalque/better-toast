import {
  Directive,
  type ComponentRef,
  type Type,
  ViewContainerRef,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';

/**
 * Tiny dynamic-component host used for headless toasts, custom bodies, and icon overrides.
 * Uses signal inputs and recreates the guest only when the component type changes.
 */
@Directive({
  selector: '[betterToastOutlet]',
})
export class BetterToastOutlet {
  private readonly viewContainer = inject(ViewContainerRef);

  readonly betterToastOutlet = input.required<Type<unknown>>();
  readonly betterToastOutletInputs = input<Record<string, unknown>>();

  private ref?: ComponentRef<unknown>;
  private currentType: Type<unknown> | undefined;

  constructor() {
    effect(() => {
      const component = this.betterToastOutlet();
      const inputs = this.betterToastOutletInputs();
      untracked(() => this.sync(component, inputs));
    });
  }

  private sync(component: Type<unknown>, inputs: Record<string, unknown> | undefined): void {
    if (this.currentType !== component) {
      this.viewContainer.clear();
      this.ref = undefined;
      this.currentType = component;
      if (component) {
        this.ref = this.viewContainer.createComponent(component);
      }
    }
    if (!this.ref || !inputs) {
      return;
    }
    for (const name of Object.keys(inputs)) {
      this.ref.setInput(name, inputs[name]);
    }
  }
}
