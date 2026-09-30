import { getAccessToken } from '../utils/firebase';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  status?: string;
}

export interface CreateEventInput {
  summary: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD or ISO
  endDate?: string;
  isAllDay?: boolean;
}

// Fetch upcoming calendar events
export const fetchCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  // Fetch from 7 days ago to 90 days in the future
  const timeMin = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
      timeMin
    )}&maxResults=50`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch calendar events (${res.status})`);
  }

  const data = await res.json();
  return (data.items || []).filter((e: any) => e.status !== 'cancelled');
};

// Create a new calendar event
export const createCalendarEvent = async (input: CreateEventInput): Promise<CalendarEvent> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  const body: any = {
    summary: input.summary,
    description: input.description,
    location: input.location,
  };

  if (input.isAllDay) {
    body.start = { date: input.startDate };
    body.end = { date: input.endDate || input.startDate };
  } else {
    // If startDate doesn't have time, assume 09:00 AM local
    const startIso = input.startDate.includes('T')
      ? input.startDate
      : `${input.startDate}T09:00:00`;
    const endIso = input.endDate
      ? input.endDate.includes('T')
        ? input.endDate
        : `${input.endDate}T10:00:00`
      : `${input.startDate}T10:00:00`;

    body.start = { dateTime: new Date(startIso).toISOString() };
    body.end = { dateTime: new Date(endIso).toISOString() };
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create calendar event (${res.status})`);
  }

  return await res.json();
};

// Delete an event
export const deleteCalendarEvent = async (eventId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok && res.status !== 204 && res.status !== 410) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete calendar event (${res.status})`);
  }

  return true;
};
