import { Stack, Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './contexts/AuthContext';

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AuthProvider>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                        }}
                    />
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
} 