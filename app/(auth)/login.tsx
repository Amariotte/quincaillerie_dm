import { useAuthContext } from "@/hooks/auth-context";
import { DEMO_ACCOUNT } from "@/hooks/use-auth";
import COLORS from "@/styles/colors";
import { sharedStyles } from "@/styles/shared";
import { isModeDemoEnabled } from "@/tools/tools";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./style";

export default function LoginScreen() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<"login" | "password" | null>(
    null,
  );
  const passwordInputRef = useRef<TextInput>(null);
  const [validationErrors, setValidationErrors] = useState<{
    login?: string;
    password?: string;
  }>({});
  const { signIn, signInDemo, isLoading, error } = useAuthContext();
  const brandLogo = require("../../assets/images/logo.png");

  const socialLinks = {
    facebook: process.env.EXPO_PUBLIC_FACEBOOK_URL,
    instagram: process.env.EXPO_PUBLIC_INSTAGRAM_URL,
    linkedin: process.env.EXPO_PUBLIC_LINKEDIN_URL,
    tiktok: process.env.EXPO_PUBLIC_TIKTOK_URL,
    mail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL,
    phone: process.env.EXPO_PUBLIC_SUPPORT_PHONE,
  };

  const supportContacts = [
    {
      city: "Abidjan",
      phone: process.env.EXPO_PUBLIC_SUPPORT_PHONE_ABIDJAN,
    },
    {
      city: "Bouake",
      phone: process.env.EXPO_PUBLIC_SUPPORT_PHONE_BOUAKE,
    },
    {
      city: "Dabakala",
      phone: process.env.EXPO_PUBLIC_SUPPORT_PHONE_DABAKALA,
    },
  ].filter(
    (
      contact,
    ): contact is {
      city: string;
      phone: string;
    } => typeof contact.phone === "string" && contact.phone.trim().length > 0,
  );

  type ExternalLinkOptions = {
    url?: string;
    label: string;
    appUrls?: string[];
  };

  const openExternalLink = async ({
    url,
    label,
    appUrls = [],
  }: ExternalLinkOptions) => {
    if (!url && appUrls.length === 0) {
      Alert.alert(
        "Lien non configuré",
        `Le lien ${label} n'est pas configuré.`,
      );
      return;
    }

    for (const appUrl of appUrls) {
      try {
        const canOpenApp = await Linking.canOpenURL(appUrl);
        if (canOpenApp) {
          await Linking.openURL(appUrl);
          return;
        }
      } catch {
        // Ignore unsupported app schemes and continue with the next fallback.
      }
    }

    if (!url) {
      Alert.alert("Lien indisponible", `Impossible d'ouvrir ${label}.`);
      return;
    }

    const isWebUrl = /^https?:\/\//i.test(url);

    if (isWebUrl) {
      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert("Lien indisponible", `Impossible d'ouvrir ${label}.`);
      }
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Lien indisponible", `Impossible d'ouvrir ${label}.`);
      return;
    }

    await Linking.openURL(url);
  };

  const handleOpenMail = () =>
    openExternalLink({
      url: socialLinks.mail ? `mailto:${socialLinks.mail}` : undefined,
      label: "email",
    });

  const handleOpenCall = () =>
    openExternalLink({
      url: socialLinks.phone ? `tel:${socialLinks.phone}` : undefined,
      label: "téléphone",
    });

  const handleOpenAgencyCall = (city: string, phone: string) =>
    openExternalLink({
      url: `tel:${phone.replace(/\s/g, "")}`,
      label: `support ${city}`,
    });

  const facebookDeepLink = socialLinks.facebook
    ? `fb://facewebmodal/f?href=${encodeURIComponent(socialLinks.facebook)}`
    : undefined;
  const tiktokDeepLink = socialLinks.tiktok
    ? `snssdk1233://openUrl?url=${encodeURIComponent(socialLinks.tiktok)}`
    : undefined;

  const validateForm = () => {
    const errors: { login?: string; password?: string } = {};

    if (!login.trim()) {
      errors.login = "Le login est requis";
    }

    if (!password.trim()) {
      errors.password = "Le mot de passe est requis";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    try {
      await signIn(login.trim(), password);
      router.replace("/(tabs)");
    } catch {
      // L'erreur est déjà exposée par le hook.
    }
  };

  const handleDemoLogin = async () => {
    Keyboard.dismiss();
    setLogin(DEMO_ACCOUNT.login);
    setPassword(DEMO_ACCOUNT.password);
    setValidationErrors({});

    try {
      await signInDemo();
      router.replace("/(tabs)");
    } catch {
      // L'erreur est déjà exposée par le hook.
    }
  };

 
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardWrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loginTopBar}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <FontAwesome
                name="arrow-left"
                size={20}
                color={COLORS.primaryColor}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={brandLogo}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>
                {process.env.EXPO_PUBLIC_APP_NAME}
              </Text>
              <Text style={styles.screenTitle}>Connexion</Text>
              <Text style={styles.screenSubtitle}>
                Accédez à votre espace de gestion en toute sécurité
              </Text>
            </View>

            <View style={styles.formBlock}>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={sharedStyles.errorMessage}>{error}</Text>
                </View>
              )}

              <Text style={styles.loginLabel}>Nom d&apos;utilisateur</Text>
              <View
                style={[
                  styles.inputRow,
                  focusedField === "login" && styles.inputRowFocused,
                  validationErrors.login && styles.inputRowError,
                ]}
              >
                <FontAwesome
                  name="user"
                  size={18}
                  color={COLORS.primaryColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Nom d'utilisateur"
                  placeholderTextColor={COLORS.accentColor}
                  value={login}
                  onChangeText={setLogin}
                  style={styles.loginInput}
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  textContentType="username"
                  returnKeyType="next"
                  onFocus={() => setFocusedField("login")}
                  onBlur={() => setFocusedField(null)}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
              </View>
              {validationErrors.login && (
                <Text style={styles.fieldError}>{validationErrors.login}</Text>
              )}

              <Text style={styles.loginLabel}>Mot de passe</Text>
              <View
                style={[
                  styles.inputRow,
                  focusedField === "password" && styles.inputRowFocused,
                  validationErrors.password && styles.inputRowError,
                ]}
              >
                <FontAwesome
                  name="lock"
                  size={18}
                  color={COLORS.primaryColor}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordInputRef}
                  placeholder="Mot de passe"
                  placeholderTextColor={COLORS.accentColor}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.loginInput}
                  secureTextEntry={!isPasswordVisible}
                  editable={!isLoading}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible((prev) => !prev)}
                  activeOpacity={0.8}
                  style={styles.passwordToggle}
                  disabled={isLoading}
                >
                  <FontAwesome
                    name={isPasswordVisible ? "eye-slash" : "eye"}
                    size={18}
                    color={COLORS.primaryColor}
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.password && (
                <Text style={styles.fieldError}>
                  {validationErrors.password}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Text>
              </TouchableOpacity>

              {isModeDemoEnabled() && (
                <TouchableOpacity
                  style={[
                    styles.guestButton,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleDemoLogin}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.guestButtonText}>Mode demo</Text>
                </TouchableOpacity>
              )}

          
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Nos reseaux sociaux</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialLinksContainer}>
                {socialLinks.facebook && (
                  <TouchableOpacity
                    style={styles.socialIcon}
                    activeOpacity={0.85}
                    onPress={() =>
                      openExternalLink({
                        url: socialLinks.facebook,
                        label: "Facebook",
                        appUrls: facebookDeepLink
                          ? [facebookDeepLink, "fb://"]
                          : ["fb://"],
                      })
                    }
                  >
                    <FontAwesome
                      name="facebook"
                      size={18}
                      color={COLORS.primaryColor}
                    />
                  </TouchableOpacity>
                )}
                {socialLinks.instagram && (
                  <TouchableOpacity
                    style={styles.socialIcon}
                    activeOpacity={0.85}
                    onPress={() =>
                      openExternalLink({
                        url: socialLinks.instagram,
                        label: "Instagram",
                        appUrls: ["instagram://"],
                      })
                    }
                  >
                    <FontAwesome
                      name="instagram"
                      size={18}
                      color={COLORS.primaryColor}
                    />
                  </TouchableOpacity>
                )}
                {socialLinks.linkedin && (
                  <TouchableOpacity
                    style={styles.socialIcon}
                    activeOpacity={0.85}
                    onPress={() =>
                      openExternalLink({
                        url: socialLinks.linkedin,
                        label: "LinkedIn",
                        appUrls: ["linkedin://"],
                      })
                    }
                  >
                    <FontAwesome
                      name="linkedin"
                      size={18}
                      color={COLORS.primaryColor}
                    />
                  </TouchableOpacity>
                )}
                {socialLinks.tiktok && (
                  <TouchableOpacity
                    style={styles.socialIcon}
                    activeOpacity={0.85}
                    onPress={() =>
                      openExternalLink({
                        url: socialLinks.tiktok,
                        label: "TikTok",
                        appUrls: tiktokDeepLink
                          ? [tiktokDeepLink, "tiktok://", "snssdk1233://"]
                          : ["tiktok://", "snssdk1233://"],
                      })
                    }
                  >
                    <FontAwesome5
                      name="tiktok"
                      size={18}
                      color={COLORS.primaryColor}
                    />
                  </TouchableOpacity>
                )}
                {socialLinks.mail && (
                  <TouchableOpacity
                    style={styles.socialIcon}
                    activeOpacity={0.85}
                    onPress={handleOpenMail}
                  >
                    <FontAwesome
                      name="envelope"
                      size={18}
                      color={COLORS.primaryColor}
                    />
                  </TouchableOpacity>
                )}
                {socialLinks.phone && (
                  <TouchableOpacity
                    style={styles.socialIcon}
                    activeOpacity={0.85}
                    onPress={handleOpenCall}
                  >
                    <FontAwesome
                      name="phone"
                      size={18}
                      color={COLORS.primaryColor}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.bottomHelpRow}
              activeOpacity={0.8}
              onPress={() => setIsSupportModalVisible(true)}
            >
              <FontAwesome
                name="headphones"
                size={14}
                color={COLORS.primaryColor}
              />
              <Text style={styles.bottomHelpText}>
                Besoin d&apos;aide ? Contactez le support
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={isSupportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSupportModalVisible(false)}
      >
        <View style={styles.supportModalOverlay}>
          <View style={styles.supportModalCard}>
            <View style={styles.supportModalHeader}>
              <View>
                <Text style={styles.supportModalTitle}>Support</Text>
                <Text style={styles.supportModalSubtitle}>
                  Email et contacts des agences
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsSupportModalVisible(false)}
                style={styles.supportModalCloseButton}
              >
                <FontAwesome
                  name="close"
                  size={16}
                  color={COLORS.primaryColor}
                />
              </TouchableOpacity>
            </View>

            {socialLinks.mail && (
              <TouchableOpacity
                style={styles.supportInfoRow}
                activeOpacity={0.85}
                onPress={handleOpenMail}
              >
                <View style={styles.supportInfoIconWrap}>
                  <FontAwesome
                    name="envelope"
                    size={16}
                    color={COLORS.primaryColor}
                  />
                </View>
                <View style={styles.supportInfoTextBlock}>
                  <Text style={styles.supportInfoLabel}>Email</Text>
                  <Text style={styles.supportInfoValue}>
                    {socialLinks.mail}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {supportContacts.map((contact) => (
              <TouchableOpacity
                key={contact.city}
                style={styles.supportInfoRow}
                activeOpacity={0.85}
                onPress={() =>
                  handleOpenAgencyCall(contact.city, contact.phone)
                }
              >
                <View style={styles.supportInfoIconWrap}>
                  <FontAwesome
                    name="phone"
                    size={16}
                    color={COLORS.primaryColor}
                  />
                </View>
                <View style={styles.supportInfoTextBlock}>
                  <Text style={styles.supportInfoLabel}>{contact.city}</Text>
                  <Text style={styles.supportInfoValue}>{contact.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {!socialLinks.mail && supportContacts.length === 0 && (
              <Text style={styles.supportEmptyText}>
                Aucune information de support n&apos;est configurée.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
