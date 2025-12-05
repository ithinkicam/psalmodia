import { Route } from '@angular/router';
import { PsalmToneComponent } from './components/psalm-tone/psalm-tone.component';

export const appRoutes: Route[] = [
  {
    path: 'psalms',
    component: PsalmToneComponent,
  },
  {
    path: 'readings',
    loadComponent: () =>
      import('./components/readings/readings.component').then(
        (m) => m.ReadingsComponent
      ),
  },
  {
    path: '',
    redirectTo: '/psalms',
    pathMatch: 'full',
  },
];
