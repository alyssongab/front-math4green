/**
 * ============================================================
 * BOOKING MODAL COMPONENT - Modal de Confirmação de Agendamento
 * ============================================================
 * 
 * CONCEITO - Dumb/Presentational Component:
 * Este componente é "burro" no sentido de que ele:
 * - NÃO faz chamadas HTTP diretamente
 * - NÃO gerencia estado global
 * - Apenas RECEBE dados (via @Input) e EMITE eventos (via @Output)
 * 
 * Isso torna o componente mais reutilizável e fácil de testar.
 * O componente pai (BookingPageComponent) é quem faz a lógica pesada.
 * 
 * CONCEITO - @Input e @Output:
 * @Input() -> Recebe dados do componente pai
 * @Output() -> Emite eventos para o componente pai
 * 
 * É como uma função:
 * - Input = parâmetros da função
 * - Output = valor de retorno (via eventos)
 */

import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateBookingDto } from '../../../../core/models/booking.model';
import { DateUtils } from '../../../../core/utils/date.utils';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  /**
   * Template inline pequeno poderia usar template: `...`
   * Mas vamos usar arquivo separado para organização.
   */
  templateUrl: './booking-modal.component.html'
})
export class BookingModalComponent {
  /**
   * ========== INPUTS ==========
   * Dados que vêm do componente pai.
   * Quando o pai muda esses valores, o Angular atualiza automaticamente.
   */
  
  /** Controla se o modal está visível */
  @Input() isOpen = false;
  
  /** Data selecionada para o agendamento */
  @Input() date: Date | null = null;
  
  /** Slot de horário selecionado (início e fim) */
  @Input() slot: { start: string; end: string } | null = null;
  
  /** ID do usuário logado (vem do AuthService via pai) */
  @Input() userId: number = 0;
  
  /** ID do recurso selecionado */
  @Input() resourceId: number = 0;

  /**
   * ========== OUTPUTS ==========
   * Eventos que o componente emite para o pai.
   * 
   * EventEmitter<T> é como um "canal" de comunicação.
   * Quando chamamos .emit(valor), o pai recebe o evento.
   */
  
  /** Emitido quando usuário fecha o modal */
  @Output() close = new EventEmitter<void>();
  
  /** Emitido quando usuário confirma o agendamento */
  @Output() confirm = new EventEmitter<CreateBookingDto>();

  /**
   * ========== ESTADO INTERNO ==========
   * Usado apenas dentro deste componente.
   */
  isSubmitting = signal(false);

  /** Constante para usar no template */
  readonly MONTHS = MONTHS;

  /**
   * Processa o submit do formulário.
   * Cria o DTO e emite para o pai processar.
   */
  onSubmit(event: Event): void {
    // Previne comportamento padrão do form (reload da página)
    event.preventDefault();
    
    // Validação: todos os dados necessários presentes?
    if (!this.date || !this.slot || !this.userId || !this.resourceId) {
      console.error('Dados incompletos para criar booking');
      return;
    }

    this.isSubmitting.set(true);

    /**
     * Monta o DTO (Data Transfer Object) para enviar ao backend.
     * Usa DateUtils para converter data + hora para formato ISO.
     */
    const dto: CreateBookingDto = {
      userId: this.userId,
      resourceId: this.resourceId,
      startTime: DateUtils.combineDateAndTime(this.date, this.slot.start),
      endTime: DateUtils.combineDateAndTime(this.date, this.slot.end)
    };

    /**
     * Emite o evento com o DTO.
     * O componente pai (BookingPageComponent) vai:
     * 1. Receber esse evento
     * 2. Fazer a chamada HTTP
     * 3. Tratar sucesso/erro
     * 
     * Assim o modal não precisa conhecer o BookingService!
     */
    this.confirm.emit(dto);
    this.isSubmitting.set(false);
  }

  /**
   * Fecha o modal.
   * Emite evento void (sem dados) para o pai.
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Formata a data para exibição amigável.
   * Ex: "15 de Janeiro de 2026"
   */
  formatDate(): string {
    if (!this.date) return '';
    const day = this.date.getDate();
    const month = MONTHS[this.date.getMonth()];
    const year = this.date.getFullYear();
    return `${day} de ${month} de ${year}`;
  }
}

