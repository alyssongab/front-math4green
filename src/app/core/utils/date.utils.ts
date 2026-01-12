export class DateUtils {
  /**
   * converter data + hora (hh:mm) pra ISO completa
   * @param date data (2026-01-11)
   * @param time hora padrao (14:30)
   * @returns ISO 8601 (2026-01-11T14:30:00)
   */
  static combineDateAndTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return this.toISOStringWithoutTimezone(combined);
  }

  /**
   * converter data para ISO sem timezone
   * @param date Data/Hora
   * @returns "2026-01-10T14:30:00" (sem o Z no final)
   */
  static toISOStringWithoutTimezone(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * extrair só a hora de um formato ISO
   * @param isoDateTime "2026-01-11T14:30:00"
   * @returns "14:30"
   */
  static extractTime(isoDateTime: string): string {
    const date = new Date(isoDateTime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * extrair só a data de um formato ISO
   * @param isoDateTime "2026-01-11T14:30:00"
   * @returns "2026-01-11"
   */
  static extractDate(isoDateTime: string): string {
    return isoDateTime.split('T')[0];
  }

  /**
   * converter data completa para yyyy-mm-dd
   * @param date Date object
   * @returns "2026-01-11"
   */
  static formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}