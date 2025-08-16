import React from 'react'
import { Image, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome5'
import { router } from 'expo-router'
import { type EventItem } from '../data/events'
import { mockApi } from '../services/mockApi'



const getIconNameForType = (type: EventItem['type']): string => {
  switch (type) {
    case 'Workshop':
      return 'construct-outline'
    case 'Seminar':
      return 'school-outline'
    case 'Guest Lecture':
      return 'mic-outline'
    case 'Industrial Visit':
      return 'bus-outline'
    default:
      return 'information-circle-outline'
  }
}

const Badge = ({ label, type }: { label: string; type: EventItem['type'] }) => (
  <View style={styles.badge}>
    <Icon name={getIconNameForType(type)} color="#fff" size={14} />
    <Text style={styles.badgeText}>{label}</Text>
  </View>
)

const EventCard = ({ item }: { item: EventItem }) => (
  <Pressable style={styles.card} onPress={() => {
    router.push({ pathname: '../eventDetail', params: { id: item.id } })
  }}>
    {item.image ? (
      <Image source={item.image} style={styles.cover} resizeMode="cover" />
    ) : (
      <View style={[styles.cover, styles.coverPlaceholder]}>
        <Icon name="image-outline" size={28} color="#94a3b8" />
      </View>
    )}
    <View style={styles.badgeContainer}>
      <Badge label={item.type} type={item.type} />
    </View>
    <View style={styles.cardBody}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubTitle}>
        {item.date} · {item.time}
      </Text>
      <Text style={styles.cardDesc}>{item.description}</Text>
    </View>
  </Pressable>
)

const StudentHome = () => {
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const data = await mockApi.listHomeEvents()
        if (isMounted) setEvents(data)
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
      </View>
      {loading ? (
        <Text style={{ color: '#64748b', marginTop: 8 }}>Loading events...</Text>
      ) : (
        events.map((e) => (
        <EventCard key={e.id} item={e} />
        ))
      )}
    </ScrollView>
  )
}

export default StudentHome

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#f1f5f9',
  },
  header:{
    fontSize: 20,
    marginTop: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 10
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 10
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cover: {
    width: '100%',
    height: 150,
  },
  coverPlaceholder: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#475569',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardSubTitle: {
    color: '#475569',
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '600',
  },
  cardDesc: {
    color: '#334155',
    lineHeight: 20,
  },
})
