import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f1f5f9' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="cashier" />
        <Stack.Screen name="kiosk" />
        <Stack.Screen name="admin" />
      </Stack>
    </>
  );
}
