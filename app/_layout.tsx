import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import {
  FeedbackPopup,
  FeedbackPopupType,
} from "@/components/ui/feedback-popup";
import { AuthProvider, useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  setApiErrorPopupHandler,
  setTokenRefreshHandler,
  setUnauthorizedHandler,
} from "@/services/api-client";
import { useEffect, useRef, useState } from "react";

export const unstable_settings = {
  anchor: "(tabs)",
};

const hiddenHeaderOptions = { headerShown: false };

const authenticatedScreens = [
  "(tabs)",
  "ventes/index",
  "ventes/[id]",
  "proformas/index",
  "proformas/[id]",
  "bons/index",
  "bons/[id]",
  "reglements/index",
  "reglements/[id]",
  "produits/index",
  "produits/[id]",
  "bonsAchats/index",
  "bonsAchats/[id]",
  "transactions/index",
  "promotions/index",
  "promotions/[id]",
  "operations/index",
  "operations/[id]",
  "commissions/index",
  "commissions/[id]",
  "sous-comptes/index",
  "devis/nouveau",
  "compte/qr",
  "compte/mot-de-passe",
  "compte/a-propos",
] as const;

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { userToken, isLoading, clearAuthSession, refreshAccessToken } =
    useAuthContext();
  const router = useRouter();
  const segments = useSegments();
  const isAuthRoute = segments[0] === "(auth)";
  const isAuthenticated = Boolean(userToken);
  // True only during the very first session restore — becomes false once and stays false.
  const initialLoadDone = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isLoading && !initialLoadDone.current) {
      initialLoadDone.current = true;
      setIsInitializing(false);
    }
  }, [isLoading]);

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
    setTokenRefreshHandler(refreshAccessToken);

    return () => {
      setUnauthorizedHandler(null);
      setTokenRefreshHandler(null);
    };
  }, [clearAuthSession, refreshAccessToken]);

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

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (isAuthenticated && isAuthRoute) {
      router.replace("/(tabs)");
      return;
    }

    if (!isAuthenticated && !isAuthRoute) {
      router.replace("/(auth)");
    }
  }, [isAuthenticated, isAuthRoute, isInitializing, router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {isInitializing ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colorScheme === "dark" ? "#000000" : "#ffffff",
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      ) : !isAuthenticated ? (
        <Stack screenOptions={hiddenHeaderOptions}>
          <Stack.Screen name="(auth)" options={hiddenHeaderOptions} />
        </Stack>
      ) : (
        <Stack screenOptions={hiddenHeaderOptions}>
          {authenticatedScreens.map((screenName) => (
            <Stack.Screen
              key={screenName}
              name={screenName}
              options={hiddenHeaderOptions}
            />
          ))}
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
