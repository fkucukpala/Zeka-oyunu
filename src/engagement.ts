// Oyuncuyu geri getiren ve mağaza puanını artıran küçük yardımcılar:
// günlük hatırlatma bildirimi ve Play Store puanlama isteği.
import { Platform } from 'react-native';

import { DAILY_ENERGY, REMINDER_HOUR, REVIEW_AFTER_WINS } from './config';
import { loadNative } from './native';
import { getFlag, loadStats, setFlag } from './storage';

type NotificationsLib = typeof import('expo-notifications');
type StoreReviewLib = typeof import('expo-store-review');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const notifications = loadNative(() => require('expo-notifications') as NotificationsLib);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const storeReview = loadNative(() => require('expo-store-review') as StoreReviewLib);

const CHANNEL_ID = 'gunluk-bulmaca';

export const remindersSupported = notifications !== null;

notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Günlük hatırlatmayı açar. İzin verilmezse false döner. */
export async function enableReminder(): Promise<boolean> {
  if (!notifications) return false;
  await setFlag('reminder-asked', true);
  try {
    if (Platform.OS === 'android') {
      await notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Günlük bulmaca',
        importance: notifications.AndroidImportance.DEFAULT,
      });
    }
    const { granted } = await notifications.requestPermissionsAsync();
    if (!granted) {
      await setFlag('reminder-on', false);
      return false;
    }
    await notifications.cancelAllScheduledNotificationsAsync();
    await notifications.scheduleNotificationAsync({
      content: {
        title: `${DAILY_ENERGY} yeni bölüm hakkın hazır 🧩`,
        body: 'Bugün en az bir bölüm çöz, serini koru!',
      },
      trigger: {
        type: notifications.SchedulableTriggerInputTypes.DAILY,
        hour: REMINDER_HOUR,
        minute: 0,
        channelId: CHANNEL_ID,
      },
    });
    await setFlag('reminder-on', true);
    return true;
  } catch {
    return false;
  }
}

export async function disableReminder(): Promise<void> {
  await setFlag('reminder-on', false);
  await notifications?.cancelAllScheduledNotificationsAsync().catch(() => {});
}

/** Hatırlatma teklifi bu oyuncuya henüz yapılmadıysa true. */
export async function shouldOfferReminder(): Promise<boolean> {
  return remindersSupported && !(await getFlag('reminder-asked'));
}

/**
 * Yeterince galibiyetten sonra Play Store puanlama penceresini bir kez açar.
 * Açtıysa true döner (o bulmacanın sonunda ayrıca reklam gösterilmez).
 */
export async function maybeAskForReview(): Promise<boolean> {
  if (!storeReview || (await getFlag('review-asked'))) return false;
  const stats = await loadStats();
  if (stats.won < REVIEW_AFTER_WINS) return false;
  try {
    if (!(await storeReview.isAvailableAsync())) return false;
    await setFlag('review-asked', true);
    await storeReview.requestReview();
    return true;
  } catch {
    return false;
  }
}
