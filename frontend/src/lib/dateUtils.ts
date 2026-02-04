/**
 * Date/time utilities: store in UTC in the backend, display in user's local timezone.
 * - All API dates/times are in UTC (ISO strings or date YYYY-MM-DD + time HH:mm in UTC).
 * - Use these helpers to convert for display (UTC → local) and for submit (local → UTC).
 */

/** Build ISO UTC string from date (YYYY-MM-DD) and time (HH:mm) both in UTC. */
export function utcDateAndTimeToIso(date: string, time?: string): string {
  if (!time) return `${date}T00:00:00.000Z`;
  return `${date}T${time}:00.000Z`;
}


/** Format UTC date+time for display in user's local timezone (date only). Handles full ISO or YYYY-MM-DD. */
export function formatUtcToLocalDate(isoOrDate: string, timeUtc?: string): string {
  const iso = timeUtc && isoOrDate.length === 10
    ? utcDateAndTimeToIso(isoOrDate, timeUtc)
    : isoOrDate.length === 10
      ? isoOrDate + 'T00:00:00.000Z'
      : isoOrDate;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format UTC date+time for display in user's local timezone (time only, 2-digit). */
export function formatUtcToLocalTime(isoOrDate: string, timeUtc?: string): string {
  const iso = timeUtc && isoOrDate.length === 10
    ? utcDateAndTimeToIso(isoOrDate, timeUtc)
    : isoOrDate.length === 10
      ? isoOrDate + 'T00:00:00.000Z'
      : isoOrDate;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Format UTC for display as date + time in user's local timezone. */
export function formatUtcToLocalDateTime(isoOrDate: string, timeUtc?: string): string {
  const iso = timeUtc && isoOrDate.length === 10
    ? utcDateAndTimeToIso(isoOrDate, timeUtc)
    : isoOrDate.length === 10
      ? isoOrDate + 'T00:00:00.000Z'
      : isoOrDate;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Get local YYYY-MM-DD for a date input, from UTC date (YYYY-MM-DD) and optional UTC time. */
export function utcToLocalDateInput(utcDate: string, utcTime?: string): string {
  const iso = utcTime && utcDate.length === 10
    ? utcDateAndTimeToIso(utcDate, utcTime)
    : utcDate.length === 10
      ? utcDate + 'T00:00:00.000Z'
      : utcDate;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Get local HH:mm for a time input, from UTC date + time. */
export function utcToLocalTimeInput(utcDate: string, utcTime: string): string {
  const iso = utcDateAndTimeToIso(utcDate, utcTime);
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

/**
 * Convert user's local date (YYYY-MM-DD) and time (HH:mm) to UTC date and time for API.
 * Returns { date: 'YYYY-MM-DD', startTime: 'HH:mm', endTime?: 'HH:mm' } in UTC.
 */
export function localToUtcDateAndTime(
  localDateStr: string,
  localStartTime: string,
  localEndTime?: string
): { date: string; startTime: string; endTime?: string } {
  if (!localDateStr) return { date: '', startTime: '', endTime: localEndTime };
  const [y, m, day] = localDateStr.split('-').map(Number);
  const [sh, sm] = (localStartTime || '00:00').split(':').map(Number);
  const startLocal = new Date(y, m - 1, day, sh, sm, 0, 0);
  const startUtc = new Date(startLocal.toISOString());
  const dateUtc =
    startUtc.getUTCFullYear() +
    '-' +
    String(startUtc.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(startUtc.getUTCDate()).padStart(2, '0');
  const startTimeUtc =
    String(startUtc.getUTCHours()).padStart(2, '0') +
    ':' +
    String(startUtc.getUTCMinutes()).padStart(2, '0');

  let endTimeUtc: string | undefined;
  if (localEndTime) {
    const [eh, em] = localEndTime.split(':').map(Number);
    const endLocal = new Date(y, m - 1, day, eh, em, 0, 0);
    const endUtc = new Date(endLocal.toISOString());
    endTimeUtc =
      String(endUtc.getUTCHours()).padStart(2, '0') +
      ':' +
      String(endUtc.getUTCMinutes()).padStart(2, '0');
  }

  return { date: dateUtc, startTime: startTimeUtc, endTime: endTimeUtc };
}

/**
 * Convert user's local date (YYYY-MM-DD) to UTC ISO string for date-only fields (e.g. mission startDate).
 * Uses local midnight so "Jan 15" in PST becomes 2026-01-15T08:00:00.000Z.
 */
export function localDateToUtcIso(localDateStr: string): string {
  if (!localDateStr) return '';
  const [y, m, day] = localDateStr.split('-').map(Number);
  const localMidnight = new Date(y, m - 1, day, 0, 0, 0, 0);
  return localMidnight.toISOString();
}

/**
 * Parse UTC ISO string (or YYYY-MM-DD) to local YYYY-MM-DD for date-only input fields.
 */
export function utcIsoToLocalDateInput(isoOrDate: string): string {
  if (!isoOrDate) return '';
  const iso = isoOrDate.length === 10 ? isoOrDate + 'T00:00:00.000Z' : isoOrDate;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return isoOrDate.length === 10 ? isoOrDate : '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dDay = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dDay}`;
}
