import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => 
      import('./features/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },

  {
    path: 'booking',
    loadComponent: () => 
      import('./features/booking/booking-page.component').then(m => m.BookingPageComponent),
    canActivate: [authGuard]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];

