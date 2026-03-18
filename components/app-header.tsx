import COLORS from '@/constants/colors';
import { useAuthContext } from '@/hooks/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  isOffline?: boolean;
};

type MenuAction = 'qr' | 'password' | 'sync' | 'logout';

const menuEntries: Array<{
  id: MenuAction;
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}> = [
  {
    id: 'qr',
    label: 'Mon code QR',
    description: 'Afficher votre identifiant visuel',
    icon: 'qr-code-2',
  },
  {
    id: 'password',
    label: 'Modifier le mot de passe',
    description: 'Mettre à jour vos accès',
    icon: 'lock-reset',
  },
  {
    id: 'sync',
    label: 'Tout synchroniser',
    description: 'Lancer la mise à jour des données',
    icon: 'sync',
  },
  {
    id: 'logout',
    label: 'Se déconnecter',
    description: 'Fermer la session en cours',
    icon: 'logout',
  },
];

export function AppHeader({ title, subtitle, showBack = false, isOffline = false }: AppHeaderProps) {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuthContext();
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'text');
  const headerBackgroundColor = COLORS.primaryColor;
  const headerTextColor = '#ffffff';
  const headerSubtextColor = '#d1fae5';
  const [menuVisible, setMenuVisible] = useState(false);

  const avatarUri = useMemo(() => {
    const identity = user?.email ?? user?.name ?? 'utilisateur';
    return `https://i.pravatar.cc/160?u=${encodeURIComponent(identity)}`;
  }, [user?.email, user?.name]);

  const defaultSubtitle = user
    ? `${user.name} · ${user.email}`
    : 'Utilisateur connecté';

  const handleMenuAction = (action: MenuAction) => {
    setMenuVisible(false);

    if (action === 'qr') {
      router.push('/compte/qr');
      return;
    }

    if (action === 'password') {
      router.push('/compte/mot-de-passe');
      return;
    }

    if (action === 'sync') {
      router.push('/compte/synchronisation');
      return;
    }

    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err) {
            Alert.alert(
              'Erreur',
              err instanceof Error ? err.message : 'Erreur lors de la déconnexion'
            );
          }
        },
      },
    ]);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: headerBackgroundColor }]}> 
        <View style={styles.leftGroup}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: '#ffffff1f', borderColor: '#ffffff55' }]}
            >
              <MaterialIcons name="arrow-back" size={20} color={headerTextColor} />
            </TouchableOpacity>
          ) : null}
          <View style={styles.textBlock}>
            <Text style={[styles.appName, { color: headerSubtextColor }]}>Gediscom</Text>
            <Text style={[styles.pageTitle, { color: headerTextColor }]}>{title}</Text>
            <Text style={[styles.pageSubtitle, { color: headerSubtextColor }]} numberOfLines={1}>
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
          onPress={() => setMenuVisible(true)}
          disabled={isLoading}
          style={[styles.avatarButton, { borderColor: '#ffffff' }]}
        >
          <Image source={avatarUri} style={styles.avatarImage} contentFit="cover" />
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={[styles.menuCard, { backgroundColor: cardColor }]}>
            <View style={[styles.menuHeader, { borderBottomColor: borderColor }]}>
              <Image source={avatarUri} style={styles.menuAvatar} contentFit="cover" />
              <View style={styles.menuIdentity}>
                <Text style={[styles.menuName, { color: textColor }]}>{user?.name ?? 'Utilisateur'}</Text>
                <Text style={[styles.menuEmail, { color: mutedColor }]}>{user?.email ?? 'Aucun email'}</Text>
              </View>
            </View>

            {menuEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                onPress={() => handleMenuAction(entry.id)}
                style={[styles.menuItem, { borderBottomColor: borderColor }]}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: `${tintColor}18` }]}>
                  <MaterialIcons name={entry.icon} size={20} color={tintColor} />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={[styles.menuItemLabel, { color: textColor }]}>{entry.label}</Text>
                  <Text style={[styles.menuItemDescription, { color: mutedColor }]}>{entry.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={mutedColor} />
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  leftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  appName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  offlineBadgeText: {
    color: '#fef3c7',
    fontSize: 11,
    fontWeight: '700',
  },
  avatarButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.36)',
    justifyContent: 'flex-start',
    paddingTop: 86,
    paddingHorizontal: 18,
  },
  menuCard: {
    borderRadius: 24,
    marginLeft: 54,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  menuAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  menuIdentity: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '800',
  },
  menuEmail: {
    fontSize: 13,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  menuItemDescription: {
    fontSize: 12,
    marginTop: 3,
  },
});
