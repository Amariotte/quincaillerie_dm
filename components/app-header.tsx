import { useAuthContext } from "@/hooks/auth-context";
import { getConnectedUserProfilePhotoSource } from "@/services/user-service";
import COLORS from "@/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image, type ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  isOffline?: boolean;
};

const defaultAvatarSource = require("../assets/images/avatar.png");
const sessionAvatarSourceByUser: Record<string, ImageSource> = {};
const sessionAvatarVersionByUser: Record<string, number> = {};
const PROFILE_PHOTO_VERSION_STORAGE_PREFIX =
  "profile.photo.version.session.v1.";

function getProfilePhotoVersionStorageKey(sessionKey: string): string {
  return `${PROFILE_PHOTO_VERSION_STORAGE_PREFIX}${encodeURIComponent(sessionKey)}`;
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  isOffline = false,
}: AppHeaderProps) {
  const router = useRouter();
  const { user, userToken, profilePhotoVersion, isLoading } = useAuthContext();
  const avatarSessionKey = useMemo(
    () => user?.code?.trim() || userToken || "anonymous",
    [user?.code, userToken],
  );
  const headerBackgroundColor = COLORS.primaryColor;
  const headerTextColor = "#ffffff";
  const headerSubtextColor = "#d1fae5";
  const [useDefaultAvatar, setUseDefaultAvatar] = useState(false);
  const [committedAvatarSource, setCommittedAvatarSource] =
    useState<ImageSource>(() => {
      return sessionAvatarSourceByUser[avatarSessionKey] ?? defaultAvatarSource;
    });
  const [stagedAvatarSource, setStagedAvatarSource] =
    useState<ImageSource | null>(null);
  const [stagedAvatarVersion, setStagedAvatarVersion] = useState<number | null>(
    null,
  );

  const remoteAvatarSource = useMemo(() => {
    if (userToken) {
      try {
        return getConnectedUserProfilePhotoSource(
          userToken,
          profilePhotoVersion,
        );
      } catch {
        return defaultAvatarSource;
      }
    }

    return defaultAvatarSource;
  }, [profilePhotoVersion, userToken]);

  useEffect(() => {
    setUseDefaultAvatar(false);
  }, [remoteAvatarSource]);

  const avatarSource = useDefaultAvatar
    ? defaultAvatarSource
    : remoteAvatarSource;

  useEffect(() => {
    if (useDefaultAvatar) {
      setCommittedAvatarSource(defaultAvatarSource);
      setStagedAvatarSource(null);
      setStagedAvatarVersion(null);
      return;
    }

    setStagedAvatarSource(avatarSource);
    setStagedAvatarVersion(
      typeof profilePhotoVersion === "number" && profilePhotoVersion > 0
        ? profilePhotoVersion
        : null,
    );
  }, [avatarSource, profilePhotoVersion, useDefaultAvatar]);

  useEffect(() => {
    let isMounted = true;

    setUseDefaultAvatar(false);
    setCommittedAvatarSource(
      sessionAvatarSourceByUser[avatarSessionKey] ?? defaultAvatarSource,
    );
    setStagedAvatarSource(null);
    setStagedAvatarVersion(null);

    const loadPersistedAvatarVersion = async () => {
      if (!userToken) {
        return;
      }

      let versionToUse = sessionAvatarVersionByUser[avatarSessionKey];

      if (!(typeof versionToUse === "number" && versionToUse > 0)) {
        const storedVersionRaw = await AsyncStorage.getItem(
          getProfilePhotoVersionStorageKey(avatarSessionKey),
        );
        const storedVersion = Number(storedVersionRaw);
        if (Number.isFinite(storedVersion) && storedVersion > 0) {
          versionToUse = storedVersion;
          sessionAvatarVersionByUser[avatarSessionKey] = storedVersion;
        }
      }

      if (
        !isMounted ||
        !(typeof versionToUse === "number" && versionToUse > 0)
      ) {
        return;
      }

      try {
        const persistedSource = getConnectedUserProfilePhotoSource(
          userToken,
          versionToUse,
        );
        sessionAvatarSourceByUser[avatarSessionKey] = persistedSource;
        setCommittedAvatarSource(persistedSource);
      } catch {
        // ignore
      }
    };

    void loadPersistedAvatarVersion();

    return () => {
      isMounted = false;
    };
  }, [avatarSessionKey, userToken]);

  const defaultSubtitle = user
    ? `${user.nom} · ${user.email}`
    : "Utilisateur connecté";

  return (
    <View
      style={[styles.container, { backgroundColor: headerBackgroundColor }]}
    >
      <View style={styles.leftGroup}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: "#ffffff1f", borderColor: "#ffffff55" },
            ]}
          >
            <MaterialIcons
              name="arrow-back"
              size={20}
              color={headerTextColor}
            />
          </TouchableOpacity>
        ) : null}
        <View style={styles.textBlock}>
          <Text style={[styles.appName, { color: headerSubtextColor }]}>
            {process.env.EXPO_PUBLIC_APP_NAME}
          </Text>
          <Text style={[styles.pageTitle, { color: headerTextColor }]}>
            {title}
          </Text>
          <Text
            style={[styles.pageSubtitle, { color: headerSubtextColor }]}
            numberOfLines={1}
          >
            {subtitle ?? defaultSubtitle}
          </Text>
          {isOffline ? (
            <View style={styles.offlineBadge}>
              <MaterialIcons name="cloud-off" size={12} color="#fef3c7" />
              <Text style={styles.offlineBadgeText}>Mode déconnecté</Text>
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/profile")}
        disabled={isLoading}
        style={[styles.avatarButton, { borderColor: "#ffffff" }]}
      >
        <Image
          source={committedAvatarSource}
          style={styles.avatarImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        {stagedAvatarSource ? (
          <Image
            source={stagedAvatarSource}
            style={[styles.avatarImage, styles.avatarImageOverlay]}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={120}
            onLoad={() => {
              sessionAvatarSourceByUser[avatarSessionKey] = stagedAvatarSource;
              setCommittedAvatarSource(stagedAvatarSource);
              setStagedAvatarSource(null);

              if (
                userToken &&
                typeof stagedAvatarVersion === "number" &&
                stagedAvatarVersion > 0
              ) {
                sessionAvatarVersionByUser[avatarSessionKey] =
                  stagedAvatarVersion;
                void AsyncStorage.setItem(
                  getProfilePhotoVersionStorageKey(avatarSessionKey),
                  String(stagedAvatarVersion),
                );
              }
            }}
            onError={() => {
              setStagedAvatarSource(null);
              setStagedAvatarVersion(null);
            }}
          />
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  leftGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
  },
  appName: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  offlineBadgeText: {
    color: "#fef3c7",
    fontSize: 11,
    fontWeight: "700",
  },
  avatarButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 2,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
