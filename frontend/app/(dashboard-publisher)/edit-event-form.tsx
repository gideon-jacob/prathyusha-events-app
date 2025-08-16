import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native'
import { Link, router, useLocalSearchParams } from 'expo-router'
import type { EventItem } from '../data/events'
import { mockApi } from '../services/mockApi'

type EventMode = 'Online' | 'Offline' | 'Hybrid'
type EventType = EventItem['type']

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

export default function EditEventForm() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const [loading, setLoading] = useState(true)
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
  const [errors, setErrors] = useState<{ date: string; fee: string; contactPhones: string[] }>({
    date: '',
    fee: '',
    contactPhones: [''],
  })

  // --- Validators ---
  function sanitizeAndValidateDate(input: string): { sanitized: string; error: string } {
    const digits = (input || '').replace(/\D/g, '').slice(0, 8)
    let sanitized = digits
    if (digits.length > 4) {
      sanitized = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
    } else if (digits.length > 2) {
      sanitized = `${digits.slice(0, 2)}-${digits.slice(2)}`
    }

    if (digits.length === 0) return { sanitized, error: '' }
    if (digits.length < 8) return { sanitized, error: 'Enter a full date in dd-mm-yyyy' }

    const day = parseInt(digits.slice(0, 2), 10)
    const month = parseInt(digits.slice(2, 4), 10)
    const year = parseInt(digits.slice(4), 10)
    if (month < 1 || month > 12) return { sanitized, error: 'Month must be between 01 and 12' }
    if (year < 1900 || year > 2100) return { sanitized, error: 'Year must be between 1900 and 2100' }
    const d = new Date(year, month - 1, day)
    const isRealDate = d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
    return { sanitized, error: isRealDate ? '' : 'Enter a valid calendar date' }
  }

  function sanitizeAndValidatePhone(input: string): { sanitized: string; error: string } {
    const hasPlus = (input || '').trim().startsWith('+')
    const digits = (input || '').replace(/\D/g, '').slice(0, 15)
    const sanitized = `${hasPlus ? '+' : ''}${digits}`
    if (digits.length === 0) return { sanitized, error: '' }
    if (digits.length < 10) return { sanitized, error: 'Enter at least 10 digits' }
    return { sanitized, error: '' }
  }

  function sanitizeAndValidateNumber(input: string): { sanitized: string; error: string } {
    let sanitized = (input || '').replace(/[^0-9.]/g, '')
    const firstDot = sanitized.indexOf('.')
    if (firstDot !== -1) {
      sanitized = sanitized.slice(0, firstDot + 1) + sanitized.slice(firstDot + 1).replace(/\./g, '')
    }
    if (sanitized === '.') sanitized = '0.'
    if (sanitized === '') return { sanitized, error: '' }
    const valid = /^\d+(\.\d+)?$/.test(sanitized)
    return { sanitized, error: valid ? '' : 'Enter a valid number' }
  }

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return
        const ev = await mockApi.getEventById(String(id))
        if (ev) {
          setForm((prev) => ({
            ...prev,
            title: ev.title || prev.title,
            description: ev.description || prev.description,
            imageUrl: (ev as any)?.image?.uri || prev.imageUrl,
            eligibility: (ev as any)?.eligibility || prev.eligibility,
            date: (ev as any)?.date || prev.date,
            startTime: (ev as any)?.time || prev.startTime,
            endTime: '',
            mode: '',
            venue: (ev as any)?.venue || prev.venue,
            fee: (ev as any)?.fee || prev.fee,
            organizers:
              (ev as any)?.organizers?.map((o: any) => ({
                parentOrganization: o.subtitle || '',
                eventOrganizer: o.name || '',
              })) || prev.organizers,
            contacts:
              (ev as any)?.contacts?.map((c: any) => ({
                name: c.name || '',
                role: c.role || '',
                phone: c.phone || '',
              })) || prev.contacts,
            registrationLink: (ev as any)?.registrationLink || prev.registrationLink,
            type: ((ev as any)?.type || (ev as any)?.category || prev.type) as EventType,
          }))
          const contactsLen = (ev as any)?.contacts?.length || 1
          setErrors((prev) => ({ ...prev, contactPhones: Array.from({ length: contactsLen }, () => '') }))
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load event data. Please try again.')
        console.error('Failed to load event:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const onChange = <K extends keyof EventForm>(key: K, value: EventForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const hasRequired = useMemo(() => form.title.trim().length > 0 && form.description.trim().length > 0, [form.title, form.description])
  const hasValidationErrors = useMemo(
    () => Boolean(errors.date || errors.fee || (errors.contactPhones && errors.contactPhones.some((e) => !!e))),
    [errors]
  )
  const canSubmit = useMemo(() => hasRequired && !hasValidationErrors, [hasRequired, hasValidationErrors])

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
    setErrors((prev) => ({ ...prev, contactPhones: [...(prev.contactPhones || []), ''] }))
  }

  function removeContact(index: number) {
    setForm((prev) => ({ ...prev, contacts: prev.contacts.filter((_, i) => i !== index) }))
    setErrors((prev) => ({
      ...prev,
      contactPhones: (prev.contactPhones || []).filter((_, i) => i !== index),
    }))
  }

  async function onSubmit() {
    if (!hasRequired) {
      Alert.alert('Missing fields', 'Please fill the required fields (Title, Description)')
      return
    }
    if (hasValidationErrors) {
      Alert.alert('Invalid fields', 'Please fix the highlighted fields before submitting.')
      return
    }
    setSubmitting(true)
    try {
      const payload = { ...form }
      await mockApi.updateEvent(String(id), payload as any)
      Alert.alert('Success', 'Event updated (mock)')
      router.replace('/(dashboard-publisher)/publisherHome')
    } catch (error) {
      Alert.alert('Error', 'Failed to update event. Please try again.')
      console.error('Failed to update event:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Event</Text>
        <Text style={{ color: '#64748b' }}>Loading...</Text>
      </ScrollView>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { marginTop: 20}]}>Edit Event</Text>
        <Link href="/(dashboard-publisher)/publisherHome" style={[styles.linkBack, { marginTop: 20}]}>Back</Link>
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
      <TextInput
        placeholder="dd-mm-yyyy"
        style={styles.input}
        value={form.date}
        onChangeText={(t) => {
          const { sanitized, error } = sanitizeAndValidateDate(t)
          onChange('date', sanitized)
          setErrors((prev) => ({ ...prev, date: error }))
        }}
      />
      {!!errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

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

      {/* Event Type */}
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
      <TextInput
        placeholder="Enter amount or 0 for free entry"
        keyboardType="numeric"
        style={styles.input}
        value={form.fee}
        onChangeText={(t) => {
          const { sanitized, error } = sanitizeAndValidateNumber(t)
          onChange('fee', sanitized)
          setErrors((prev) => ({ ...prev, fee: error }))
        }}
      />
      {!!errors.fee && <Text style={styles.errorText}>{errors.fee}</Text>}

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
          <TextInput
            placeholder="Enter contact number"
            keyboardType="phone-pad"
            style={styles.input}
            value={c.phone}
            onChangeText={(t) => {
              const { sanitized, error } = sanitizeAndValidatePhone(t)
              updateContact(idx, 'phone', sanitized)
              setErrors((prev) => {
                const next = [...(prev.contactPhones || [])]
                next[idx] = error
                return { ...prev, contactPhones: next }
              })
            }}
          />
          {!!(errors.contactPhones && errors.contactPhones[idx]) && (
            <Text style={styles.errorText}>{errors.contactPhones[idx]}</Text>
          )}
        </View>
      ))}
      <Pressable style={styles.addBtn} onPress={addContact}>
        <Text style={styles.addBtnText}>+ Add Contact</Text>
      </Pressable>

      {/* Registration Link */}
      <Label text="Registration Link" />
      <TextInput placeholder="Enter registration link" style={styles.input} value={form.registrationLink} onChangeText={(t) => onChange('registrationLink', t)} />

      {/* Save CTA */}
      <Pressable disabled={submitting || !canSubmit} onPress={onSubmit} style={[styles.publishBtn, (submitting || !canSubmit) && { opacity: 0.6 }]}>
        <Text style={styles.publishText}>Save Changes</Text>
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
  errorText: { color: '#b91c1c', marginTop: 6 },
})


