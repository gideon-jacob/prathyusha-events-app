import React, { useMemo, useState } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native'
import { Link, router } from 'expo-router'
import { mockApi } from '../services/mockApi'

type EventMode = 'Online' | 'Offline' | 'Hybrid'
type EventType = 'Workshop' | 'Seminar' | 'Guest Lecture' | 'Industrial Visit' | 'Cultural' | 'Sports'

type Organizer = { parentOrganization: string; eventOrganizer: string }
type Contact = { name: string; role: string; phone: string }

type EventForm = {
  title: string
  description: string
  imageUrl: string
  eligibility: string
  date: string // dd-mm-yyyy
  startTime: string
  endTime: string
  mode: EventMode | ''
  venue: string
  fee: string
  organizers: Organizer[]
  contacts: Contact[]
  registrationLink: string
  type: EventType
}

const EVENT_TYPES: EventType[] = ['Workshop', 'Seminar', 'Guest Lecture', 'Industrial Visit', 'Cultural', 'Sports']
const MODES: EventMode[] = ['Online', 'Offline', 'Hybrid']
const PUBLISHER_HOME_PATH = '/(dashboard-publisher)/publisherHome'

export default function CreateEvent() {
  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    imageUrl: '',
    eligibility: '',
    date: '',
    startTime: '',
    endTime: '',
    mode: '',
    venue: '',
    fee: '',
    organizers: [{ parentOrganization: '', eventOrganizer: '' }],
    contacts: [{ name: '', role: '', phone: '' }],
    registrationLink: '',
    type: 'Workshop',
  })
  const [submitting, setSubmitting] = useState(false)

  const onChange = <K extends keyof EventForm>(key: K, value: EventForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const isValid = useMemo(() => {
    const hasRequiredFields = form.title.trim().length > 0 && form.description.trim().length > 0;
    const hasValidDate = form.date.trim().length > 0;
    const hasValidTimes = form.startTime.trim().length > 0 && form.endTime.trim().length > 0;
    const hasValidContacts = form.contacts.some(contact =>
      contact.name.trim().length > 0 && contact.phone.trim().length > 0
    );
    return hasRequiredFields && hasValidDate && hasValidTimes && hasValidContacts;
  }, [form.title, form.description, form.date, form.startTime, form.endTime, form.contacts])

  function updateOrganizer(index: number, key: keyof Organizer, value: string) {
    setForm((prev) => {
      const next = [...prev.organizers]
      next[index] = { ...next[index], [key]: value }
      return { ...prev, organizers: next }
    })
  }

  function addOrganizer() {
    setForm((prev) => ({ ...prev, organizers: [...prev.organizers, { parentOrganization: '', eventOrganizer: '' }] }))
  }

  function removeOrganizer(index: number) {
    setForm((prev) => ({ ...prev, organizers: prev.organizers.filter((_, i) => i !== index) }))
  }

  function updateContact(index: number, key: keyof Contact, value: string) {
    setForm((prev) => {
      const next = [...prev.contacts]
      next[index] = { ...next[index], [key]: value }
      return { ...prev, contacts: next }
    })
  }

  function addContact() {
    setForm((prev) => ({ ...prev, contacts: [...prev.contacts, { name: '', role: '', phone: '' }] }))
  }

  function removeContact(index: number) {
    setForm((prev) => ({ ...prev, contacts: prev.contacts.filter((_, i) => i !== index) }))
  }

  async function onSubmit() {
    if (!isValid) {
      Alert.alert('Missing fields', 'Please fill the required fields (Title, Description)')
      return
    }
    setSubmitting(true)
    try {
      const payload = { ...form }
      await mockApi.createEvent(payload)
      Alert.alert('Success', 'Event created (mock)')
      router.replace(PUBLISHER_HOME_PATH)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.headerRow, { marginTop: 20 }]}>
        <Text style={styles.title}>Create Event</Text>
        <Link href={PUBLISHER_HOME_PATH} style={styles.linkBack}>Back</Link>
      </View>

      {/* Event Title */}
      <Label text="Event Title" />
      <TextInput placeholder="Enter event title" style={styles.input} value={form.title} onChangeText={(t) => onChange('title', t)} />

      {/* Event Description */}
      <Label text="Event Description" />
      <TextInput
        placeholder="Enter event description"
        style={[styles.input, styles.textarea]}
        multiline
        value={form.description}
        onChangeText={(t) => onChange('description', t)}
      />

      {/* Event Thumbnail (URL placeholder) */}
      <Label text="Event Thumbnail" />
      <View style={styles.uploadCard}>
        <Text style={styles.uploadTitle}>Upload a file</Text>
        <Text style={styles.uploadSub}>PNG, JPG, GIF up to 10MB</Text>
      </View>
      <TextInput placeholder="Or paste image URL" style={styles.input} value={form.imageUrl} onChangeText={(t) => onChange('imageUrl', t)} />

      {/* Eligibility */}
      <Label text="Eligibility" />
      <TextInput placeholder="e.g., Open to all college students" style={styles.input} value={form.eligibility} onChangeText={(t) => onChange('eligibility', t)} />

      {/* Date */}
      <Label text="Date" />
      <TextInput placeholder="dd-mm-yyyy" style={styles.input} value={form.date} onChangeText={(t) => onChange('date', t)} />

      {/* Times */}
      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Label text="Start Time" />
          <TextInput placeholder="--:-- --" style={styles.input} value={form.startTime} onChangeText={(t) => onChange('startTime', t)} />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Label text="End Time" />
          <TextInput placeholder="--:-- --" style={styles.input} value={form.endTime} onChangeText={(t) => onChange('endTime', t)} />
        </View>
      </View>

      {/* Mode */}
      <Label text="Mode" />
      <View style={styles.pillRow}>
        {MODES.map((m) => (
          <Pressable key={m} style={[styles.pill, form.mode === m && styles.pillActive]} onPress={() => onChange('mode', m)}>
            <Text style={[styles.pillText, form.mode === m && styles.pillTextActive]}>{m}</Text>
          </Pressable>
        ))}
      </View>

      {/* Optional Event Type */}
      <Label text="Event Type" />
      <View style={{ height: 4 }} />
      <View style={styles.typeRow}>
        {EVENT_TYPES.map((t) => (
          <Pressable key={t} style={[styles.typePill, form.type === t && styles.typePillActive]} onPress={() => onChange('type', t)}>
            <Text style={[styles.typePillText, form.type === t && styles.typePillTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {/* Venue */}
      <Label text="Venue" />
      <TextInput placeholder="Enter venue" style={styles.input} value={form.venue} onChangeText={(t) => onChange('venue', t)} />

      {/* Entry Fee */}
      <Label text="Entry Fee (in ₹)" />
      <TextInput placeholder="Enter amount or 0 for free entry" keyboardType="numeric" style={styles.input} value={form.fee} onChangeText={(t) => onChange('fee', t)} />

      {/* Organizers */}
      <Label text="Organizers" />
      {form.organizers.map((org, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{`Organizer ${idx + 1}`}</Text>
            {form.organizers.length > 1 && (
              <Pressable onPress={() => removeOrganizer(idx)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            )}
          </View>
          <Label text="Parent Organization" />
          <TextInput
            placeholder="e.g., College Name"
            style={styles.input}
            value={org.parentOrganization}
            onChangeText={(t) => updateOrganizer(idx, 'parentOrganization', t)}
          />
          <Label text="Event Organizer" />
          <TextInput
            placeholder="e.g., Student Council"
            style={styles.input}
            value={org.eventOrganizer}
            onChangeText={(t) => updateOrganizer(idx, 'eventOrganizer', t)}
          />
        </View>
      ))}
      <Pressable style={styles.addBtn} onPress={addOrganizer}>
        <Text style={styles.addBtnText}>+ Add Organizer</Text>
      </Pressable>

      {/* Points of Contact */}
      <Label text="Points of Contact" />
      {form.contacts.map((c, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{`Contact ${idx + 1}`}</Text>
            {form.contacts.length > 1 && (
              <Pressable onPress={() => removeContact(idx)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            )}
          </View>
          <Label text="Name" />
          <TextInput placeholder="Enter name" style={styles.input} value={c.name} onChangeText={(t) => updateContact(idx, 'name', t)} />
          <Label text="Role" />
          <TextInput placeholder="e.g., Event Coordinator" style={styles.input} value={c.role} onChangeText={(t) => updateContact(idx, 'role', t)} />
          <Label text="Contact Number" />
          <TextInput placeholder="Enter contact number" keyboardType="phone-pad" style={styles.input} value={c.phone} onChangeText={(t) => updateContact(idx, 'phone', t)} />
        </View>
      ))}
      <Pressable style={styles.addBtn} onPress={addContact}>
        <Text style={styles.addBtnText}>+ Add Contact</Text>
      </Pressable>

      {/* Registration Link */}
      <Label text="Registration Link" />
      <TextInput placeholder="Enter registration link" style={styles.input} value={form.registrationLink} onChangeText={(t) => onChange('registrationLink', t)} />

      {/* Publish CTA */}
      <Pressable disabled={submitting || !isValid} onPress={onSubmit} style={[styles.publishBtn, (submitting || !isValid) && { opacity: 0.6 }]}>
        <Text style={styles.publishText}>Publish Event</Text>
      </Pressable>
    </ScrollView>
  )
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '900', color: '#991b1b' },
  linkBack: { color: '#0ea5e9', fontWeight: '700' },

  label: { marginTop: 12, marginBottom: 6, color: '#334155', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  textarea: { height: 120, textAlignVertical: 'top' },

  uploadCard: {
    height: 140,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: { color: '#9e0202', fontWeight: '800' },
  uploadSub: { color: '#64748b', marginTop: 6 },

  row2: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#e2e8f0' },
  pillActive: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
  pillText: { color: '#334155' },
  pillTextActive: { color: '#991b1b', fontWeight: '800' },

  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontWeight: '900', color: '#991b1b' },
  removeText: { color: '#9b1c1c', fontWeight: '800' },

  addBtn: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addBtnText: { color: '#0f172a', fontWeight: '800' },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  typePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#e2e8f0' },
  typePillActive: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
  typePillText: { color: '#334155' },
  typePillTextActive: { color: '#991b1b', fontWeight: '800' },

  publishBtn: {
    marginTop: 16,
    backgroundColor: '#9e0202',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  publishText: { color: '#fff', fontWeight: '900' },
})




