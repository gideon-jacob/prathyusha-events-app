import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import TestRefComponent from './test-ref'
import { Link, Redirect, router } from 'expo-router'
import Spacer from '@/components/spacer'
import { useAuth } from './contexts/AuthContext'

const Home = () => {
  const { state } = useAuth()

  if (state.status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9e0202" />
      </View>
    )
  }

  if (state.status === 'authenticated') {
    const role = state.user.role
    if (role === 'publisher') {
      return <Redirect href="/publisherHome" />
    }
    return <Redirect href="/studentHome" />
  }

  // Not logged in → go to Login
  if (state.status === 'unauthenticated') {
    return <Redirect href="/login" />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PEC Event App</Text>
      <Text style={styles.subtitle}>React 19 + React Native 0.79.5</Text>

      <Link href="/login">Login Page</Link>

      <Spacer/>

      {/* <Link href='/studentHome'>Student Dashboard</Link> */}

      <TestRefComponent />
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    }
})