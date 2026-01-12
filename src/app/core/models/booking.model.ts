export interface BookingDto {
  id: number;
  userId: number;
  userName: string | null;
  resourceId: number;
  resourceName: string | null;
  startTime: string;        
  endTime: string;          
  durationMinutes: number;
}

export interface CreateBookingDto {
  userId: number;
  resourceId: number;
  startTime: string;       
  endTime: string;       
}

export interface ResourceDto {
  id: number;
  name: string | null;
  intervalMinutes: number;
}

export interface UserDto {
  id: number;
  name: string | null;
  email: string | null;
  maxMinutesPerDay: number;
}

export interface LoginDto {
  email: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
}

export interface TimeSlot {
  start: string;  
  end: string;    
}