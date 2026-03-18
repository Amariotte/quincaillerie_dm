import { AppHeader } from '@/components/app-header';
import { AuthButton } from '@/components/auth-button';
import { useAuthContext } from '@/hooks/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
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
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');

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
            } catch (err) {
              Alert.alert(
                'Erreur',
                err instanceof Error
                  ? err.message
                  : 'Erreur lors de la déconnexion'
              );
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <AppHeader title="Profil" subtitle="Informations et préférences du compte" />

          {/* User Info Card */}
          <View
            style={[
              styles.userCard,
              {
                backgroundColor: tintColor + '20',
                borderColor: tintColor,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: tintColor,
                },
              ]}
            >
              <MaterialIcons name="person" size={40} color="white" />
            </View>

            {user && (
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: textColor }]}>
                  {user?.nom ?? user.nom}
                </Text>
                <Text style={[styles.userEmail, { color: textColor, opacity: 0.6 }]}>
                  {user.email}
                </Text>
              </View>
            )}
          </View>

          {/* Fiche détaillée */}
          {user && (
            <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Informations personnelles</Text>
              {[
                { label: 'Représentant légal', value: user.representantLegal, icon: 'badge' as const },
                { label: 'Date de naissance', value: user.dateNaissance, icon: 'cake' as const },
                { label: 'Adresse', value: user.adresse, icon: 'place' as const },
                { label: 'Email', value: user.email, icon: 'email' as const },
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
          <View style={styles.settingsSection}>
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
              onPress={() => router.push('/compte/synchronisation')}
              style={[
                styles.settingItem,
                {
                  borderBottomColor: backgroundColor,
                },
              ]}
            >
              <View style={styles.settingItemLeft}>
                <MaterialIcons
                  name="settings"
                  size={24}
                  color={tintColor}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    Tout synchroniser
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: textColor, opacity: 0.6 },
                    ]}
                  >
                    Mettre à jour toutes les données locales
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
            title={isLoading ? 'Déconnexion...' : 'Se déconnecter'}
            onPress={handleLogout}
            loading={isLoading}
            disabled={isLoading}
            variant="secondary"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
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
});
