import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs/getting-started',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs/better-toaster',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs/toast',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs/other',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs/styling',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs/considerations',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
