import { Routes } from '@angular/router';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/plans-list.component').then(m => m.PlansListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./editor/plan-editor.component').then(m => m.PlanEditorComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./editor/plan-editor.component').then(m => m.PlanEditorComponent)
  }
];
