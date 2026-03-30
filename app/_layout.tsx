import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import {
    FeedbackPopup,
    FeedbackPopupType,
} from "@/components/ui/feedback-popup";
import { AuthProvider, useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    setApiErrorPopupHandler,
    setUnauthorizedHandler,
} from "@/services/api-client";
import { useEffect, useState } from "react";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { userToken, clearAuthSession } = useAuthContext();
  const segments = useSegments();
  const isAuthRoute = segments[0] === "(auth)";
  const [apiPopupState, setApiPopupState] = useState<{
    visible: boolean;
    type: FeedbackPopupType;
    title: string;
    message: string;
  }>({
    visible: false,
    type: "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    setUnauthorizedHandler(clearAuthSession);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearAuthSession]);

  useEffect(() => {
    if (isAuthRoute) {
      setApiErrorPopupHandler(null);
      return;
    }

    setApiErrorPopupHandler((payload) => {
      setApiPopupState({
        visible: true,
        type: payload.type,
        title: payload.title,
        message: payload.message,
      });
    });

    return () => {
      setApiErrorPopupHandler(null);
    };
  }, [isAuthRoute]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {userToken == null ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="ventes/index" options={{ headerShown: false }} />
          <Stack.Screen name="ventes/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="proformas/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="proformas/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="bons/index" options={{ headerShown: false }} />
          <Stack.Screen name="bons/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="reglements/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="reglements/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="produits/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="produits/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="bonsAchats/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="bonsAchats/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="transactions/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="transactions/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="promotions/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="promotions/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="operations/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="operations/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="commissions/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="commissions/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="cartes/index" options={{ headerShown: false }} />
          <Stack.Screen name="cartes/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="devis/nouveau" options={{ headerShown: false }} />
          <Stack.Screen name="compte/qr" options={{ headerShown: false }} />
          <Stack.Screen
            name="compte/mot-de-passe"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="compte/a-propos"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
            }}
          />
        </Stack>
      )}
      <StatusBar style="auto" />
      <FeedbackPopup
        visible={apiPopupState.visible}
        type={apiPopupState.type}
        title={apiPopupState.title}
        message={apiPopupState.message}
        onClose={() =>
          setApiPopupState((prev) => ({ ...prev, visible: false }))
        }
      />
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
