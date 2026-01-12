/**
 * ============================================================
 * APP COMPONENT - Componente Raiz da Aplicação
 * ============================================================
 * 
 * Este é o componente principal, o "topo da árvore".
 * Todos os outros componentes são renderizados dentro dele.
 * 
 * CONCEITO - RouterOutlet:
 * O <router-outlet> é um placeholder especial do Angular.
 * É onde os componentes das rotas são renderizados.
 * 
 * Quando a URL muda:
 * 1. O Router encontra a rota correspondente
 * 2. Carrega o componente definido na rota
 * 3. Renderiza o componente DENTRO do <router-outlet>
 * 
 * Pense no <router-outlet> como uma "janela" que mostra
 * diferentes componentes baseado na URL.
 * 
 * ESTRUTURA DO APP:
 * 
 * <app-root>
 *   └── <router-outlet>
 *         ├── /login → <app-login>
 *         └── /booking → <app-booking-page>
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  /**
   * imports: Declaramos que este componente usa RouterOutlet.
   * Sem isso, o Angular não reconheceria <router-outlet> no template.
   */
  imports: [RouterOutlet],
  /**
   * Template inline simples - apenas o router-outlet.
   * Todo o conteúdo visual vem dos componentes das rotas.
   */
  template: `<router-outlet />`
})
export class App {
  /**
   * O componente raiz pode ficar bem simples!
   * Toda a lógica fica nos componentes de feature.
   */
}

