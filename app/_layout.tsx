import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { K } from '../lib/theme';

const PRINT_CSS = `
@media print {
  body, #root, #main { background: #fff !important; }
  .no-print, header, nav, [data-no-print] { display: none !important; }
  .print-only { display: block !important; }
  @page {
    size: 80mm auto;
    margin: 2mm;
  }
  .receipt {
    width: 76mm;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #000;
  }
  .receipt-qr { text-align: center; margin: 4mm 0; }
  .receipt-line { border-top: 1px dashed #000; margin: 2mm 0; }
  .receipt-center { text-align: center; }
  .receipt-bold { font-weight: bold; }
  .receipt-lg { font-size: 16px; }
}
`;

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = PRINT_CSS;
      document.head.appendChild(style);
      return () => { document.head.removeChild(style); };
    }
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: K.bg },
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
