import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);


  mode = signal<'login' | 'register'>('login');
  

  email = signal('');
  name = signal('');
  

  isLoading = signal(false);
  errorMessage = signal('');


  toggleMode(): void {
    this.mode.update(current => current === 'login' ? 'register' : 'login');
    this.errorMessage.set(''); 
  }


  onSubmit(): void {
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
      this.userService.login({ email: this.email() }).subscribe({
        next: (user) => {
          this.authService.setUser(user);
          this.router.navigate(['/booking']);
        },
        error: (err) => {
          console.error('Erro no login:', err);
          this.errorMessage.set('Usuário não encontrado. Tente registrar-se.');
          this.isLoading.set(false);
        }
      });
    } else {
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
