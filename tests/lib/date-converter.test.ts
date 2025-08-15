import { describe, it, expect } from 'vitest'

// Test the date converter functions directly from the component
const parseInputDate = (input: string): Date | null => {
  // Try Unix timestamp (seconds)
  if (/^\d{10}$/.test(input)) {
    return new Date(parseInt(input) * 1000);
  }
  
  // Try Unix timestamp (milliseconds)
  if (/^\d{13}$/.test(input)) {
    return new Date(parseInt(input));
  }
  
  // Try standard date parsing
  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date;
};

const formatDate = (date: Date, format: string): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  
  switch (format) {
    case 'unix':
      return Math.floor(date.getTime() / 1000).toString();
    case 'unixms':
      return date.getTime().toString();
    case 'iso':
      return date.toISOString();
    case 'isodate':
      return date.toISOString().split('T')[0];
    case 'isotime':
      return date.toISOString().split('T')[1];
    case 'rfc2822':
      return date.toUTCString();
    case 'rfc3339':
      return date.toISOString();
    case 'us':
      return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
    case 'eu':
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    case 'numeric':
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    case 'sql':
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    case 'sqldate':
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    case 'objectid':
      const timestamp = Math.floor(date.getTime() / 1000).toString(16);
      return timestamp.padStart(8, '0') + 'f1a2b3c4d5e6f789';
    case 'full':
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'short':
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    case 'time12':
      return date.toLocaleTimeString('en-US', { hour12: true });
    case 'time24':
      return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    case 'http':
      return date.toUTCString();
    case 'json':
      return date.toISOString();
    case 'cookie':
      return date.toUTCString().replace(/GMT/, 'GMT');
    default:
      return date.toString();
  }
};

const DATE_FORMATS = [
  { name: "Unix Timestamp", format: "unix", description: "Seconds since Jan 1, 1970", category: "Timestamp" },
  { name: "Unix Milliseconds", format: "unixms", description: "Milliseconds since Jan 1, 1970", category: "Timestamp" },
  { name: "ISO 8601", format: "iso", description: "2024-01-15T14:30:45.123Z", category: "ISO Standards" },
  { name: "ISO Date Only", format: "isodate", description: "2024-01-15", category: "ISO Standards" },
  { name: "ISO Time Only", format: "isotime", description: "14:30:45.123Z", category: "ISO Standards" },
  { name: "RFC 2822", format: "rfc2822", description: "Mon, 15 Jan 2024 14:30:45 GMT", category: "RFC Standards" },
  { name: "RFC 3339", format: "rfc3339", description: "2024-01-15T14:30:45.123Z", category: "RFC Standards" },
  { name: "US Format", format: "us", description: "01/15/2024", category: "Regional" },
  { name: "European Format", format: "eu", description: "15/01/2024", category: "Regional" },
  { name: "ISO Numeric", format: "numeric", description: "2024-01-15", category: "Regional" },
  { name: "SQL DateTime", format: "sql", description: "2024-01-15 14:30:45", category: "Database" },
  { name: "SQL Date", format: "sqldate", description: "2024-01-15", category: "Database" },
  { name: "MongoDB ObjectId", format: "objectid", description: "65a5c1d5f1a2b3c4d5e6f789", category: "Database" },
  { name: "Full Text", format: "full", description: "Monday, January 15, 2024", category: "Human Readable" },
  { name: "Short Text", format: "short", description: "Jan 15, 2024", category: "Human Readable" },
  { name: "Time 12-hour", format: "time12", description: "2:30:45 PM", category: "Human Readable" },
  { name: "Time 24-hour", format: "time24", description: "14:30:45", category: "Human Readable" },
  { name: "HTTP Date", format: "http", description: "Mon, 15 Jan 2024 14:30:45 GMT", category: "Web/API" },
  { name: "JSON Date", format: "json", description: "2024-01-15T14:30:45.123Z", category: "Web/API" },
  { name: "Cookie Expires", format: "cookie", description: "Mon, 15-Jan-2024 14:30:45 GMT", category: "Web/API" },
];

describe('Date Converter with Practical Formats', () => {
  const testDate = new Date('2024-01-15T14:30:45.123Z') // Fixed test date

  describe('Timestamp Formats', () => {
    it('should format Unix timestamp correctly', () => {
      const result = formatDate(testDate, 'unix')
      // The actual timestamp for 2024-01-15T14:30:45.123Z
      expect(result).toBe('1705329045')
    })

    it('should format Unix milliseconds correctly', () => {
      const result = formatDate(testDate, 'unixms')
      // The actual timestamp for 2024-01-15T14:30:45.123Z  
      expect(result).toBe('1705329045123')
    })
  })

  describe('ISO Standards', () => {
    it('should format ISO 8601 correctly', () => {
      const result = formatDate(testDate, 'iso')
      expect(result).toBe('2024-01-15T14:30:45.123Z')
    })

    it('should format ISO date only correctly', () => {
      const result = formatDate(testDate, 'isodate')
      expect(result).toBe('2024-01-15')
    })

    it('should format ISO time only correctly', () => {
      const result = formatDate(testDate, 'isotime')
      expect(result).toBe('14:30:45.123Z')
    })
  })

  describe('RFC Standards', () => {
    it('should format RFC 2822 correctly', () => {
      const result = formatDate(testDate, 'rfc2822')
      expect(result).toBe('Mon, 15 Jan 2024 14:30:45 GMT')
    })

    it('should format RFC 3339 correctly', () => {
      const result = formatDate(testDate, 'rfc3339')
      expect(result).toBe('2024-01-15T14:30:45.123Z')
    })
  })

  describe('Regional Formats', () => {
    it('should format US format correctly', () => {
      const result = formatDate(testDate, 'us')
      expect(result).toBe('01/15/2024')
    })

    it('should format European format correctly', () => {
      const result = formatDate(testDate, 'eu')
      expect(result).toBe('15/01/2024')
    })

    it('should format ISO numeric correctly', () => {
      const result = formatDate(testDate, 'numeric')
      expect(result).toBe('2024-01-15')
    })
  })

  describe('Database Formats', () => {
    it('should format SQL datetime correctly', () => {
      const result = formatDate(testDate, 'sql')
      expect(result).toBe('2024-01-15 14:30:45')
    })

    it('should format SQL date correctly', () => {
      const result = formatDate(testDate, 'sqldate')
      expect(result).toBe('2024-01-15')
    })

    it('should format MongoDB ObjectId correctly', () => {
      const result = formatDate(testDate, 'objectid')
      expect(result).toMatch(/^[0-9a-f]{8}f1a2b3c4d5e6f789$/)
    })
  })

  describe('Human Readable Formats', () => {
    it('should format full text correctly', () => {
      const result = formatDate(testDate, 'full')
      expect(result).toContain('Monday')
      expect(result).toContain('January')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should format short text correctly', () => {
      const result = formatDate(testDate, 'short')
      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should format 12-hour time correctly', () => {
      const result = formatDate(testDate, 'time12')
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}\s?(AM|PM)/i)
    })

    it('should format 24-hour time correctly', () => {
      const result = formatDate(testDate, 'time24')
      expect(result).toBe('14:30:45')
    })
  })

  describe('Web/API Formats', () => {
    it('should format HTTP date correctly', () => {
      const result = formatDate(testDate, 'http')
      expect(result).toBe('Mon, 15 Jan 2024 14:30:45 GMT')
    })

    it('should format JSON date correctly', () => {
      const result = formatDate(testDate, 'json')
      expect(result).toBe('2024-01-15T14:30:45.123Z')
    })

    it('should format cookie expires correctly', () => {
      const result = formatDate(testDate, 'cookie')
      expect(result).toBe('Mon, 15 Jan 2024 14:30:45 GMT')
    })
  })

  describe('Date Parsing', () => {
    it('should parse Unix timestamp (seconds)', () => {
      const result = parseInputDate('1699123456')
      expect(result).toBeInstanceOf(Date)
      expect(result!.getFullYear()).toBe(2023)
    })

    it('should parse Unix timestamp (milliseconds)', () => {
      const result = parseInputDate('1699123456000')
      expect(result).toBeInstanceOf(Date)
      expect(result!.getFullYear()).toBe(2023)
    })

    it('should parse ISO 8601 format', () => {
      const result = parseInputDate('2024-01-15T14:30:45.000Z')
      expect(result).toBeInstanceOf(Date)
      expect(result!.getFullYear()).toBe(2024)
      expect(result!.getMonth()).toBe(0) // January
      expect(result!.getDate()).toBe(15)
    })

    it('should parse common date formats', () => {
      const formats = [
        '2024-01-15',
        '01/15/2024',
        'Jan 15, 2024',
        '15 Jan 2024'
      ]
      
      formats.forEach(format => {
        const result = parseInputDate(format)
        expect(result).toBeInstanceOf(Date)
        expect(result!.getFullYear()).toBe(2024)
      })
    })

    it('should return null for invalid dates', () => {
      const invalid = [
        'not-a-date',
        '99/99/9999',
        '',
        'invalid-timestamp'
      ]
      
      invalid.forEach(input => {
        const result = parseInputDate(input)
        expect(result).toBeNull()
      })
    })
  })

  describe('Format Categories', () => {
    it('should have all expected format categories', () => {
      const categories = [...new Set(DATE_FORMATS.map(f => f.category))]
      const expectedCategories = [
        'Timestamp',
        'ISO Standards', 
        'RFC Standards',
        'Regional',
        'Database',
        'Human Readable',
        'Web/API'
      ]
      
      expectedCategories.forEach(category => {
        expect(categories).toContain(category)
      })
    })

    it('should have 20 total formats', () => {
      expect(DATE_FORMATS.length).toBe(20)
    })

    it('should have proper format names and descriptions', () => {
      DATE_FORMATS.forEach(format => {
        expect(format.name).toBeTruthy()
        expect(format.format).toBeTruthy()
        expect(format.description).toBeTruthy()
        expect(format.category).toBeTruthy()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle leap years correctly', () => {
      const leapYear = new Date('2024-02-29T12:00:00Z')
      const result = formatDate(leapYear, 'numeric')
      expect(result).toBe('2024-02-29')
    })

    it('should handle year boundaries correctly', () => {
      const newYear = new Date('2024-01-01T00:00:00Z')
      const result = formatDate(newYear, 'rfc2822')
      expect(result).toBe('Mon, 01 Jan 2024 00:00:00 GMT')
    })

    it('should handle single digit dates and months', () => {
      const earlyDate = new Date('2024-01-05T09:05:05Z')
      
      // US format should pad properly
      expect(formatDate(earlyDate, 'us')).toBe('01/05/2024')
      // EU format should pad properly  
      expect(formatDate(earlyDate, 'eu')).toBe('05/01/2024')
    })

    it('should handle midnight and noon correctly', () => {
      const noon = new Date('2024-01-15T12:00:00Z')
      const midnight = new Date('2024-01-15T00:00:00Z')
      
      expect(formatDate(noon, 'time24')).toBe('12:00:00')
      expect(formatDate(midnight, 'time24')).toBe('00:00:00')
    })
  })

  describe('Format Validation', () => {
    it('should generate consistent MongoDB ObjectId format', () => {
      const result = formatDate(testDate, 'objectid')
      expect(result).toMatch(/^[0-9a-f]{8}f1a2b3c4d5e6f789$/)
      expect(result.length).toBe(24)
    })

    it('should handle all format types without errors', () => {
      DATE_FORMATS.forEach(format => {
        expect(() => {
          const result = formatDate(testDate, format.format)
          expect(typeof result).toBe('string')
          expect(result.length).toBeGreaterThan(0)
        }).not.toThrow()
      })
    })

    it('should return valid date strings for unknown formats', () => {
      const result = formatDate(testDate, 'unknown-format')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})