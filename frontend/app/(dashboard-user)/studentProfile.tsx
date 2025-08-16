import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Redirect, router } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'
import Icon from 'react-native-vector-icons/Ionicons'

const StudentProfile = () => {
  const { state, signOut } = useAuth()
  const handleChangePassword = () => {
    // TODO: navigate to change password
    console.log('Change password pressed')
  }

  const handleLogout = async () => {
    await signOut()
    router.replace('/login')
  }
  
  if (state.status === 'loading') {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#9e0202" />
      </View>
    )
  }

  if (state.status === 'unauthenticated') {
    return <Redirect href="/login" />
  }
  
  const username = state.user?.registerNumber || state.user?.name || 'Student'
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarCircle}>
        <Icon name="person" size={48} color="#94a3b8" />
      </View>

      {/* Name + Reg no */}
      <Text style={styles.name}>{username}</Text>
      <Text style={styles.reg}>Username: {username}</Text>

      {/* Info card */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{username}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{state.user?.email || '—'}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Department</Text>
        <Text style={styles.value}>{state.user?.department || '—'}</Text>
      </View>

      {/* Actions */}
      <Pressable style={styles.action} onPress={handleChangePassword}>
        <Text style={styles.actionText}>Change Password</Text>
        <Icon name="chevron-forward" size={18} color="#9e0202" />
      </Pressable>

      <Pressable style={styles.action} onPress={handleLogout}>
        <Text style={styles.actionText}>Log Out</Text>
        <Icon name="exit-outline" size={18} color="#9e0202" />
      </Pressable>
    </View>
  )
}

export default StudentProfile

const styles = StyleSheet.create({

  header:{
    fontSize: 20,
    marginTop: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 10,
  },
  container: {
    flex: 1,
    paddingTop: 36,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  reg: { marginTop: 6, color: '#64748b' },
  card: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  label: { color: '#64748b', fontWeight: '700', marginBottom: 4 },
  value: { color: '#0f172a', fontWeight: '800', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 6 },
  action: {
    width: '100%',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: { color: '#9e0202', fontWeight: '800' },
})
