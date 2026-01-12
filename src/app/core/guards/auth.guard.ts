/**
 * ============================================================
 * AUTH GUARD - Guarda de Rota para Autenticação
 * ============================================================
 * 
 * CONCEITO - Route Guards:
 * Guards são "guardiões" que protegem rotas. Eles decidem:
 * "Este usuário pode acessar esta rota?"
 * 
 * Tipos de Guards:
 * - canActivate: Pode ativar a rota?
 * - canDeactivate: Pode sair da rota?
 * - canMatch: A rota corresponde? (lazy loading)
 * - resolve: Carrega dados antes de ativar
 * 
 * CONCEITO - Functional Guards (Angular 14+):
 * Antigamente, guards eram classes. Agora podem ser funções simples!
 * Mais leve e direto ao ponto.
 * 
 * CONCEITO - inject() em Functional Guards:
 * Em funções, usamos inject() para obter serviços.
 * Só funciona durante a criação (não pode chamar depois assíncronamente).
 */

import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que verifica se o usuário está LOGADO.
 * Usado em rotas que precisam de autenticação (ex: /booking).
 * 
 * Se não estiver logado → redireciona para /login
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Usuário logado, pode acessar
    return true;
  } else {
    // Não logado, redireciona para login
    return router.createUrlTree(['/login']);
  }
};

/**
 * Guard que verifica se o usuário NÃO está logado.
 * Usado em rotas de login/registro.
 * 
 * Se já estiver logado → redireciona para /booking
 * (Não faz sentido ver tela de login se já está logado)
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    // Não está logado, pode ver login
    return true;
  } else {
    // Já está logado, vai para booking
    return router.createUrlTree(['/booking']);
  }
};
