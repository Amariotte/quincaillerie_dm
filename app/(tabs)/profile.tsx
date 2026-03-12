import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuthContext } from '@/hooks/auth-context';
import { AuthButton } from '@/components/auth-button';

export default function ProfileScreen() {
  const { user, signOut, isLoading } = useAuthContext();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

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
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: textColor }]}>Profil</Text>
          </View>

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
                  {user.name}
                </Text>
                <Text
                  style={[
                    styles.userEmail,
                    {
                      color: textColor,
                      opacity: 0.6,
                    },
                  ]}
                >
                  {user.email}
                </Text>
              </View>
            )}
          </View>

          {/* Settings Sections */}
          <View style={styles.settingsSection}>
            {/* Account Settings */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Compte
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
                  name="person"
                  size={24}
                  color={tintColor}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    Modifier le profil
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: textColor, opacity: 0.6 },
                    ]}
                  >
                    Mettre à jour vos informations
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
                  name="settings"
                  size={24}
                  color={tintColor}
                  style={styles.settingIcon}
                />
                <View>
                  <Text style={[styles.settingLabel, { color: textColor }]}>
                    Paramètres
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: textColor, opacity: 0.6 },
                    ]}
                  >
                    Gérer les préférences
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
});
