/**
 * ============================================================
 * LOGIN COMPONENT - Componente de Login
 * ============================================================
 * 
 * CONCEITO - Standalone Components (Angular 14+):
 * Antes, todo componente precisava pertencer a um "módulo" (NgModule).
 * Agora com standalone: true, o componente é independente.
 * Ele declara diretamente suas dependências no array "imports".
 * 
 * CONCEITO - inject():
 * É a nova forma de injetar dependências no Angular.
 * Antes: constructor(private userService: UserService) {}
 * Agora: private userService = inject(UserService);
 * 
 * Ambas funcionam, mas inject() pode ser usado fora do constructor,
 * o que é útil com signals e campos de classe.
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  /**
   * imports: Módulos/componentes que este componente usa no template.
   * - CommonModule: *ngIf, *ngFor, pipes básicos
   * - FormsModule: [(ngModel)] para two-way binding
   */
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ========== Estado do Componente (Signals) ==========
  
  /**
   * Modo atual: 'login' ou 'register'
   * Usamos signal para que mudanças sejam reativas no template.
   */
  mode = signal<'login' | 'register'>('login');
  
  // Campos do formulário
  email = signal('');
  name = signal('');
  
  // Estados de UI
  isLoading = signal(false);
  errorMessage = signal('');

  // ========== Métodos ==========

  /**
   * Alterna entre login e registro.
   * update() permite transformar o valor atual.
   */
  toggleMode(): void {
    this.mode.update(current => current === 'login' ? 'register' : 'login');
    this.errorMessage.set(''); // Limpa erro ao trocar
  }

  /**
   * Processa o formulário de login/registro.
   * 
   * CONCEITO - subscribe():
   * Os métodos HTTP retornam Observables. Para "executar" a requisição,
   * precisamos nos inscrever (subscribe). É como ligar um rádio para
   * ouvir a transmissão.
   * 
   * O subscribe recebe um objeto com callbacks:
   * - next: chamado quando chega um valor (sucesso)
   * - error: chamado se der erro
   * - complete: chamado quando finaliza (opcional)
   */
  onSubmit(): void {
    // Validação básica
    if (!this.email().trim()) {
      this.errorMessage.set('Por favor, informe seu email.');
      return;
    }

    if (this.mode() === 'register' && !this.name().trim()) {
      this.errorMessage.set('Por favor, informe seu nome.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    if (this.mode() === 'login') {
      // Faz login
      this.userService.login({ email: this.email() }).subscribe({
        next: (user) => {
          // Sucesso! Salva usuário e navega para booking
          this.authService.setUser(user);
          this.router.navigate(['/booking']);
        },
        error: (err) => {
          // Erro (usuário não existe, servidor offline, etc)
          console.error('Erro no login:', err);
          this.errorMessage.set('Usuário não encontrado. Tente registrar-se.');
          this.isLoading.set(false);
        }
      });
    } else {
      // Faz registro
      this.userService.register({ 
        name: this.name(), 
        email: this.email() 
      }).subscribe({
        next: (user) => {
          this.authService.setUser(user);
          this.router.navigate(['/booking']);
        },
        error: (err) => {
          console.error('Erro no registro:', err);
          this.errorMessage.set('Erro ao registrar. Email já existe?');
          this.isLoading.set(false);
        }
      });
    }
  }
}
