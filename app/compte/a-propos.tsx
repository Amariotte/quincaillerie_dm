import { AppHeader } from "@/components/app-header";
import { useAppTheme } from "@/hooks/use-app-theme";
import { sharedStyles } from "@/styles/shared.js";
import Constants from "expo-constants";
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const appName = process.env.EXPO_PUBLIC_APP_NAME || "MonProjetMobile";
const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || "support@monprojet.com";

function getAppVersion() {
  const configVersion = Constants.expoConfig?.version;
  const nativeVersion = Constants.nativeAppVersion;
  return configVersion || nativeVersion || "1.0.0";
}

function getBuildNumber() {
  const androidVersionCode = Constants.expoConfig?.android?.versionCode;
  const iosBuildNumber = Constants.expoConfig?.ios?.buildNumber;
  const nativeBuildVersion = Constants.nativeBuildVersion;
  return (
    String(androidVersionCode || iosBuildNumber || nativeBuildVersion || "-")
  );
}

async function openExternal(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Erreur", "Impossible d'ouvrir ce lien pour le moment.");
  }
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
  const buildNumber = getBuildNumber();
  const sdkVersion = Constants.expoConfig?.sdkVersion || "-";

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
              <Text style={[styles.label, { color: mutedColor }]}>Build</Text>
              <Text style={[styles.value, { color: textColor }]}>#{buildNumber}</Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: mutedColor }]}>SDK Expo</Text>
              <Text style={[styles.value, { color: textColor }]}>{sdkVersion}</Text>
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

          <View
            style={[styles.card, { backgroundColor: cardColor, borderColor }]}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>Support</Text>
            <Text style={[styles.description, { color: mutedColor }]}> 
              Besoin d'aide ou envie de signaler un problème ? Contactez-nous.
            </Text>

            <TouchableOpacity
              style={[styles.linkButton, { borderColor }]}
              activeOpacity={0.85}
              onPress={() => openExternal(`mailto:${supportEmail}`)}
            >
              <Text style={[styles.linkLabel, { color: mutedColor }]}>Email</Text>
              <Text style={[styles.linkValue, { color: tintColor }]}>
                {supportEmail}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[styles.card, { backgroundColor: cardColor, borderColor }]}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>Légal</Text>
            <Text style={[styles.description, { color: mutedColor }]}> 
              En utilisant cette application, vous acceptez nos conditions
              générales d'utilisation et notre politique de confidentialité.
            </Text>
            <Text style={[styles.footnote, { color: mutedColor }]}> 
              Copyright {new Date().getFullYear()} {appName}. Tous droits réservés.
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
  linkButton: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  linkLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  linkValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  footnote: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.9,
  },
});
