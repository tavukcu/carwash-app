import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1e3a5f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#f1f5f9' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="cashier" options={{ title: 'Kasa' }} />
        <Stack.Screen name="kiosk" options={{ title: 'Kiosk' }} />
        <Stack.Screen name="admin" options={{ title: 'Yonetim Paneli' }} />
      </Stack>
    </>
  );
}
