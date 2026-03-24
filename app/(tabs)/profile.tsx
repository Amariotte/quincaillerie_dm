import { AppHeader } from '@/components/app-header';
import { AuthButton } from '@/components/auth-button';
import { FeedbackPopup, FeedbackPopupType } from '@/components/ui/feedback-popup';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { sharedStyles } from '@/styles/shared';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuthContext();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();
  const [popupState, setPopupState] = useState<{
    visible: boolean;
    type: FeedbackPopupType;
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const avatarUri = useMemo(() => {
    const identity = user?.email ?? user?.nom ?? 'utilisateur';
    return `https://i.pravatar.cc/240?u=${encodeURIComponent(identity)}`;
  }, [user?.email, user?.nom]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        {
          text: 'Annuler',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)' as never);
            } catch (err) {
              Alert.alert(
                'Erreur',
                err instanceof Error
                  ? err.message
                  : 'Erreur lors de la déconnexion'
              );
              router.replace('/(auth)' as never);

            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const openPopup = (type: FeedbackPopupType) => {
    const popupContent: Record<FeedbackPopupType, { title: string; message: string }> = {
      error: {
        title: 'Erreur détectée',
        message: 'Une erreur est survenue lors du traitement. Veuillez réessayer dans quelques instants.',
      },
      success: {
        title: 'Opération réussie',
        message: 'Votre modification a bien été prise en compte et enregistrée avec succès.',
      },
      info: {
        title: 'Information utile',
        message: 'Ce popup est un module réutilisable pour afficher des messages informatifs dans l’application.',
      },
    };

    setPopupState({
      visible: true,
      type,
      title: popupContent[type].title,
      message: popupContent[type].message,
    });
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
        <AppHeader title="Profil" subtitle="Informations et préférences du compte" showBack />
      </View>
      <ScrollView
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={sharedStyles.container}>
          <View style={[styles.profileHero, { backgroundColor: cardColor }]}> 
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => Alert.alert('Bientôt disponible', 'La modification de la photo de profil sera ajoutée prochainement.')}
              style={styles.avatarHeroWrap}
            >
              <Image source={avatarUri} style={styles.avatarHeroImage} contentFit="cover" />
              <View style={[styles.editBadge, { backgroundColor: tintColor }]}> 
                <MaterialIcons name="edit" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>

            <View style={styles.heroTextWrap}>
              <Text style={[styles.heroName, { color: textColor }]}>{user?.nom ?? 'Utilisateur'}</Text>
              <Text style={[styles.heroEmail, { color: mutedColor }]}>{user?.email ?? 'Aucun email'}</Text>
            </View>
          </View>

          {/* Fiche détaillée */}
          {user && (
            <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Informations personnelles</Text>
              {[
                { label: 'Code', value: user.code, icon: 'badge' as const },
                { label: 'Représentant légal', value: user.nomRepresentantLegal, icon: 'badge' as const },
                { label: 'Date de naissance', value: user.dateNaissance, icon: 'cake' as const },
                { label: 'Adresse', value: user.adresse, icon: 'place' as const },
                { label: 'Email', value: user.email, icon: 'email' as const },
                { label: 'Téléphone fixe', value: user.telFixe, icon: 'phone' as const },
                { label: 'Téléphone mobile', value: user.telMobile, icon: 'smartphone' as const },
                { label: 'NCC', value: user.ncc, icon: 'account-balance' as const },
                { label: 'Agence', value: user.nomAgence, icon: 'apartment' as const },
             
              ].filter(f => f.value).map((field) => (
                <View key={field.label} style={[styles.profileRow, { borderBottomColor: mutedColor + '30' }]}>
                  <View style={[styles.profileIconWrap, { backgroundColor: tintColor + '18' }]}>
                    <MaterialIcons name={field.icon} size={18} color={tintColor} />
                  </View>
                  <View style={styles.profileTextWrap}>
                    <Text style={[styles.profileLabel, { color: mutedColor }]}>{field.label}</Text>
                    <Text style={[styles.profileValue, { color: textColor }]}>{field.value}</Text>
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
              onPress={() => router.push('/compte/qr')}
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
              onPress={() => router.push('/compte/mot-de-passe')}
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
              style={[
                styles.sectionTitle,
                { color: textColor, marginTop: 24 },
              ]}
            >
              Application
            </Text>

            <TouchableOpacity
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

          <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Tests des popups</Text>
            <Text style={[styles.popupTestDescription, { color: mutedColor }]}>Déclenchez les différents types de messages pour vérifier le module.</Text>

            <View style={styles.popupActionsRow}>
              <TouchableOpacity
                onPress={() => openPopup('error')}
                style={[styles.popupActionChip, { backgroundColor: '#fee2e2' }]}
              >
                <Text style={[styles.popupActionText, { color: '#b91c1c' }]}>Erreur</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openPopup('success')}
                style={[styles.popupActionChip, { backgroundColor: '#dcfce7' }]}
              >
                <Text style={[styles.popupActionText, { color: '#15803d' }]}>Succès</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openPopup('info')}
                style={[styles.popupActionChip, { backgroundColor: '#d1fae5' }]}
              >
                <Text style={[styles.popupActionText, { color: tintColor }]}>Info</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <AuthButton
            title={isLoading ? 'Déconnexion...' : 'Se déconnecter'}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 
  profileHero: {
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatarHeroWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarHeroImage: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  editBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  heroTextWrap: {
    alignItems: 'center',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
  },
  heroEmail: {
    marginTop: 4,
    fontSize: 14,
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
  },
  settingsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
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
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  profileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextWrap: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  popupTestDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  popupActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  popupActionChip: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  popupActionText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
