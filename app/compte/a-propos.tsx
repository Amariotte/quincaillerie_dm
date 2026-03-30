import { AppHeader } from "@/components/app-header";
import { useAppTheme } from "@/hooks/use-app-theme";
import { sharedStyles } from "@/styles/shared.js";
import Constants from "expo-constants";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const appName = process.env.EXPO_PUBLIC_APP_NAME || "MonProjetMobile";

function getAppVersion() {
  const configVersion = Constants.expoConfig?.version;
  const nativeVersion = Constants.nativeAppVersion;
  return configVersion || nativeVersion || "1.0.0";
}

export default function AboutScreen() {
  const {
    backgroundColor,
    textColor,
    mutedColor,
    cardColor,
    borderColor,
    tintColor,
  } = useAppTheme();

  const version = getAppVersion();

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={styles.headerWrap}>
        <AppHeader
          showBack
          title="À propos"
          subtitle="Informations de l'application"
        />
      </View>

      <ScrollView
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={sharedStyles.container}>
          <View
            style={[styles.card, { backgroundColor: cardColor, borderColor }]}
          >
            <Text style={[styles.appName, { color: textColor }]}>
              {appName}
            </Text>
            <Text style={[styles.appSubtitle, { color: mutedColor }]}>
              Application mobile de gestion
            </Text>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            <View style={styles.row}>
              <Text style={[styles.label, { color: mutedColor }]}>Version</Text>
              <Text style={[styles.value, { color: tintColor }]}>
                {version}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: mutedColor }]}>
                Environnement
              </Text>
              <Text style={[styles.value, { color: textColor }]}>
                {__DEV__ ? "Développement" : "Production"}
              </Text>
            </View>
          </View>

          <View
            style={[styles.card, { backgroundColor: cardColor, borderColor }]}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: mutedColor }]}>
              Cette application permet de consulter et gérer vos opérations
              commerciales, produits, règlements et informations de compte.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
});
