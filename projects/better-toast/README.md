# better-toast

Toast notifications for **Angular** (standalone components): stacked messages, variants, swipe-to-dismiss, accessibility-friendly live region, and a small `ToasterService` API.

**Requirements:** Angular `^21.0.0` (`@angular/core`, `@angular/common`).

## Install

```bash
npm install better-toast
```

## Add the toaster once

Place a single `<better-toaster>` near the root of your app (for example in the root component) so the stack can render.

```typescript
import { Component } from '@angular/core';
import { BetterToaster } from 'better-toast';

@Component({
  selector: 'app-root',
  imports: [BetterToaster],
  template: `<better-toaster position="bottom-right" />`,
})
export class App {}
```

Common inputs (all optional except using defaults):

| Input                     | Description                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `duration`                | Default auto-dismiss in ms for toasts that omit `durationMs` (also supports the literal `duration="Infinity"` for manual dismiss). |
| `position`                | `top-left` \| `top-center` \| `top-right` \| `bottom-left` \| `bottom-center` \| `bottom-right` (default `bottom-right`).          |
| `richColors`              | When `true`, semantic background/border colors for success/error/info/warning.                                                     |
| `theme`                   | `light` \| `dark` \| `system` (default).                                                                                           |
| `closeButton`             | Show per-toast dismiss control (default `true`).                                                                                   |
| `offset` / `mobileOffset` | Viewport inset for the stack (string or per-side object).                                                                          |

Styles ship with the components; you do not need to import a separate CSS file for the default look.

## Show toasts from anywhere

Inject `ToasterService` (`providedIn: 'root'`) and call the helpers. Each method returns a **toast id** you can pass to `dismiss(id)`.

```typescript
import { Component, inject } from '@angular/core';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'app-example',
  template: `<button type="button" (click)="notify()">Save</button>`,
})
export class ExampleComponent {
  private readonly toaster = inject(ToasterService);

  notify(): void {
    this.toaster.success('Saved successfully');
  }
}
```

### Variants and helpers

- **Text:** `show`, `description`, `success`, `error`, `info`, `warning`, `loading`
- **Actions:** `action(message, { action: { label, onClick } })`, `cancel(message, { cancel: { label, onClick } })`
- **Custom UI:** `custom(Component, options)` (message area as a component), `headless(Component, options)` (full custom body, minimal chrome)
- **Async:** `promise(userPromise, { loading, success, error })` — one toast goes from loading → success/error
- **Control:** `dismiss(id)`, `clear()`

Example with options:

```typescript
this.toaster.error('Something went wrong', {
  description: 'Try again in a few minutes.',
  durationMs: 6000,
});

const id = this.toaster.loading('Working…');
// later:
this.toaster.dismiss(id);
```

Constants re-exported for typing and defaults include `DEFAULT_TOAST_DURATION_MS`, `TOAST_DURATION_MANUAL_DISMISS`, `TOAST_VARIANTS`, `TOASTER_POSITIONS`, and default ARIA label helpers.

## API surface

Everything is exported from the package entry point `better-toast`:

- **Component:** `BetterToaster` (selector `better-toaster`)
- **Service:** `ToasterService`
- **Types:** `ToastOptions`, `ToastVariant`, `ToasterPosition`, and the other types listed in the package’s `public-api.ts`

For full behavior (icons, headless mode, class names, accessibility labels), see the source and TSDoc under `projects/better-toast/src`.
