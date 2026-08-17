import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser;
  if (!user) {
    return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  }

  // Load profile if not yet cached
  let profile = authService.userProfile;
  if (!profile) {
    profile = await authService.loadUserProfile(user.id);
  }

  if (profile && (profile.role === 'admin' || profile.role === 'superadmin')) {
    return true;
  }

  console.warn('Access denied: Admin permissions required.');
  return router.createUrlTree(['/']);
};
