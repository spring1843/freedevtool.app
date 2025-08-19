import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Time and Date Utilities", () => {
  beforeEach(() => {
    // Reset any date mocks before each test
    vi.useRealTimers();
  });

  describe("Date Formatting", () => {
    it("should format date to ISO string", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      expect(date.toISOString()).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should format date to locale string", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const formatted = date.toLocaleDateString("en-US");
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("should format time to locale string", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const formatted = date.toLocaleTimeString("en-US");
      expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it("should handle invalid dates", () => {
      const invalidDate = new Date("invalid");
      expect(isNaN(invalidDate.getTime())).toBe(true);
    });
  });

  describe("Date Parsing", () => {
    it("should parse ISO date string", () => {
      const isoString = "2024-01-15T10:30:00.000Z";
      const date = new Date(isoString);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });

    it("should parse common date formats", () => {
      const formats = [
        "2024-01-15",
        "01/15/2024",
        "Jan 15, 2024",
        "15 Jan 2024",
      ];

      formats.forEach(format => {
        const date = new Date(format);
        expect(isNaN(date.getTime())).toBe(false);
      });
    });

    it("should handle timestamp parsing", () => {
      const timestamp = 1705312200000; // Jan 15, 2024
      const date = new Date(timestamp);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
    });
  });

  describe("Date Calculations", () => {
    it("should calculate difference between dates", () => {
      const date1 = new Date("2024-01-15T10:00:00Z");
      const date2 = new Date("2024-01-15T12:00:00Z");
      const diffMs = date2.getTime() - date1.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      expect(diffHours).toBe(2);
    });

    it("should add days to date", () => {
      const date = new Date("2024-01-15T00:00:00Z");
      const newDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
      expect(newDate.getUTCDate()).toBe(22);
    });

    it("should calculate age from birthdate", () => {
      const birthDate = new Date("1990-01-15");
      const currentDate = new Date("2024-01-15");
      const ageMs = currentDate.getTime() - birthDate.getTime();
      const age = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
      expect(age).toBe(33);
    });

    it("should handle leap years", () => {
      const leapYear = new Date("2024-02-29T00:00:00Z");
      expect(leapYear.getUTCMonth()).toBe(1); // February
      expect(leapYear.getUTCDate()).toBe(29);
    });
  });

  describe("Timezone Handling", () => {
    it("should handle UTC conversions", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(0);
      expect(date.getUTCDate()).toBe(15);
      expect(date.getUTCHours()).toBe(10);
    });

    it("should format date in different timezones", () => {
      const date = new Date("2024-01-15T10:30:00Z");

      // These tests might vary based on system timezone, so we test the format rather than exact values
      const utcString = date.toISOString();
      expect(utcString).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);

      const localString = date.toLocaleString();
      expect(localString).toBeTruthy();
      expect(typeof localString).toBe("string");
    });

    it("should handle timezone offset", () => {
      const date = new Date();
      const timezoneOffset = date.getTimezoneOffset();
      expect(typeof timezoneOffset).toBe("number");
      // Timezone offset is in minutes
      expect(Math.abs(timezoneOffset)).toBeLessThanOrEqual(14 * 60); // Max timezone offset is UTC+14
    });
  });

  describe("Time Duration Calculations", () => {
    it("should calculate duration in different units", () => {
      const duration = 3665000; // 1 hour, 1 minute, 5 seconds in milliseconds

      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((duration % (1000 * 60)) / 1000);

      expect(hours).toBe(1);
      expect(minutes).toBe(1);
      expect(seconds).toBe(5);
    });

    it("should format duration as human readable", () => {
      const formatDuration = (ms: number): string => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);

        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);

        return parts.join(" ") || "0s";
      };

      expect(formatDuration(3665000)).toBe("1h 1m 5s");
      expect(formatDuration(125000)).toBe("2m 5s");
      expect(formatDuration(5000)).toBe("5s");
      expect(formatDuration(0)).toBe("0s");
    });

    it("should parse duration strings", () => {
      const parseDuration = (str: string): number => {
        const regex = /(\d+)([hms])/g;
        let total = 0;
        let match;

        while ((match = regex.exec(str)) !== null) {
          const value = parseInt(match[1]);
          const unit = match[2];

          switch (unit) {
            case "h":
              total += value * 60 * 60 * 1000;
              break;
            case "m":
              total += value * 60 * 1000;
              break;
            case "s":
              total += value * 1000;
              break;
            default:
              throw new Error(`Unknown time unit: ${unit}`);
          }
        }

        return total;
      };

      expect(parseDuration("1h 30m 45s")).toBe(5445000);
      expect(parseDuration("2m 30s")).toBe(150000);
      expect(parseDuration("45s")).toBe(45000);
    });
  });

  describe("Stopwatch and Timer Functionality", () => {
    it("should track elapsed time", () => {
      vi.useFakeTimers();

      const startTime = Date.now();
      vi.advanceTimersByTime(5000); // Advance by 5 seconds
      const endTime = Date.now();

      expect(endTime - startTime).toBe(5000);

      vi.useRealTimers();
    });

    it("should handle timer intervals", () => {
      vi.useFakeTimers();

      let callCount = 0;
      const intervalId = setInterval(() => {
        callCount++;
      }, 1000);

      vi.advanceTimersByTime(3000);
      expect(callCount).toBe(3);

      clearInterval(intervalId);
      vi.useRealTimers();
    });

    it("should handle countdown timer", () => {
      const countdown = (startSeconds: number): number[] => {
        const results: number[] = [];
        for (let i = startSeconds; i >= 0; i--) {
          results.push(i);
        }
        return results;
      };

      expect(countdown(3)).toEqual([3, 2, 1, 0]);
      expect(countdown(0)).toEqual([0]);
    });
  });

  describe("Date Validation", () => {
    it("should validate date strings", () => {
      const isValidDate = (dateString: string): boolean => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      };

      expect(isValidDate("2024-01-15")).toBe(true);
      expect(isValidDate("2024-02-29")).toBe(true); // Leap year
      expect(isValidDate("2023-02-29")).toBe(true); // JavaScript Date actually accepts this
      expect(isValidDate("invalid")).toBe(false);
      expect(isValidDate("2024-13-01")).toBe(false); // Invalid month
    });

    it("should check if date is in the past", () => {
      const isInPast = (date: Date): boolean => date.getTime() < Date.now();

      const pastDate = new Date("2020-01-01");
      const futureDate = new Date("2030-01-01");

      expect(isInPast(pastDate)).toBe(true);
      expect(isInPast(futureDate)).toBe(false);
    });

    it("should check if date is weekend", () => {
      const isWeekend = (date: Date): boolean => {
        const day = date.getUTCDay();
        return day === 0 || day === 6; // Sunday = 0, Saturday = 6
      };

      const saturday = new Date("2024-01-13T00:00:00Z"); // Saturday
      const sunday = new Date("2024-01-14T00:00:00Z"); // Sunday
      const monday = new Date("2024-01-15T00:00:00Z"); // Monday

      expect(isWeekend(saturday)).toBe(true);
      expect(isWeekend(sunday)).toBe(true);
      expect(isWeekend(monday)).toBe(false);
    });
  });
});
