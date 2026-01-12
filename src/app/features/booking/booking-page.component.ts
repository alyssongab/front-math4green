/**
 * ============================================================
 * BOOKING PAGE COMPONENT - Página Principal de Agendamentos
 * ============================================================
 * 
 * NOVA UI:
 * - Calendário mensal para escolher o dia
 * - Painel lateral com:
 *   - Dropdown para selecionar recurso
 *   - Dropdowns para hora (1h em 1h) e minutos (15 em 15)
 *   - Lista de horários ocupados no dia
 */

import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { BookingDto, ResourceDto, CreateBookingDto } from '../../core/models/booking.model';
import { DateUtils } from '../../core/utils/date.utils';
import { BookingModalComponent } from './components/booking-modal/booking-modal.component';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingModalComponent],
  templateUrl: './booking-page.component.html'
})
export class BookingPageComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  constructor(){
    effect(() => {
        const resourceId = this.selectedResourceId();
        const date = this.selectedDate();
        if (resourceId && date) {
        this.loadResourceBookings(resourceId, date);
        }
    });
  }

  resources = signal<ResourceDto[]>([]);
  resourceBookings = signal<BookingDto[]>([]);
  userBookings = signal<BookingDto[]>([]);
  
  isLoading = signal(false);
  isLoadingResource = signal(false);
  errorMessage = signal('');
  successMessage = signal('');


  showModal = signal(false);
  selectedSlot = signal<{ start: string; end: string } | null>(null);

  currentMonth = signal(new Date());
  selectedDate = signal<Date>(new Date());

  selectedResourceId = signal<number | null>(null);
  selectedStartHour = signal<number>(8);
  selectedStartMinute = signal<number>(0);
  selectedEndHour = signal<number>(9);
  selectedEndMinute = signal<number>(0);

  readonly hoursOptions = Array.from({ length: 17 }, (_, i) => i + 6);
  readonly minutesOptions = [0, 15, 30, 45];
  readonly weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

//   private resourceEffect = effect(() => {
//     const resourceId = this.selectedResourceId();
//     const date = this.selectedDate();
//     if (resourceId && date) {
//       this.loadResourceBookings(resourceId, date);
//     }
//   });

  selectedResource = computed(() => {
    const id = this.selectedResourceId();
    if (!id) return null;
    return this.resources().find(r => r.id === id) ?? null;
  });

  calendarDays = computed((): (Date | null)[][] => {
    const month = this.currentMonth();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    const days: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      currentWeek.push(new Date(year, monthIndex, day));
      
      if (currentWeek.length === 7) {
        days.push(currentWeek);
        currentWeek = [];
      }
    }

    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      days.push(currentWeek);
    }

    return days;
  });

  currentMonthName = computed(() => {
    const month = this.currentMonth();
    return month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });


  bookingsForSelectedDay = computed(() => {
    return this.resourceBookings()
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  /**
   * OTIMIZAÇÃO: Agora usa userBookings que já contém só os agendamentos do usuário
   */
  userMinutesToday = computed(() => {
    const date = this.selectedDate();
    const bookings = this.userBookings();

    const selectedDateStr = DateUtils.formatDateString(date);

    return bookings
      .filter(b => {
        const bookingDateStr = DateUtils.extractDate(b.startTime);
        return bookingDateStr === selectedDateStr;
      })
      .reduce((total, b) => total + b.durationMinutes, 0);
  });

  userRemainingMinutes = computed(() => {
    const user = this.currentUser();
    const maxMinutes = user?.maxMinutesPerDay ?? 240;
    return Math.max(0, maxMinutes - this.userMinutesToday());
  });


  myBookings = computed(() => {
    return this.userBookings()
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  private timeToMinutes(hour: number, minute: number): number {
    return hour * 60 + minute;
  }

  isValidTimeRange = computed(() => {
    const startMinutes = this.timeToMinutes(this.selectedStartHour(), this.selectedStartMinute());
    const endMinutes = this.timeToMinutes(this.selectedEndHour(), this.selectedEndMinute());
    return endMinutes > startMinutes;
  });

  bookingDuration = computed(() => {
    const startMinutes = this.timeToMinutes(this.selectedStartHour(), this.selectedStartMinute());
    const endMinutes = this.timeToMinutes(this.selectedEndHour(), this.selectedEndMinute());
    return Math.max(0, endMinutes - startMinutes);
  });

  hasConflict = computed(() => {
    const bookings = this.bookingsForSelectedDay();
    const resourceId = this.selectedResourceId();
    
    if (!resourceId) return false;

    const startTime = this.formatTime(this.selectedStartHour(), this.selectedStartMinute());
    const endTime = this.formatTime(this.selectedEndHour(), this.selectedEndMinute());

    return bookings.some(b => {
      if (b.resourceId !== resourceId) return false;
      const bStart = DateUtils.extractTime(b.startTime);
      const bEnd = DateUtils.extractTime(b.endTime);
      return startTime < bEnd && endTime > bStart;
    });
  });

  ngOnInit(): void {
    this.loadResources();
    this.loadUserBookings();
  }

  loadResources(): void {
    this.bookingService.getAllResources().subscribe({
      next: (resources) => {
        this.resources.set(resources);
        if (resources.length > 0) {
          this.selectedResourceId.set(resources[0].id);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar recursos:', err);
        this.errorMessage.set('Erro ao carregar recursos. Verifique se o backend está rodando.');
      }
    });
  }

  loadResourceBookings(resourceId: number, date: Date): void {
    this.isLoadingResource.set(true);
    const dateStr = DateUtils.formatDateString(date);
    
    this.bookingService.getBookingsByResource(resourceId, dateStr).subscribe({
      next: (bookings) => {
        this.resourceBookings.set(bookings);
        this.isLoadingResource.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos do recurso:', err);
        this.isLoadingResource.set(false);
      }
    });
  }

  loadUserBookings(): void {
    const user = this.currentUser();
    if (!user) return;

    this.isLoading.set(true);
    this.bookingService.getBookingsByUser(user.id).subscribe({
      next: (bookings) => {
        this.userBookings.set(bookings);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar meus agendamentos:', err);
        this.isLoading.set(false);
      }
    });
  }

  previousMonth(): void {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.selectedDate.set(today);
  }

  selectDate(date: Date | null): void {
    if (!date) return;
    this.selectedDate.set(date);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  isSelectedDate(date: Date | null): boolean {
    if (!date) return false;
    return DateUtils.isSameDay(date, this.selectedDate());
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    return DateUtils.isSameDay(date, new Date());
  }

  isPastDate(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  }

  hasBookingsOnDate(date: Date | null): boolean {
    if (!date) return false;
    const dateStr = DateUtils.formatDateString(date);

    return this.resourceBookings().some(b => {
      const bookingDateStr = DateUtils.extractDate(b.startTime);
      return bookingDateStr === dateStr;
    });
  }

  openBookingModal(): void {
    const user = this.currentUser();
    const resourceId = this.selectedResourceId();

    if(!user) return;

    if (!resourceId) {
      this.errorMessage.set('Selecione um recurso.');
      return;
    }

    if (!this.isValidTimeRange()) {
      this.errorMessage.set('O horário de fim deve ser maior que o de início.');
      return;
    }

    if (this.hasConflict()) {
      this.errorMessage.set('Este horário já está ocupado. Escolha outro.');
      return;
    }

    const duration = this.bookingDuration();
    if (duration > this.userRemainingMinutes()) {
      this.errorMessage.set('Você só pode agendar mais ' + this.userRemainingMinutes() + ' minutos hoje.');
      return;
    }

    if (this.isPastDate(this.selectedDate())) {
      this.errorMessage.set('Não é possível agendar em datas passadas.');
      return;
    }

    this.selectedSlot.set({
      start: this.formatTime(this.selectedStartHour(), this.selectedStartMinute()),
      end: this.formatTime(this.selectedEndHour(), this.selectedEndMinute())
    });
    
    this.showModal.set(true);
  }

  onConfirmBooking(dto: CreateBookingDto): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.showModal.set(false);

    this.bookingService.createBooking(dto).subscribe({
      next: (newBooking) => {
        this.resourceBookings.update(bookings => [...bookings, newBooking]);
        this.userBookings.update(bookings => [...bookings, newBooking]);
        this.successMessage.set('Agendamento criado com sucesso!');
        this.isLoading.set(false);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        console.error('Erro ao criar agendamento:', err);
        const message = err.error?.message || err.error || 'Erro ao criar agendamento.';
        this.errorMessage.set(message);
        this.isLoading.set(false);
      }
    });
  }

  cancelBooking(booking: BookingDto): void {
    if (!confirm('Deseja cancelar o agendamento das ' + DateUtils.extractTime(booking.startTime) + '?')) {
      return;
    }

    this.bookingService.deleteBooking(booking.id).subscribe({
      next: () => {

        this.resourceBookings.update(bookings => bookings.filter(b => b.id !== booking.id));
        this.userBookings.update(bookings => bookings.filter(b => b.id !== booking.id));
        this.successMessage.set('Agendamento cancelado.');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        console.error('Erro ao cancelar agendamento:', err);
        this.errorMessage.set('Erro ao cancelar agendamento.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatTime(hour: number, minute: number): string {
    return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
  }

  formatBookingDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  extractTime(isoString: string): string {
    return DateUtils.extractTime(isoString);
  }
}
