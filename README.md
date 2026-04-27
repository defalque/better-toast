# better-toast workspace

Angular workspace for **better-toast**, a standalone toast notification library with stacked messages, variants, swipe-to-dismiss, accessible live regions, and a small service API.

## Projects

- `projects/better-toast` - publishable Angular library package.
- `projects/demo` - local playground for trying toast behavior while developing.
- `projects/website` - documentation website with SSR support.

For consumer installation and API examples, see `projects/better-toast/README.md`.

## Requirements

- Node.js compatible with Angular 21.
- npm `11.12.1` or newer.
- Angular `^21.0.0` for consumers of the `better-toast` package.

Install workspace dependencies:

```bash
npm install
```

## Development

Run the default Angular dev server:

```bash
npm start
```

Serve a specific app when needed:

```bash
npm run ng -- serve demo
npm run ng -- serve website
```

Build everything with the default Angular target:

```bash
npm run build
```

Build only the library:

```bash
npm run ng -- build better-toast
```

Build and watch during local development:

```bash
npm run watch
```

## Testing

Run the workspace test target:

```bash
npm test
```

Run the library tests once:

```bash
npm run test:better-toast
```

## Package

The package entry point exports `BetterToaster`, `ToasterService`, public toast types, defaults, and constants from `better-toast`.

After building the library, the package output is written under `dist/better-toast`.

## Documentation

The website project contains the full docs and examples under `projects/website/src/app/pages/docs`. The website will be deployed soon. The library README contains the npm-facing quickstart and API overview.
