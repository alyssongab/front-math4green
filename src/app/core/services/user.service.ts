// src/app/core/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto, LoginDto, CreateUserDto } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = 'http://localhost:5211/api/user';

  constructor(private http: HttpClient) {}

  login(dto: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/login`, dto);
  }

  register(dto: CreateUserDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/register`, dto);
  }
}