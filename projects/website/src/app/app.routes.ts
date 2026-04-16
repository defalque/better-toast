import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { DocsShell } from './pages/docs/docs-shell/docs-shell';
import { DocGettingStarted } from './pages/docs/doc-getting-started/doc-getting-started';
import { DocInstallation } from './pages/docs/doc-installation/doc-installation';
import { DocUsage } from './pages/docs/doc-usage/doc-usage';
import { DocApi } from './pages/docs/doc-api/doc-api';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'docs',
    component: DocsShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'getting-started' },
      { path: 'getting-started', component: DocGettingStarted },
      { path: 'installation', component: DocInstallation },
      { path: 'usage', component: DocUsage },
      { path: 'api', component: DocApi },
    ],
  },
  { path: '**', redirectTo: '' },
];
