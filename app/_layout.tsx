import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuthContext } from '@/hooks/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { userToken } = useAuthContext();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {userToken == null ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="factures/index" options={{ headerShown: false }} />
          <Stack.Screen name="factures/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="proformas/index" options={{ headerShown: false }} />
          <Stack.Screen name="proformas/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="bons/index" options={{ headerShown: false }} />
          <Stack.Screen name="bons/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="reglements/index" options={{ headerShown: false }} />
          <Stack.Screen name="reglements/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="produits/index" options={{ headerShown: false }} />
          <Stack.Screen name="produits/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="achats/index" options={{ headerShown: false }} />
          <Stack.Screen name="achats/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="transactions/index" options={{ headerShown: false }} />
          <Stack.Screen name="transactions/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="promotions/index" options={{ headerShown: false }} />
          <Stack.Screen name="promotions/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="operations/index" options={{ headerShown: false }} />
          <Stack.Screen name="operations/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="commissions/index" options={{ headerShown: false }} />
          <Stack.Screen name="commissions/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="cartes/index" options={{ headerShown: false }} />
          <Stack.Screen name="cartes/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="devis/nouveau" options={{ headerShown: false }} />
          <Stack.Screen name="compte/qr" options={{ headerShown: false }} />
          <Stack.Screen name="compte/mot-de-passe" options={{ headerShown: false }} />
          <Stack.Screen name="compte/synchronisation" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              title: 'Modal',
            }}
          />
        </Stack>
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
