import * as Haptics from 'expo-haptics';

export async function playClick() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function playSuccess() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function playError() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export async function playBeep() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export async function playComplete() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
