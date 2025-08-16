import React from 'react'
import { Redirect, Tabs } from 'expo-router'
import Icon from 'react-native-vector-icons/Ionicons'
import { useAuth } from '../contexts/AuthContext'

const UserDashBoardLayout = (): React.ReactElement | null => {
  const { state } = useAuth()

  if (state.status === 'loading') return null
  if (state.status === 'unauthenticated') return <Redirect href="/login" />

  if (state.status === 'authenticated') {
    if (!state.user) return <Redirect href="/login" />
    if (state.user.role !== 'user') return <Redirect href="/publisherHome" />
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
        name="studentHome"
        options={{
          title: 'Home',
          headerTitle: 'Prathyusha Events',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="studentSearch"
        options={{
          title: 'Search Events',
          headerShown: false,
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'search' : 'search-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="studentProfile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />

      {/* Hidden detail screen, navigable from Home/Search */}
      <Tabs.Screen
        name="eventDetail"
        options={({ navigation }) => ({
          href: null,
          title: 'Event Details',
          headerShown: true,
          headerTitleAlign: 'center',
          tabBarButton: () => null,
          headerLeft: () => (
            <Icon
              name="chevron-back"
              size={22}
              color="#0f172a"
              style={{ marginLeft: 12 }}
              onPress={() => navigation.goBack()}
            />
          ),
        })}
      />
    </Tabs>
  )
}

export default UserDashBoardLayout