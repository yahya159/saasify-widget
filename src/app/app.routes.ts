import { Routes } from '@angular/router';
import { SignupComponent } from './@shared/signup/components/signup.component';

export const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { 
    path: 'plans', 
    loadChildren: () => import('./features/plans/plans.routes').then(m => m.plansRoutes)
  },
  { 
    path: 'pricing-widgets', 
    loadChildren: () => import('./features/pricing-widgets/pricing-widgets.routes').then(m => m.pricingWidgetsRoutes)
  },
  { path: '', redirectTo: '/signup', pathMatch: 'full' },
  { path: '**', redirectTo: '/signup' }
];
