import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '../theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="oyun/[gun]" options={{ title: 'Bağlantı' }} />
        <Stack.Screen name="arsiv" options={{ title: 'Arşiv' }} />
        <Stack.Screen name="istatistik" options={{ title: 'İstatistikler', presentation: 'modal' }} />
        <Stack.Screen name="nasil" options={{ title: 'Nasıl oynanır?', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
