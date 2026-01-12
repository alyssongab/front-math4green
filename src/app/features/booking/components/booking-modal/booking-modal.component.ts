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
  templateUrl: './booking-modal.component.html'
})
export class BookingModalComponent {

  // inputs
  @Input() isOpen = false;
  
  @Input() date: Date | null = null;

  @Input() slot: { start: string; end: string } | null = null;

  @Input() userId: number = 0;

  @Input() resourceId: number = 0;

  // outputs
  

  @Output() close = new EventEmitter<void>();

  @Output() confirm = new EventEmitter<CreateBookingDto>();


  isSubmitting = signal(false);

  readonly MONTHS = MONTHS;

  onSubmit(event: Event): void {

    event.preventDefault();
    
    if (!this.date || !this.slot || !this.userId || !this.resourceId) {
      console.error('Dados incompletos para criar booking');
      return;
    }

    this.isSubmitting.set(true);

    const dto: CreateBookingDto = {
      userId: this.userId,
      resourceId: this.resourceId,
      startTime: DateUtils.combineDateAndTime(this.date, this.slot.start),
      endTime: DateUtils.combineDateAndTime(this.date, this.slot.end)
    };

    this.confirm.emit(dto);
    this.isSubmitting.set(false);
  }

  onClose(): void {
    this.close.emit();
  }

  // formatacao amigavel
  formatDate(): string {
    if (!this.date) return '';
    const day = this.date.getDate();
    const month = MONTHS[this.date.getMonth()];
    const year = this.date.getFullYear();
    return `${day} de ${month} de ${year}`;
  }
}

