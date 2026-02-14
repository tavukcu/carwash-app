import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#f1f5f9' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, statusBarStyle: 'light' }} />
        <Stack.Screen name="cashier" options={{ title: 'Kasa', statusBarStyle: 'light' }} />
        <Stack.Screen name="kiosk" options={{ title: 'Kiosk', statusBarStyle: 'light' }} />
        <Stack.Screen name="admin" options={{ title: 'Yönetim Paneli', statusBarStyle: 'light' }} />
      </Stack>
    </>
  );
}
