# Changelog

## 0.2.1 - 2026-08-27

### Changed

- Smaller production bundle: replaced `NgComponentOutlet` with a lightweight outlet so mounting `<better-toaster>` no longer pulls `@angular/common`.
- Peer dependency is now `@angular/core` only (`^21.0.0 || ^22.0.0`).

### Fixed

- Headless toasts no longer store `description` in chrome metadata.

## 0.2.0 - 2026-08-27

### Changed

- Collapsed card stack is now the default. Extra toasts collapse into a 3-layer stack (latest in front). Hover, focus, or a press on touch expands the full list. Upgrading from 0.1.0 changes the layout without a template change. Set `[stacked]="false"` to keep every toast fully visible.

### Added

- `[stacked]` input on `<better-toaster>` (`true` by default).

## 0.1.0 - 2026-08-22

### Added

- Angular 22 support. Peer dependencies are now `@angular/core` / `@angular/common` `^21.0.0 || ^22.0.0`.

### Support

- Current Angular major plus the previous major. When Angular 23 is current, Angular 21 will be dropped.

This release was developed and tested on Angular 22. Angular 21 remains declared; a dedicated Angular 21 CI job is a follow-up.

## 0.0.4 - 2026-04-29

### Added

- Initial stable release of Better Toast.
