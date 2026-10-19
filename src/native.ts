import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Reklam ve satın alma gibi yerel modüller yalnızca kendi derlememizde (EAS / dev build)
 * bulunur. Expo Go'da ve web'de bu modülleri yüklemeye çalışmak uygulamayı çökertir.
 */
export const hasNativeModules =
  Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

/** Modülü yalnızca destekleniyorsa yükler; aksi halde null döner. */
export function loadNative<T>(load: () => T): T | null {
  if (!hasNativeModules) return null;
  try {
    return load();
  } catch {
    return null;
  }
}
