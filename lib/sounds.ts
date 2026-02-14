import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

export async function playClick() {
  if (isWeb) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

export async function playSuccess() {
  if (isWeb) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}

export async function playError() {
  if (isWeb) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
}

export async function playBeep() {
  if (isWeb) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
}

export async function playComplete() {
  if (isWeb) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}
