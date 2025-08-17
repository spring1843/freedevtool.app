import type { WorldClockCity } from '@/types/tools';

// Go-style date format patterns and their descriptions
export interface DateFormatPattern {
  name: string;
  pattern: string;
  description: string;
  example: string;
}

// Standard Go date format patterns
export const DATE_FORMAT_PATTERNS: DateFormatPattern[] = [

  {
    name: 'ANSIC',
    pattern: 'Mon Jan _2 15:04:05 2006',
    description: 'ANSI C asctime() format',
    example: 'Mon Jan  2 15:04:05 2006'
  },
  {
    name: 'UnixDate',
    pattern: 'Mon Jan _2 15:04:05 MST 2006',
    description: 'Unix date command format',
    example: 'Mon Jan  2 15:04:05 MST 2006'
  },
  {
    name: 'RubyDate',
    pattern: 'Mon Jan 02 15:04:05 -0700 2006',
    description: 'Ruby date format',
    example: 'Mon Jan 02 15:04:05 -0700 2006'
  },
  {
    name: 'RFC822',
    pattern: '02 Jan 06 15:04 MST',
    description: 'RFC 822 format',
    example: '02 Jan 06 15:04 MST'
  },
  {
    name: 'RFC822Z',
    pattern: '02 Jan 06 15:04 -0700',
    description: 'RFC 822 with numeric zone',
    example: '02 Jan 06 15:04 -0700'
  },
  {
    name: 'RFC850',
    pattern: 'Monday, 02-Jan-06 15:04:05 MST',
    description: 'RFC 850 format',
    example: 'Monday, 02-Jan-06 15:04:05 MST'
  },
  {
    name: 'RFC1123',
    pattern: 'Mon, 02 Jan 2006 15:04:05 MST',
    description: 'RFC 1123 format',
    example: 'Mon, 02 Jan 2006 15:04:05 MST'
  },
  {
    name: 'RFC1123Z',
    pattern: 'Mon, 02 Jan 2006 15:04:05 -0700',
    description: 'RFC 1123 with numeric zone',
    example: 'Mon, 02 Jan 2006 15:04:05 -0700'
  },
  {
    name: 'RFC3339',
    pattern: '2006-01-02T15:04:05Z07:00',
    description: 'RFC 3339 format (ISO 8601)',
    example: '2006-01-02T15:04:05Z07:00'
  },
  {
    name: 'RFC3339Nano',
    pattern: '2006-01-02T15:04:05.999999999Z07:00',
    description: 'RFC 3339 with nanoseconds',
    example: '2006-01-02T15:04:05.999999999Z07:00'
  },
  {
    name: 'Kitchen',
    pattern: '3:04PM',
    description: 'Kitchen time format',
    example: '3:04PM'
  },
  {
    name: 'Stamp',
    pattern: 'Jan _2 15:04:05',
    description: 'Handy timestamp',
    example: 'Jan  2 15:04:05'
  },
  {
    name: 'StampMilli',
    pattern: 'Jan _2 15:04:05.000',
    description: 'Timestamp with milliseconds',
    example: 'Jan  2 15:04:05.000'
  },
  {
    name: 'StampMicro',
    pattern: 'Jan _2 15:04:05.000000',
    description: 'Timestamp with microseconds',
    example: 'Jan  2 15:04:05.000000'
  },
  {
    name: 'StampNano',
    pattern: 'Jan _2 15:04:05.000000000',
    description: 'Timestamp with nanoseconds',
    example: 'Jan  2 15:04:05.000000000'
  },
  {
    name: 'DateTime',
    pattern: '2006-01-02 15:04:05',
    description: 'Standard datetime format',
    example: '2006-01-02 15:04:05'
  },
  {
    name: 'DateOnly',
    pattern: '2006-01-02',
    description: 'Date only format',
    example: '2006-01-02'
  },
  {
    name: 'TimeOnly',
    pattern: '15:04:05',
    description: 'Time only format',
    example: '15:04:05'
  }
];

// Format a date according to Go-style patterns
export function formatDateWithPattern(date: Date, pattern: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const pad = (n: number, width = 2): string => n.toString().padStart(width, '0');
  const padSpace = (n: number): string => n.toString().padStart(2, ' ');
  
  // Get timezone offset
  const offset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetMinutes = Math.abs(offset) % 60;
  const offsetSign = offset >= 0 ? '+' : '-';
  const timezoneOffset = `${offsetSign}${pad(offsetHours)}${pad(offsetMinutes)}`;
  const timezoneOffsetColon = `${offsetSign}${pad(offsetHours)}:${pad(offsetMinutes)}`;
  
  // Extract date components
  const hour24 = date.getHours();
  const hour12 = hour24 % 12 || 12;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  
  // Use regex-based replacement with word boundaries to prevent conflicts
  let result = pattern;
  
  // Step 1: Replace specific multi-character patterns first (exact matches)
  result = result.replace(/2006/g, year.toString());
  result = result.replace(/'06/g, year.toString().slice(2));
  result = result.replace(/January/g, new Date(2000, date.getMonth()).toLocaleString('en', { month: 'long' }));
  result = result.replace(/Monday/g, fullDays[date.getDay()]);
  result = result.replace(/999999999/g, `${pad(milliseconds, 3)  }000000`);
  result = result.replace(/000000000/g, `${pad(milliseconds, 3)  }000000`);
  result = result.replace(/999999/g, `${pad(milliseconds, 3)  }000`);
  result = result.replace(/999999999/g, `${pad(milliseconds, 3)}000000`);
  result = result.replace(/000000000/g, `${pad(milliseconds, 3)}000000`);
  result = result.replace(/999999/g, `${pad(milliseconds, 3)}000`);
  result = result.replace(/000000/g, `${pad(milliseconds, 3)}000`);
  result = result.replace(/Z07:00/g, offset === 0 ? 'Z' : timezoneOffsetColon);
  result = result.replace(/Z0700/g, offset === 0 ? 'Z' : timezoneOffset);
  result = result.replace(/-0700/g, timezoneOffset);
  // Handle millisecond patterns more carefully
  result = result.replace(/\.999/g, `.${pad(milliseconds, 3)}`);
  result = result.replace(/\.000/g, `.${pad(milliseconds, 3)}`);
  result = result.replace(/Jan/g, months[date.getMonth()]);
  result = result.replace(/Mon/g, days[date.getDay()]);
  result = result.replace(/MST/g, 'UTC');
  result = result.replace(/_2/g, padSpace(day));
  result = result.replace(/PM/g, hour24 >= 12 ? 'PM' : 'AM');
  result = result.replace(/pm/g, hour24 >= 12 ? 'pm' : 'am');
  
  // Step 2: Handle special patterns first to avoid conflicts
  // Kitchen pattern (3:04PM) - handle this special case first
  if (pattern === '3:04PM') {
    result = result.replace(/3:04PM/g, `${hour12}:${pad(minute)}${hour24 >= 12 ? 'PM' : 'AM'}`);
  } else {
    // Standard two-digit patterns
    if (pattern.includes('15:')) {
      result = result.replace(/15:/g, `${pad(hour24)}:`);
    } else {
      result = result.replace(/(\D|^)15(\D|$)/g, `$1${pad(hour24)}$2`);
    }
    
    result = result.replace(/(\D|^)05(\D|$)/g, `$1${pad(second)}$2`);
    result = result.replace(/(\D|^)04(\D|$)/g, `$1${pad(minute)}$2`);
    result = result.replace(/(\D|^)03(\D|$)/g, `$1${pad(hour12)}$2`);
    result = result.replace(/(\D|^)02(\D|$)/g, `$1${pad(day)}$2`);
    result = result.replace(/(\D|^)01(\D|$)/g, `$1${pad(month)}$2`);
    
    // Step 3: Handle '06' separately to avoid conflict with "'06"
    if (!pattern.includes("'06")) {
      result = result.replace(/(\D|^)06(\D|$)/g, `$1${year.toString().slice(2)}$2`);
    }
    
    // Step 4: Replace single digits only when surrounded by non-digits
    result = result.replace(/(\D|^)5(\D|$)/g, `$1${second.toString()}$2`);
    result = result.replace(/(\D|^)4(\D|$)/g, `$1${minute.toString()}$2`);
    result = result.replace(/(\D|^)3(\D|$)/g, `$1${hour12.toString()}$2`);
    result = result.replace(/(\D|^)2(\D|$)/g, `$1${day.toString()}$2`);
    result = result.replace(/(\D|^)1(\D|$)/g, `$1${month.toString()}$2`);
  }
  
  return result;
}

// Parse various date formats
export function parseDate(input: string): Date | null {
  // Try common date formats
  const formats = [
    // Unix timestamp (seconds)
    /^\d{10}$/,
    // Unix timestamp (milliseconds)  
    /^\d{13}$/,
    // ISO formats
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/,
    /^\d{4}-\d{2}-\d{2}/,
    // RFC formats
    /^[A-Za-z]{3},?\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/,
    // US formats
    /^\d{1,2}\/\d{1,2}\/\d{4}/,
    /^\d{1,2}-\d{1,2}-\d{4}/,
    // European formats
    /^\d{1,2}\.\d{1,2}\.\d{4}/,
  ];
  
  try {
    // Try Unix timestamp
    if (/^\d{10}$/.test(input)) {
      return new Date(parseInt(input) * 1000);
    }
    if (/^\d{13}$/.test(input)) {
      return new Date(parseInt(input));
    }
    
    // Try standard Date constructor
    const date = new Date(input);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Convert all supported formats for a given date
export function convertToAllFormats(date: Date): Array<{ name: string; value: string; description: string }> {
  const formats = [
    // Standard JavaScript formats
    {
      name: "Unix Timestamp",
      value: Math.floor(date.getTime() / 1000).toString(),
      description: "Seconds since January 1, 1970 UTC"
    },
    {
      name: "Milliseconds",
      value: date.getTime().toString(),
      description: "Milliseconds since January 1, 1970 UTC"
    },
    {
      name: "ISO 8601",
      value: date.toISOString(),
      description: "International standard date format"
    },
    {
      name: "UTC String",
      value: date.toUTCString(),
      description: "Coordinated Universal Time"
    },
    {
      name: "Local String",
      value: date.toString(),
      description: "Local time zone representation"
    },
    {
      name: "JSON Format",
      value: date.toJSON(),
      description: "JSON serialization format"
    },
    {
      name: "Locale String",
      value: date.toLocaleString(),
      description: "Formatted for current locale"
    }
  ];
  
  // Add Go-style formats
  for (const pattern of DATE_FORMAT_PATTERNS) {
    formats.push({
      name: pattern.name,
      value: formatDateWithPattern(date, pattern.pattern),
      description: pattern.description
    });
  }
  
  return formats;
}

// Format milliseconds to display high precision time (MM:SS.mmm or HH:MM:SS.mmm with microseconds)
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const ms = Math.floor(milliseconds % 1000);
  const microseconds = Math.floor((milliseconds * 1000) % 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}${microseconds.toString().padStart(3, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}${microseconds.toString().padStart(3, '0')}`;
}

// Format time for timer display (MM:SS, HH:MM:SS, or DD:HH:MM:SS)
export function formatTimerTime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (days > 0) {
    return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Default world clock cities (shown by default)
export const defaultWorldClockCities: WorldClockCity[] = [
  { name: 'New York', timezone: 'America/New_York', country: 'USA' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'USA' },
  { name: 'London', timezone: 'Europe/London', country: 'UK' },
  { name: 'Paris', timezone: 'Europe/Paris', country: 'France' },
  { name: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' },
  { name: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' },
  { name: 'Mumbai', timezone: 'Asia/Kolkata', country: 'India' },
  { name: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE' },
  { name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'Hong Kong' },
  { name: 'Toronto', timezone: 'America/Toronto', country: 'Canada' },
  { name: 'São Paulo', timezone: 'America/Sao_Paulo', country: 'Brazil' },
  { name: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia' },
  { name: 'Beijing', timezone: 'Asia/Shanghai', country: 'China' },
];

// Backward compatibility
export const worldClockCities = defaultWorldClockCities;

// Comprehensive list of world timezones organized by region
export const allTimezones: WorldClockCity[] = [
  // Africa
  { name: 'Abidjan', timezone: 'Africa/Abidjan', country: 'Ivory Coast' },
  { name: 'Accra', timezone: 'Africa/Accra', country: 'Ghana' },
  { name: 'Addis Ababa', timezone: 'Africa/Addis_Ababa', country: 'Ethiopia' },
  { name: 'Algiers', timezone: 'Africa/Algiers', country: 'Algeria' },
  { name: 'Asmara', timezone: 'Africa/Asmara', country: 'Eritrea' },
  { name: 'Cairo', timezone: 'Africa/Cairo', country: 'Egypt' },
  { name: 'Casablanca', timezone: 'Africa/Casablanca', country: 'Morocco' },
  { name: 'Dar es Salaam', timezone: 'Africa/Dar_es_Salaam', country: 'Tanzania' },
  { name: 'Harare', timezone: 'Africa/Harare', country: 'Zimbabwe' },
  { name: 'Johannesburg', timezone: 'Africa/Johannesburg', country: 'South Africa' },
  { name: 'Lagos', timezone: 'Africa/Lagos', country: 'Nigeria' },
  { name: 'Nairobi', timezone: 'Africa/Nairobi', country: 'Kenya' },
  { name: 'Tunis', timezone: 'Africa/Tunis', country: 'Tunisia' },
  
  // America
  { name: 'Anchorage', timezone: 'America/Anchorage', country: 'USA' },
  { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina' },
  { name: 'Caracas', timezone: 'America/Caracas', country: 'Venezuela' },
  { name: 'Chicago', timezone: 'America/Chicago', country: 'USA' },
  { name: 'Denver', timezone: 'America/Denver', country: 'USA' },
  { name: 'Guatemala City', timezone: 'America/Guatemala', country: 'Guatemala' },
  { name: 'Halifax', timezone: 'America/Halifax', country: 'Canada' },
  { name: 'Havana', timezone: 'America/Havana', country: 'Cuba' },
  { name: 'Lima', timezone: 'America/Lima', country: 'Peru' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'USA' },
  { name: 'Mexico City', timezone: 'America/Mexico_City', country: 'Mexico' },
  { name: 'Montreal', timezone: 'America/Montreal', country: 'Canada' },
  { name: 'New York', timezone: 'America/New_York', country: 'USA' },
  { name: 'Panama City', timezone: 'America/Panama', country: 'Panama' },
  { name: 'Phoenix', timezone: 'America/Phoenix', country: 'USA' },
  { name: 'Santiago', timezone: 'America/Santiago', country: 'Chile' },
  { name: 'São Paulo', timezone: 'America/Sao_Paulo', country: 'Brazil' },
  { name: 'Toronto', timezone: 'America/Toronto', country: 'Canada' },
  { name: 'Vancouver', timezone: 'America/Vancouver', country: 'Canada' },
  
  // Asia
  { name: 'Almaty', timezone: 'Asia/Almaty', country: 'Kazakhstan' },
  { name: 'Baghdad', timezone: 'Asia/Baghdad', country: 'Iraq' },
  { name: 'Bangkok', timezone: 'Asia/Bangkok', country: 'Thailand' },
  { name: 'Beijing', timezone: 'Asia/Shanghai', country: 'China' },
  { name: 'Colombo', timezone: 'Asia/Colombo', country: 'Sri Lanka' },
  { name: 'Damascus', timezone: 'Asia/Damascus', country: 'Syria' },
  { name: 'Dhaka', timezone: 'Asia/Dhaka', country: 'Bangladesh' },
  { name: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'Hong Kong' },
  { name: 'Jakarta', timezone: 'Asia/Jakarta', country: 'Indonesia' },
  { name: 'Jerusalem', timezone: 'Asia/Jerusalem', country: 'Israel' },
  { name: 'Kabul', timezone: 'Asia/Kabul', country: 'Afghanistan' },
  { name: 'Karachi', timezone: 'Asia/Karachi', country: 'Pakistan' },
  { name: 'Kathmandu', timezone: 'Asia/Kathmandu', country: 'Nepal' },
  { name: 'Kolkata', timezone: 'Asia/Kolkata', country: 'India' },
  { name: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur', country: 'Malaysia' },
  { name: 'Manila', timezone: 'Asia/Manila', country: 'Philippines' },
  { name: 'Riyadh', timezone: 'Asia/Riyadh', country: 'Saudi Arabia' },
  { name: 'Seoul', timezone: 'Asia/Seoul', country: 'South Korea' },
  { name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore' },
  { name: 'Taipei', timezone: 'Asia/Taipei', country: 'Taiwan' },
  { name: 'Tehran', timezone: 'Asia/Tehran', country: 'Iran' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' },
  { name: 'Ulaanbaatar', timezone: 'Asia/Ulaanbaatar', country: 'Mongolia' },
  { name: 'Yangon', timezone: 'Asia/Yangon', country: 'Myanmar' },
  { name: 'Yerevan', timezone: 'Asia/Yerevan', country: 'Armenia' },
  
  // Atlantic
  { name: 'Azores', timezone: 'Atlantic/Azores', country: 'Portugal' },
  { name: 'Cape Verde', timezone: 'Atlantic/Cape_Verde', country: 'Cape Verde' },
  { name: 'Reykjavik', timezone: 'Atlantic/Reykjavik', country: 'Iceland' },
  
  // Australia
  { name: 'Adelaide', timezone: 'Australia/Adelaide', country: 'Australia' },
  { name: 'Brisbane', timezone: 'Australia/Brisbane', country: 'Australia' },
  { name: 'Darwin', timezone: 'Australia/Darwin', country: 'Australia' },
  { name: 'Melbourne', timezone: 'Australia/Melbourne', country: 'Australia' },
  { name: 'Perth', timezone: 'Australia/Perth', country: 'Australia' },
  { name: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' },
  
  // Europe
  { name: 'Amsterdam', timezone: 'Europe/Amsterdam', country: 'Netherlands' },
  { name: 'Athens', timezone: 'Europe/Athens', country: 'Greece' },
  { name: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany' },
  { name: 'Brussels', timezone: 'Europe/Brussels', country: 'Belgium' },
  { name: 'Bucharest', timezone: 'Europe/Bucharest', country: 'Romania' },
  { name: 'Budapest', timezone: 'Europe/Budapest', country: 'Hungary' },
  { name: 'Copenhagen', timezone: 'Europe/Copenhagen', country: 'Denmark' },
  { name: 'Dublin', timezone: 'Europe/Dublin', country: 'Ireland' },
  { name: 'Helsinki', timezone: 'Europe/Helsinki', country: 'Finland' },
  { name: 'Istanbul', timezone: 'Europe/Istanbul', country: 'Turkey' },
  { name: 'Lisbon', timezone: 'Europe/Lisbon', country: 'Portugal' },
  { name: 'London', timezone: 'Europe/London', country: 'UK' },
  { name: 'Madrid', timezone: 'Europe/Madrid', country: 'Spain' },
  { name: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia' },
  { name: 'Oslo', timezone: 'Europe/Oslo', country: 'Norway' },
  { name: 'Paris', timezone: 'Europe/Paris', country: 'France' },
  { name: 'Prague', timezone: 'Europe/Prague', country: 'Czech Republic' },
  { name: 'Rome', timezone: 'Europe/Rome', country: 'Italy' },
  { name: 'Stockholm', timezone: 'Europe/Stockholm', country: 'Sweden' },
  { name: 'Vienna', timezone: 'Europe/Vienna', country: 'Austria' },
  { name: 'Warsaw', timezone: 'Europe/Warsaw', country: 'Poland' },
  { name: 'Zurich', timezone: 'Europe/Zurich', country: 'Switzerland' },
  
  // Indian
  { name: 'Chagos', timezone: 'Indian/Chagos', country: 'British Indian Ocean Territory' },
  { name: 'Maldives', timezone: 'Indian/Maldives', country: 'Maldives' },
  { name: 'Mauritius', timezone: 'Indian/Mauritius', country: 'Mauritius' },
  
  // Pacific
  { name: 'Auckland', timezone: 'Pacific/Auckland', country: 'New Zealand' },
  { name: 'Fiji', timezone: 'Pacific/Fiji', country: 'Fiji' },
  { name: 'Guam', timezone: 'Pacific/Guam', country: 'Guam' },
  { name: 'Honolulu', timezone: 'Pacific/Honolulu', country: 'USA' },
  { name: 'Samoa', timezone: 'Pacific/Samoa', country: 'American Samoa' },
  { name: 'Tahiti', timezone: 'Pacific/Tahiti', country: 'French Polynesia' },
  { name: 'Tonga', timezone: 'Pacific/Tongatapu', country: 'Tonga' },
];

// Get timezone offset information
export function getTimezoneOffset(timezone: string): string {
  try {
    // Calculate timezone offset for display purposes
    const offset = getTimezoneOffsetMinutes(timezone) / 60;
    const sign = offset >= 0 ? '+' : '';
    return `UTC${sign}${offset}`;
  } catch {
    return 'UTC+0';
  }
}

function getTimezoneOffsetMinutes(timezone: string): number {
  try {
    const now = new Date();
    const utc = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
    const target = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
    return (target.getTime() - utc.getTime()) / 60000;
  } catch {
    return 0;
  }
}

// Continental representatives - comprehensive timezone coverage per continent
export const continentalCities = {
  'Africa': [
    { name: 'Cape Verde', timezone: 'Atlantic/Cape_Verde', country: 'Cape Verde' }, // UTC-1
    { name: 'Casablanca', timezone: 'Africa/Casablanca', country: 'Morocco' }, // UTC+0/+1
    { name: 'Lagos', timezone: 'Africa/Lagos', country: 'Nigeria' }, // UTC+1  
    { name: 'Cairo', timezone: 'Africa/Cairo', country: 'Egypt' }, // UTC+2
    { name: 'Nairobi', timezone: 'Africa/Nairobi', country: 'Kenya' }, // UTC+3
    { name: 'Mauritius', timezone: 'Indian/Mauritius', country: 'Mauritius' }, // UTC+4
    { name: 'Johannesburg', timezone: 'Africa/Johannesburg', country: 'South Africa' } // UTC+2
  ],
  'Asia': [
    { name: 'Riyadh', timezone: 'Asia/Riyadh', country: 'Saudi Arabia' }, // UTC+3
    { name: 'Tehran', timezone: 'Asia/Tehran', country: 'Iran' }, // UTC+3:30
    { name: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE' }, // UTC+4
    { name: 'Kabul', timezone: 'Asia/Kabul', country: 'Afghanistan' }, // UTC+4:30
    { name: 'Karachi', timezone: 'Asia/Karachi', country: 'Pakistan' }, // UTC+5
    { name: 'Mumbai', timezone: 'Asia/Kolkata', country: 'India' }, // UTC+5:30
    { name: 'Kathmandu', timezone: 'Asia/Kathmandu', country: 'Nepal' }, // UTC+5:45
    { name: 'Dhaka', timezone: 'Asia/Dhaka', country: 'Bangladesh' }, // UTC+6
    { name: 'Yangon', timezone: 'Asia/Yangon', country: 'Myanmar' }, // UTC+6:30
    { name: 'Bangkok', timezone: 'Asia/Bangkok', country: 'Thailand' }, // UTC+7
    { name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore' }, // UTC+8
    { name: 'Shanghai', timezone: 'Asia/Shanghai', country: 'China' }, // UTC+8
    { name: 'Manila', timezone: 'Asia/Manila', country: 'Philippines' }, // UTC+8
    { name: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' }, // UTC+9
    { name: 'Seoul', timezone: 'Asia/Seoul', country: 'South Korea' } // UTC+9
  ],
  'Europe': [
    { name: 'Reykjavik', timezone: 'Atlantic/Reykjavik', country: 'Iceland' }, // UTC+0
    { name: 'London', timezone: 'Europe/London', country: 'UK' }, // UTC+0/+1
    { name: 'Paris', timezone: 'Europe/Paris', country: 'France' }, // UTC+1/+2
    { name: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany' }, // UTC+1/+2
    { name: 'Rome', timezone: 'Europe/Rome', country: 'Italy' }, // UTC+1/+2
    { name: 'Athens', timezone: 'Europe/Athens', country: 'Greece' }, // UTC+2/+3
    { name: 'Helsinki', timezone: 'Europe/Helsinki', country: 'Finland' }, // UTC+2/+3
    { name: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia' }, // UTC+3
    { name: 'Istanbul', timezone: 'Europe/Istanbul', country: 'Turkey' } // UTC+3
  ],
  'North America': [
    { name: 'Anchorage', timezone: 'America/Anchorage', country: 'USA' }, // UTC-9/-8  
    { name: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'USA' }, // UTC-8/-7
    { name: 'Phoenix', timezone: 'America/Phoenix', country: 'USA' }, // UTC-7 (no DST)
    { name: 'Denver', timezone: 'America/Denver', country: 'USA' }, // UTC-7/-6
    { name: 'Chicago', timezone: 'America/Chicago', country: 'USA' }, // UTC-6/-5
    { name: 'Mexico City', timezone: 'America/Mexico_City', country: 'Mexico' }, // UTC-6/-5
    { name: 'New York', timezone: 'America/New_York', country: 'USA' }, // UTC-5/-4
    { name: 'Toronto', timezone: 'America/Toronto', country: 'Canada' }, // UTC-5/-4
    { name: 'Halifax', timezone: 'America/Halifax', country: 'Canada' } // UTC-4/-3
  ],
  'South America': [
    { name: 'Lima', timezone: 'America/Lima', country: 'Peru' }, // UTC-5
    { name: 'Caracas', timezone: 'America/Caracas', country: 'Venezuela' }, // UTC-4
    { name: 'Santiago', timezone: 'America/Santiago', country: 'Chile' }, // UTC-4/-3
    { name: 'São Paulo', timezone: 'America/Sao_Paulo', country: 'Brazil' }, // UTC-3/-2
    { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina' } // UTC-3
  ],
  'Oceania': [
    { name: 'Samoa', timezone: 'Pacific/Samoa', country: 'American Samoa' }, // UTC-11
    { name: 'Honolulu', timezone: 'Pacific/Honolulu', country: 'USA' }, // UTC-10
    { name: 'Perth', timezone: 'Australia/Perth', country: 'Australia' }, // UTC+8
    { name: 'Darwin', timezone: 'Australia/Darwin', country: 'Australia' }, // UTC+9:30
    { name: 'Adelaide', timezone: 'Australia/Adelaide', country: 'Australia' }, // UTC+9:30/+10:30
    { name: 'Brisbane', timezone: 'Australia/Brisbane', country: 'Australia' }, // UTC+10
    { name: 'Melbourne', timezone: 'Australia/Melbourne', country: 'Australia' }, // UTC+10/+11
    { name: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' }, // UTC+10/+11
    { name: 'Auckland', timezone: 'Pacific/Auckland', country: 'New Zealand' }, // UTC+12/+13
    { name: 'Fiji', timezone: 'Pacific/Fiji', country: 'Fiji' } // UTC+12/+13
  ]
};

// Get user's current timezone
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC'; // Fallback to UTC if unable to detect
  }
}

// Get current time for a timezone
export function getTimeForTimezone(timezone: string): string {
  try {
    return new Date().toLocaleString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return 'Invalid timezone';
  }
}

// Get current date for a timezone
export function getDateForTimezone(timezone: string): string {
  try {
    return new Date().toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid timezone';
  }
}

// Create timer sound
export function createTimerSound(): AudioContext | null {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext as typeof AudioContext)();
    return audioContext;
  } catch {
    console.warn('Audio context not supported');
    return null;
  }
}

// Play timer beep sound
export function playTimerBeep(audioContext: AudioContext | null): void {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}