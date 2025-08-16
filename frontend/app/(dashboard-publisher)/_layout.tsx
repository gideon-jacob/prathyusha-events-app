import React from 'react'
import { Redirect, Tabs, router } from 'expo-router'
import Icon from 'react-native-vector-icons/Ionicons'
import { useAuth } from '../contexts/AuthContext'

const PublisherDashBoardLayout = () => {
  const { state } = useAuth()

  if (state.status === 'loading') return null
  if (state.status === 'unauthenticated') return <Redirect href="/login" />
  if (state.status === 'authenticated' && state.user.role !== 'publisher') {
    return <Redirect href="/studentHome" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#9e0202',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { height: 64, paddingBottom: 6, paddingTop: 6 },
        tabBarLabelStyle: { marginBottom: 0, fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="publisherHome"
        options={{
          title: 'Events',
          headerTitle: 'Events',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'search' : 'search-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create-event"
        options={{
          title: 'Create',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'add-circle' : 'add-circle-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="publisherProfile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="edit-event"
        options={{
          title: 'Event Details',
          headerLeft: () => (
            <Icon
              name="chevron-back"
              size={22}
              color="#0f172a"
              style={{ marginLeft: 12 }}
              onPress={() => router.back()}
            />
          ),
          href: null,
        }}
      />

      <Tabs.Screen
        name="edit-event-form"
        options={{
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  )
}

export default PublisherDashBoardLayout


