import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingDto, CreateBookingDto, ResourceDto } from '../models/booking.model';


@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = 'http://localhost:5211/api';

  constructor(private http: HttpClient) {}

  getAllBookings(): Observable<BookingDto[]> {
    return this.http.get<BookingDto[]>(`${this.apiUrl}/booking`);
  }

  /**
   * @param resourceId
   * @param date - (opc) filtrar por data específica (yyyy-mm-dd)
   */
  getBookingsByResource(resourceId: number, date?: string): Observable<BookingDto[]> {
    let url = `${this.apiUrl}/booking/resource/${resourceId}`;
    if (date) {
      url += `?date=${date}`;
    }
    return this.http.get<BookingDto[]>(url);
  }


  getBookingsByUser(userId: number): Observable<BookingDto[]> {
    return this.http.get<BookingDto[]>(`${this.apiUrl}/booking/user/${userId}`);
  }

  getBookingById(id: number): Observable<BookingDto> {
    return this.http.get<BookingDto>(`${this.apiUrl}/booking/${id}`);
  }

  createBooking(dto: CreateBookingDto): Observable<BookingDto> {
    return this.http.post<BookingDto>(`${this.apiUrl}/booking`, dto);
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/booking/${id}`);
  }

  getAllResources(): Observable<ResourceDto[]> {
    return this.http.get<ResourceDto[]>(`${this.apiUrl}/resource`);
  }

  getResourceById(id: number): Observable<ResourceDto> {
    return this.http.get<ResourceDto>(`${this.apiUrl}/resource/${id}`);
  }
}