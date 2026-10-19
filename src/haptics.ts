import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Titreşim desteklenmeyen platformlarda (web) sessizce yok sayılır.
const enabled = Platform.OS !== 'web';

export function tapHaptic() {
  if (enabled) Haptics.selectionAsync().catch(() => {});
}

export function successHaptic() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function errorHaptic() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}
