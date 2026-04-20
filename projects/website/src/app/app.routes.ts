import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { DocsShell } from './pages/docs/docs-shell/docs-shell';
import { DocGettingStarted } from './pages/docs/doc-getting-started/doc-getting-started';
import { DocBetterToaster } from './pages/docs/doc-better-toaster/doc-better-toaster';
import { DocToastTypes } from './pages/docs/doc-toast-types/doc-toast-types';
import { DocOther } from './pages/docs/doc-other/doc-other';
import { DocStyling } from './pages/docs/doc-styling/doc-styling';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'docs',
    component: DocsShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'getting-started' },
      { path: 'getting-started', component: DocGettingStarted },
      { path: 'better-toaster', component: DocBetterToaster },
      { path: 'toast-types', component: DocToastTypes },
      { path: 'other', component: DocOther },
      { path: 'styling', component: DocStyling },
    ],
  },
  { path: '**', redirectTo: '' },
];
