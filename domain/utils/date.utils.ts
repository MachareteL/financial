/**
 * Utility class for consistent date handling across the application.
 * Ensures strict ISO/UTC handling and avoids manual string parsing hacks.
 */
export class DateUtils {
  /**
   * Parses a date string (YYYY-MM-DD or ISO) into a Date object.
   * Handles strict parsing to avoid inconsistencies.
   */
  static parse(dateString: string | Date | null | undefined): Date | null {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;

    // Fix for potential legacy hacks like replace(/-/g, '/')
    // We treat everything as ISO standard inputs
    const cleanString = dateString.toString().trim();

    // Explicitly handle YYYY-MM-DD by appending time to ensure UTC or midnight local consistency
    // depending on requirement. For this app, backend mimics UTC storage.
    // If string is YYYY-MM-DD, parsing directly in new Date() treats it as UTC.
    const date = new Date(cleanString);

    if (isNaN(date.getTime())) {
      console.warn(`DateUtils: Invalid date received: ${dateString}`);
      return null;
    }

    return date;
  }

  /**
   * Returns a date string in YYYY-MM-DD format (ISO 8601 Date only).
   * Safe to use for UI inputs and DTOs expecting simple date strings.
   * Uses UTC methods to ensure the date doesn't shift due to timezone.
   */
  static toISODateString(
    date: Date | string | null | undefined
  ): string | null {
    const d = this.parse(date);
    if (!d) return null;
    return d.toISOString().split("T")[0];
  }

  /**
   * Returns a generic Date object for "now".
   */
  static now(): Date {
    return new Date();
  }

  /**
   * Returns a Date object representing the start of the given month.
   */
  static getStartOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Returns a Date object representing the end of the given month.
   */
  static getEndOfMonth(date: Date = new Date()): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
  }

  /**
   * Utility to safely convert a UI date string (YYYY-MM-DD) to a Date object set at noon
   * to avoid timezone shifts when displaying just the day.
   */
  static parseFromUI(dateString: string): Date {
    // YYYY-MM-DD
    if (!dateString) return new Date();
    // Append T12:00:00 to ensure it falls in the middle of the day,
    // minimizing risk of shifting to previous day due to timezone offsets.
    return new Date(`${dateString}T12:00:00`);
  }
}
