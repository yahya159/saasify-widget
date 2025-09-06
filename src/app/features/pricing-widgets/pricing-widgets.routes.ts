import { Routes } from '@angular/router';

export const pricingWidgetsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./builder/widget-builder.component').then(m => m.WidgetBuilderComponent)
  }
];
