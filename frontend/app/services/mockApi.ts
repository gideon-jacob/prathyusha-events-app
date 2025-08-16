import { homeEvents, searchEvents, getEventById, type EventItem, type SearchEvent } from '../data/events'

// Simple in-memory mock API layer for future backend integration
// Replace these implementations with real HTTP calls when backend is ready.

export type PublisherEvent = {
  id: string
  title: string
  date?: string
  type: EventItem['type']
  imageUrl?: string
  status: 'upcoming' | 'ongoing' | 'past'
  description?: string
  venue?: string
  fee?: string
}

export type UserProfile = {
  name: string
  role: string
  department: string
  email?: string
}

export type UpsertEventPayload = {
  title: string
  description: string
  imageUrl?: string
  eligibility?: string
  date?: string
  startTime?: string
  endTime?: string
  mode?: 'Online' | 'Offline' | 'Hybrid' | ''
  venue?: string
  fee?: string
  organizers?: { parentOrganization: string; eventOrganizer: string }[]
  contacts?: { name: string; role: string; phone: string }[]
  registrationLink?: string
  type: EventItem['type']
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function genId(prefix = 'e'): string {
  const rnd = Math.random().toString(36).slice(2, 8)
  return `${prefix}${Date.now().toString(36)}${rnd}`
}

// Create mutable copies at module level
let mutableSearchEvents = [...searchEvents]
let mutableHomeEvents = [...homeEvents]

export const mockApi = {
  async fetchUserProfile(): Promise<UserProfile> {
    await delay(300)
    return {
      name: 'Publisher',
      role: 'Publisher',
      department: 'Department of CSE',
      email: 'prathyusha@college.edu',
    }
  },

  /*
  async fetchUserProfile() {
  const { data } = await api.get('/publisher/profile');
  return data;
  } */

  // Helper to derive status based on event dates/times
  // Rules:
  // - past: event end < now
  // - upcoming: event start > now
  // - ongoing: start <= now <= end
  // - If only a single date is provided (no explicit end date), treat that date as the full day window
  //   and if a start time is provided without an end time, the window is [start time .. end of day]
  deriveStatusFromDates(e: (typeof searchEvents)[number], now: Date = new Date()): 'upcoming' | 'ongoing' | 'past' {
    const dateString = e.date?.trim()
    const timeString = e.time?.trim()

    // Optional end fields (not in type but may be provided later)
    const endDateString = (e as any).endDate as string | undefined
    const endTimeString = (e as any).endTime as string | undefined

    const parseDateTime = (d?: string, t?: string): Date | null => {
      if (!d) return null
      const composed = t ? `${d} ${t}` : d
      const parsed = new Date(composed)
      if (!Number.isNaN(parsed.getTime())) return parsed
      return null
    }

    const startDateTime = parseDateTime(dateString, timeString) || (dateString ? parseDateTime(dateString) : null)

    let endDateTime: Date | null = null
    if (endDateString) {
      // Multi-day: use provided end date/time; default to end-of-day if no time
      endDateTime = parseDateTime(endDateString, endTimeString) || parseDateTime(endDateString)
      if (endDateTime) endDateTime.setHours(23, 59, 59, 999)
    } else if (endTimeString) {
      // Same-day with explicit end time
      endDateTime = parseDateTime(dateString, endTimeString)
    } else if (dateString) {
      // Single date provided (with or without start time): treat as full day window if no end provided
      endDateTime = parseDateTime(dateString) || null
      if (endDateTime) endDateTime.setHours(23, 59, 59, 999)
    }

    // If we somehow failed to parse start but have date, assume start-of-day
    let normalizedStart = startDateTime
    if (!normalizedStart && dateString) {
      const d = parseDateTime(dateString)
      if (d) {
        d.setHours(0, 0, 0, 0)
        normalizedStart = d
      }
    }

    // If nothing parsable, default to upcoming
    if (!normalizedStart && !endDateTime) {
      return 'upcoming'
    }

    // If we have start but no end, and there is a date, treat end as end-of-day
    if (normalizedStart && !endDateTime && dateString) {
      const d = new Date(normalizedStart)
      d.setHours(23, 59, 59, 999)
      endDateTime = d
    }

    // Final comparisons
    const start = normalizedStart ?? endDateTime!
    const end = endDateTime ?? normalizedStart!

    if (end.getTime() < now.getTime()) return 'past'
    if (start.getTime() > now.getTime()) return 'upcoming'
    return 'ongoing'
  },

  async fetchPublisherEvents(status: 'upcoming' | 'ongoing' | 'past'): Promise<PublisherEvent[]> {
    await delay(250)
    // Derive a small set from searchEvents for demo purposes with pseudo status
    const derived: PublisherEvent[] = mutableSearchEvents.slice(0, 8).map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      type: e.category,
      imageUrl: e.image?.uri,
      status: this.deriveStatusFromDates(e),
      description: e.description,
      venue: e.venue,
      fee: e.fee,
    }))

    return derived.filter((ev) => ev.status === status)
  },

  /*
  async fetchPublisherEvents(status: 'upcoming' | 'ongoing' | 'past') {
  const { data } = await api.get('/publisher/events', { params: { status } });
  return data;
  } */

async deleteEvent(eventId: string): Promise<boolean> {
  await delay(250)
  const idxSearch = mutableSearchEvents.findIndex((e) => e.id === eventId)
  if (idxSearch >= 0) mutableSearchEvents.splice(idxSearch, 1)

  const normalized = eventId.startsWith('h') ? eventId.slice(1) : eventId
  const idxHome = mutableHomeEvents.findIndex((e) => e.id === normalized)
  if (idxHome >= 0) mutableHomeEvents.splice(idxHome, 1)
  return true
},
  /*
  async deleteEvent(eventId: string): Promise<boolean> {
  const { status } = await api.delete(`/events/${eventId}`);
  return status >= 200 && status < 300;
  } */

  async listSearchEvents(): Promise<SearchEvent[]> {
    await delay(200)
    return mutableSearchEvents
  },

  async getEventById(id: string): Promise<(EventItem | SearchEvent) | null> {
    await delay(150)
    return getEventById(id)
  },

  async createEvent(payload: UpsertEventPayload): Promise<{ id: string }> {
    await delay(300)
    const id = genId('e')
    const newSearchEvent: SearchEvent = {
      id,
      title: payload.title,
      description: payload.description,
      category: payload.type,
      department: 'CSE',
      image: payload.imageUrl ? { uri: payload.imageUrl } : undefined,
      date: payload.date,
      time: payload.startTime,
      venue: payload.venue,
      eligibility: payload.eligibility,
      fee: payload.fee,
      registrationLink: payload.registrationLink,
      organizers: (payload.organizers || []).map((o) => ({ name: o.eventOrganizer, subtitle: o.parentOrganization, icon: 'people' })),
      contacts: (payload.contacts || []).map((c) => ({ ...c, icon: 'person' })),
    }
    mutableSearchEvents.unshift(newSearchEvent)
    return { id }
  },

  /*{Example for using API}

  async listSearchEvents(): Promise<SearchEvent[]> {
  const { data } = await api.get('/events/search');
  async updateEvent(id: string, payload: UpsertEventPayload): Promise<boolean> {
    await delay(350)
    const sIdx = searchEvents.findIndex((e) => e.id === id)
    if (sIdx >= 0) {
      const curr = searchEvents[sIdx]
      searchEvents[sIdx] = {
        ...curr,
        title: payload.title ?? curr.title,
        description: payload.description ?? curr.description,
        category: payload.type ?? curr.category,
        image: payload.imageUrl ? { uri: payload.imageUrl } : curr.image,
        date: payload.date ?? curr.date,
        time: payload.startTime ?? curr.time,
        venue: payload.venue ?? curr.venue,
        eligibility: payload.eligibility ?? curr.eligibility,
        fee: payload.fee ?? curr.fee,
        registrationLink: payload.registrationLink ?? curr.registrationLink,
        organizers: payload.organizers
          ? payload.organizers.map((o) => ({ name: o.eventOrganizer, subtitle: o.parentOrganization, icon: 'people' }))
          : curr.organizers,
        contacts: payload.contacts
          ? payload.contacts.map((c) => ({ ...c, icon: 'person' }))
          : curr.contacts,
      }
    }

    const normalized = id.startsWith('h') ? id.slice(1) : id
    const hIdx = homeEvents.findIndex((e) => e.id === normalized)
    if (hIdx >= 0) {
      const curr = homeEvents[hIdx]
      homeEvents[hIdx] = {
        ...curr,
        title: payload.title ?? curr.title,
        description: payload.description ?? curr.description,
        type: payload.type ?? curr.type,
        image: payload.imageUrl ? { uri: payload.imageUrl } : curr.image,
        date: payload.date ?? curr.date,
        time: payload.startTime ?? curr.time,
        venue: payload.venue ?? curr.venue,
        eligibility: payload.eligibility ?? curr.eligibility,
        fee: payload.fee ?? curr.fee,
        registrationLink: payload.registrationLink ?? curr.registrationLink,
        organizers: payload.organizers
          ? payload.organizers.map((o) => ({ name: o.eventOrganizer, subtitle: o.parentOrganization, icon: 'people' }))
          : curr.organizers,
        creator: curr.creator ?? { name: 'Publisher User', subtitle: 'CSE Department', icon: 'person' },
        contacts: payload.contacts
          ? payload.contacts.map((c) => ({ ...c, icon: 'person' }))
          : curr.contacts,
      }
    }

    return true
  },    title: payload.title,
    description: payload.description,
    type: payload.type,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    mode: payload.mode,
    venue: payload.venue,
    fee: payload.fee,
    organizers: payload.organizers,
    contacts: payload.contacts,
    registrationLink: payload.registrationLink,
    imageUrl: payload.imageUrl,
  };
  const { data } = await api.post('/events', body);
  return { id: data.id };
  } */

  async updateEvent(id: string, payload: UpsertEventPayload): Promise<boolean> {
    await delay(350)
    const sIdx = mutableSearchEvents.findIndex((e) => e.id === id)
    if (sIdx >= 0) {
      const curr = mutableSearchEvents[sIdx]
      mutableSearchEvents[sIdx] = {
        ...curr,
        title: payload.title || curr.title,
        description: payload.description || curr.description,
        category: payload.type || curr.category,
        image: payload.imageUrl ? { uri: payload.imageUrl } : curr.image,
        date: payload.date ?? curr.date,
        time: payload.startTime ?? curr.time,
        venue: payload.venue ?? curr.venue,
        eligibility: payload.eligibility ?? curr.eligibility,
        fee: payload.fee ?? curr.fee,
        registrationLink: payload.registrationLink ?? curr.registrationLink,
        organizers: payload.organizers
          ? payload.organizers.map((o) => ({ name: o.eventOrganizer, subtitle: o.parentOrganization, icon: 'people' }))
          : curr.organizers,
        contacts: payload.contacts
          ? payload.contacts.map((c) => ({ ...c, icon: 'person' }))
          : curr.contacts,
      }
    }

    const normalized = id.startsWith('h') ? id.slice(1) : id
    const hIdx = mutableHomeEvents.findIndex((e) => e.id === normalized)
    if (hIdx >= 0) {
      const curr = mutableHomeEvents[hIdx]
      mutableHomeEvents[hIdx] = {
        ...curr,
        title: payload.title || curr.title,
        description: payload.description || curr.description,
        type: payload.type || curr.type,
        image: payload.imageUrl ? { uri: payload.imageUrl } : curr.image,
        date: payload.date ?? curr.date,
        time: payload.startTime ?? curr.time,
        venue: payload.venue ?? curr.venue,
        eligibility: payload.eligibility ?? curr.eligibility,
        fee: payload.fee ?? curr.fee,
        registrationLink: payload.registrationLink ?? curr.registrationLink,
        organizers: payload.organizers
          ? payload.organizers.map((o) => ({ name: o.eventOrganizer, subtitle: o.parentOrganization, icon: 'people' }))
          : curr.organizers,
        creator: curr.creator ?? { name: 'Publisher User', subtitle: 'CSE Department', icon: 'person' },
        contacts: payload.contacts
          ? payload.contacts.map((c) => ({ ...c, icon: 'person' }))
          : curr.contacts,
      }
    }

    return true
  },

  /*
  async updateEvent(id: string, payload: UpsertEventPayload): Promise<boolean> {
  const { status } = await api.put(`/events/${id}`, payload);
  return status >= 200 && status < 300;
  } */
}

export default mockApi


