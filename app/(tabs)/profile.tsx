import { AppHeader } from "@/components/app-header";
import { AuthButton } from "@/components/auth-button";
import {
  ConfirmationPopup,
  FeedbackPopup,
  FeedbackPopupType,
} from "@/components/ui/feedback-popup";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  getConnectedUserProfilePhotoSource,
  updateConnectedUserProfilePhotoBase64,
} from "@/services/user-service";
import { sharedStyles } from "@/styles/shared";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProfileField = {
  label: string;
  value: unknown;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  formatter?: (value: unknown) => string;
};

const defaultAvatarSource = require("../../assets/images/avatar.png");
const RECOMMENDED_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
const RECOMMENDED_UPLOAD_SIZE_LABEL = "2 Mo";

const formatTextValue = (value: unknown) => {
  if (value == null) {
    return "";
  }
  return String(value).trim();
};

const formatDateValue = (value: unknown) => {
  if (!(value instanceof Date)) {
    return formatTextValue(value);
  }
  if (Number.isNaN(value.getTime())) {
    return "";
  }
  return value.toLocaleDateString("fr-FR");
};

const formatNumberValue = (value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return formatTextValue(value);
  }
  return new Intl.NumberFormat("fr-FR").format(value);
};

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    userToken,
    profilePhotoVersion,
    refreshProfilePhoto,
    signOut,
    isLoading,
  } = useAuthContext();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } =
    useAppTheme();
  const [useDefaultAvatar, setUseDefaultAvatar] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [localAvatarPreviewUri, setLocalAvatarPreviewUri] = useState<
    string | null
  >(null);
  const [isLogoutConfirmationVisible, setIsLogoutConfirmationVisible] =
    useState(false);
  const [popupState, setPopupState] = useState<{
    visible: boolean;
    type: FeedbackPopupType;
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const openPopup = (
    type: FeedbackPopupType,
    title: string,
    message: string,
  ) => {
    setPopupState({ visible: true, type, title, message });
  };

  const showRecommendedSizeInfo = (selectedSize?: number | null) => {
    if (
      typeof selectedSize !== "number" ||
      Number.isNaN(selectedSize) ||
      selectedSize <= RECOMMENDED_UPLOAD_SIZE_BYTES
    ) {
      return;
    }

    const selectedSizeInMb = (selectedSize / (1024 * 1024)).toFixed(1);
    openPopup(
      "info",
      "Taille recommandée",
      `Pour un envoi plus rapide, utilisez une image <= ${RECOMMENDED_UPLOAD_SIZE_LABEL} (sélection: ${selectedSizeInMb} Mo).`,
    );
  };

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

  const avatarSource = useMemo(() => {
    if (localAvatarPreviewUri) {
      return { uri: localAvatarPreviewUri };
    }

    return useDefaultAvatar ? defaultAvatarSource : remoteAvatarSource;
  }, [localAvatarPreviewUri, remoteAvatarSource, useDefaultAvatar]);

  const profileFields = useMemo(() => {
    if (!user) {
      return [] as (ProfileField & { displayValue: string })[];
    }

    const fields: ProfileField[] = [
      {
        label: "Représentant légal",
        value: user.nomRepresentantLegal,
        icon: "person",
      },
      { label: "Type de pièce", value: user.typePiece, icon: "description" },
      { label: "Numéro de pièce", value: user.numPiece, icon: "badge" },
      {
        label: "Date de naissance",
        value: user.dateNaissance,
        icon: "cake",
        formatter: formatDateValue,
      },
      {
        label: "Date d'anniversaire",
        value: user.dateAnniversaire,
        icon: "event",
      },
      { label: "Type", value: user.type, icon: "category" },
      { label: "Civilité", value: user.civilite, icon: "wc" },
      { label: "Adresse", value: user.adresse, icon: "home" },
      { label: "Email", value: user.email, icon: "alternate-email" },
      { label: "Téléphone fixe", value: user.telFixe, icon: "phone" },
      { label: "Téléphone mobile", value: user.telMobile, icon: "smartphone" },
      { label: "NCC", value: user.ncc, icon: "account-balance" },
      { label: "Agence", value: user.nomAgence, icon: "business" },
      {
        label: "Plafond",
        value: user.plafond,
        icon: "attach-money",
        formatter: formatNumberValue,
      },
    ];

    return fields
      .map((field) => ({
        ...field,
        displayValue: field.formatter
          ? field.formatter(field.value)
          : formatTextValue(field.value),
      }))
      .filter((field) => field.displayValue.length > 0);
  }, [user]);

  const handleLogout = () => {
    setIsLogoutConfirmationVisible(true);
  };

  const confirmLogout = async () => {
    setIsLogoutConfirmationVisible(false);

    try {
      await signOut();
      router.replace("/(auth)" as never);
    } catch {
      router.replace("/(auth)" as never);
    }
  };

  const handleChangeProfileImage = async () => {
    if (isUploadingPhoto) {
      return;
    }

    if (!userToken) {
      openPopup("error", "Erreur", "Session utilisateur indisponible.");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      openPopup(
        "info",
        "Permission requise",
        "Autorisez l’accès à la galerie pour modifier votre photo de profil.",
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      selectionLimit: 1,
      base64: true,
    });

    if (pickerResult.canceled || pickerResult.assets.length === 0) {
      return;
    }

    const selectedAsset = pickerResult.assets[0];
    showRecommendedSizeInfo(selectedAsset.fileSize);
    setLocalAvatarPreviewUri(selectedAsset.uri);
    setUseDefaultAvatar(false);
    setIsUploadingPhoto(true);

    try {
      if (!selectedAsset.base64) {
        throw new Error("Conversion de l'image en base64 impossible");
      }

      const successMessage = await updateConnectedUserProfilePhotoBase64(
        userToken,
        {
          base64: selectedAsset.base64,
          fileName: selectedAsset.fileName,
          mimeType: selectedAsset.mimeType,
        },
      );
      refreshProfilePhoto();
      setLocalAvatarPreviewUri(null);
      openPopup(
        "success",
        "Photo mise à jour",
        successMessage || "Votre photo de profil a été modifiée.",
      );
    } catch {
      setLocalAvatarPreviewUri(null);
      // error already displayed globally by api-client
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
        <AppHeader
          title="Profil"
          subtitle="Informations et préférences du compte"
          showBack
        />
      </View>
      <ScrollView
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={sharedStyles.container}>
          <View style={[styles.profileHero, { backgroundColor: cardColor }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleChangeProfileImage}
              disabled={isUploadingPhoto}
              style={styles.avatarHeroWrap}
            >
              <Image
                key={typeof profilePhotoVersion === "number" ? String(profilePhotoVersion) : "profile-avatar"}
                source={avatarSource}
                style={styles.avatarHeroImage}
                contentFit="cover"
                cachePolicy="none"
                recyclingKey={typeof profilePhotoVersion === "number" ? String(profilePhotoVersion) : undefined}
                onError={() => setUseDefaultAvatar(true)}
              />
              {isUploadingPhoto ? (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              ) : null}
              <View style={[styles.editBadge, { backgroundColor: tintColor }]}>
                <MaterialIcons name="edit" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>

            <View style={styles.heroTextWrap}>
              <Text style={[styles.heroName, { color: textColor }]}>
                {user?.code ?? ""}
              </Text>
              <Text style={[styles.heroName, { color: textColor }]}>
                {user?.nom ?? "Utilisateur"}
              </Text>
              <Text style={[styles.heroEmail, { color: mutedColor }]}>
                {user?.email ?? "Aucun email"}
              </Text>
              <Text style={[styles.uploadHint, { color: mutedColor }]}>
                {`Taille photo recommandée: <= ${RECOMMENDED_UPLOAD_SIZE_LABEL}`}
              </Text>
            </View>
          </View>

          {/* Fiche détaillée */}
          {user && (
            <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Informations personnelles
              </Text>
              {profileFields.map((field) => (
                <View
                  key={field.label}
                  style={[
                    styles.profileRow,
                    { borderBottomColor: mutedColor + "30" },
                  ]}
                >
                  <View
                    style={[
                      styles.profileIconWrap,
                      { backgroundColor: tintColor + "18" },
                    ]}
                  >
                    <MaterialIcons
                      name={field.icon}
                      size={18}
                      color={tintColor}
                    />
                  </View>
                  <View style={styles.profileTextWrap}>
                    <Text style={[styles.profileLabel, { color: mutedColor }]}>
                      {field.label}
                    </Text>
                    <Text style={[styles.profileValue, { color: textColor }]}>
                      {field.displayValue}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Settings Sections */}
          <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
            {/* Account Settings */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Compte
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/compte/qr")}
              style={[
                styles.settingItem,
                {
                  borderBottomColor: backgroundColor,
                },
              ]}
            >
              <View style={styles.settingItemLeft}>
                <MaterialIcons
                  name="person"
                  size={24}
                  color={tintColor}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    Mon code QR
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: textColor, opacity: 0.6 },
                    ]}
                  >
                    Afficher votre identifiant visuel
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={textColor}
                style={{ opacity: 0.5 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/compte/mot-de-passe")}
              style={[
                styles.settingItem,
                {
                  borderBottomColor: backgroundColor,
                },
              ]}
            >
              <View style={styles.settingItemLeft}>
                <MaterialIcons
                  name="lock"
                  size={24}
                  color={tintColor}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    Modifier le mot de passe
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: textColor, opacity: 0.6 },
                    ]}
                  >
                    Changer votre mot de passe
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={textColor}
                style={{ opacity: 0.5 }}
              />
            </TouchableOpacity>

            {/* App Settings */}
            <Text
              style={[styles.sectionTitle, { color: textColor, marginTop: 24 }]}
            >
              Application
            </Text>

            <TouchableOpacity
              onPress={() => router.push("../compte/a-propos")}
              style={[
                styles.settingItem,
                {
                  borderBottomColor: backgroundColor,
                },
              ]}
            >
              <View style={styles.settingItemLeft}>
                <MaterialIcons
                  name="info"
                  size={24}
                  color={tintColor}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    À propos
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: textColor, opacity: 0.6 },
                    ]}
                  >
                    Version 1.0.0
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={textColor}
                style={{ opacity: 0.5 }}
              />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <AuthButton
            title={isLoading ? "Déconnexion..." : "Se déconnecter"}
            onPress={handleLogout}
            loading={isLoading}
            disabled={isLoading}
            variant="secondary"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>

      <FeedbackPopup
        visible={popupState.visible}
        type={popupState.type}
        title={popupState.title}
        message={popupState.message}
        onClose={() => setPopupState((prev) => ({ ...prev, visible: false }))}
      />

      <ConfirmationPopup
        visible={isLogoutConfirmationVisible}
        type="info"
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmLabel="Déconnexion"
        cancelLabel="Annuler"
        onCancel={() => setIsLogoutConfirmationVisible(false)}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatarHeroWrap: {
    position: "relative",
    marginBottom: 14,
  },
  avatarHeroImage: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  avatarLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  editBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  heroTextWrap: {
    alignItems: "center",
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
  },
  heroEmail: {
    marginTop: 4,
    fontSize: 14,
  },
  uploadHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "400",
  },
  settingsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 12,
  },
  profileCard: {
    borderRadius: 20,
    padding: 16,
    gap: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  profileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  profileTextWrap: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  profileValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  popupTestDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  popupActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  popupActionChip: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  popupActionText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
