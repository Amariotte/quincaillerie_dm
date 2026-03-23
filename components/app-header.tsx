import { useAuthContext } from '@/hooks/auth-context';
import COLORS from '@/styles/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
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

export function AppHeader({ title, subtitle, showBack = false, isOffline = false }: AppHeaderProps) {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();
  const headerBackgroundColor = COLORS.primaryColor;
  const headerTextColor = '#ffffff';
  const headerSubtextColor = '#d1fae5';

  const avatarUri = useMemo(() => {
    const identity = user?.email ?? user?.nom ?? 'utilisateur';
    return `https://i.pravatar.cc/160?u=${encodeURIComponent(identity)}`;
  }, [user?.email, user?.nom]);

  const defaultSubtitle = user
    ? `${user.nom} · ${user.email}`
    : 'Utilisateur connecté';

  return (
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
        onPress={() => router.push('/profile')}
        disabled={isLoading}
        style={[styles.avatarButton, { borderColor: '#ffffff' }]}
      >
        <Image source={avatarUri} style={styles.avatarImage} contentFit="cover" />
      </TouchableOpacity>
    </View>
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
});
