import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CountryDetailPage } from './pages/country-detail/country-detail.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';

export const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
  },
  {
    path: 'country/:id',
    component: CountryDetailPage,
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

