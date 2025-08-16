import { Pressable, StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useAuth } from '../contexts/AuthContext'
import { router } from 'expo-router'

import { mockApi, type PublisherEvent, type UserProfile as PublisherUserProfile } from '../services/mockApi'

type EventType = 'Workshop' | 'Seminar' | 'Guest Lecture' | 'Industrial Visit' | 'Cultural' | 'Sports'

const getTypeColor = (type: EventType) => {
  switch (type) {
    case 'Workshop': return '#3b82f6'
    case 'Industrial Visit': return '#10b981'
    case 'Guest Lecture': return '#8b5cf6'
    case 'Seminar': return '#f59e0b'
    case 'Cultural': return '#ef4444'
    case 'Sports': return '#06b6d4'
    default: return '#6b7280'
  }
}

const PublisherProfile = () => {
  const { signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [userProfile, setUserProfile] = useState<PublisherUserProfile | null>(null)
  const [events, setEvents] = useState<PublisherEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await mockApi.fetchUserProfile()
      setUserProfile(profile)
    } catch (err) {
      setError('Failed to load profile')
      console.error('Profile fetch error:', err)
    }
  }, [])

  const fetchEvents = useCallback(async (status: 'upcoming' | 'ongoing' | 'past') => {
    try {
      setLoading(true)
      const eventsData = await mockApi.fetchPublisherEvents(status)
      setEvents(eventsData)
      setError(null)
    } catch (err) {
      setError('Failed to load events')
      console.error('Events fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleTabChange = useCallback((tab: 'upcoming' | 'past') => {
    setActiveTab(tab)
    const status = tab === 'upcoming' ? 'upcoming' : 'past'
    fetchEvents(status)
  }, [fetchEvents])

  const handleDeleteEvent = useCallback(async (eventId: string, eventTitle: string) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${eventTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await mockApi.deleteEvent(eventId)
              if (success) {
                setEvents(prev => prev.filter(event => event.id !== eventId))
                Alert.alert('Success', 'Event deleted successfully')
              } else {
                Alert.alert('Error', 'Failed to delete event')
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete event')
              console.error('Delete event error:', err)
            }
          }
        }
      ]
    )
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      fetchUserProfile(),
      fetchEvents(activeTab === 'upcoming' ? 'upcoming' : 'past')
    ])
    setRefreshing(false)
  }, [fetchUserProfile, fetchEvents, activeTab])

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchUserProfile(),
        fetchEvents('upcoming')
      ])
    }
    initializeData()
  }, [fetchUserProfile, fetchEvents])

  const handleLogout = async () => {
    try {
      await signOut()
      router.replace('/login')
    } catch (err) {
      Alert.alert('Error', 'Failed to logout')
      console.error('Logout error:', err)
    }
  }

  if (loading && !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9e0202" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userProfile?.name || 'Loading...'}</Text>
          <Text style={styles.userRole}>{userProfile?.role || 'Publisher'}</Text>
          <Text style={styles.userDept}>{userProfile?.department || 'Department'}</Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => handleTabChange('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming/Ongoing Events
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => handleTabChange('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past Events
          </Text>
        </Pressable>
      </View>

      {/* Event List */}
      <ScrollView 
        style={styles.eventList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => fetchEvents(activeTab === 'upcoming' ? 'upcoming' : 'past')}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9e0202" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No {activeTab} events found</Text>
          </View>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventImage}>
                {event.imageUrl ? (
                  <Image source={{ uri: event.imageUrl }} style={styles.eventImageInner} resizeMode="cover" />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name="image-outline" size={24} color="#94a3b8" />
                  </View>
                )}
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
                {event.venue && <Text style={styles.eventVenue}>{event.venue}</Text>}
              </View>
              <View style={styles.eventActions}>
                <View style={[styles.eventType, { backgroundColor: getTypeColor(event.type) }]}>
                  <Text style={styles.eventTypeText}>{event.type}</Text>
                </View>
                <Pressable 
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteEvent(event.id, event.title)}
                >
                  <Icon name="trash-outline" size={16} color="#ef4444" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default PublisherProfile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: '#9e0202',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  userDept: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutBtn: {
    backgroundColor: '#9e0202',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#9e0202',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#9e0202',
    fontWeight: '700',
  },
  eventList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  eventImageInner: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    flex: 1,
    marginLeft: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  eventVenue: {
    fontSize: 12,
    color: '#94a3b8',
  },
  eventActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  eventType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eventTypeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 4,
  },
})


