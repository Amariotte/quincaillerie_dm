import { AppHeader } from '@/components/app-header';
import { ModuleListItem } from '@/components/module-list-screen';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ModuleDetailScreenProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  item: ModuleListItem | undefined;
};

export function ModuleDetailScreen({ title, subtitle, icon, item }: ModuleDetailScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');

  if (!item) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <AppHeader showBack title={title} subtitle="Détail introuvable" />
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
              <MaterialIcons name="error-outline" size={28} color="#dc2626" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Élément introuvable</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>Ce détail n’existe pas ou n’est plus disponible.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title={title} subtitle={subtitle} />

          <View style={[styles.headerCard, { backgroundColor: cardColor }]}> 
            <View style={[styles.iconWrap, { backgroundColor: `${tintColor}18` }]}>
              <MaterialIcons name={icon} size={24} color={tintColor} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.itemTitle, { color: textColor }]}>{item.title}</Text>
              <Text style={[styles.itemSubtitle, { color: mutedColor }]}>{item.subtitle}</Text>
            </View>
          </View>

          <View style={[styles.detailCard, { backgroundColor: cardColor }]}> 
            <View style={styles.row}>
              <Text style={[styles.label, { color: mutedColor }]}>Référence</Text>
              <Text style={[styles.value, { color: textColor }]}>{item.id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: mutedColor }]}>Date</Text>
              <Text style={[styles.value, { color: textColor }]}>{item.date}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: mutedColor }]}>Montant / Valeur</Text>
              <Text style={[styles.value, { color: textColor }]}>{item.amount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: mutedColor }]}>Statut</Text>
              <Text style={[styles.status, { color: tintColor }]}>{item.status}</Text>
            </View>
            {item.palier ? (
              <View style={styles.row}>
                <Text style={[styles.label, { color: mutedColor }]}>Palier</Text>
                <Text style={[styles.value, { color: textColor }]}>{item.palier}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  container: { paddingHorizontal: 18, paddingTop: 12, gap: 16 },
  headerCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: { flex: 1 },
  itemTitle: { fontSize: 17, fontWeight: '800' },
  itemSubtitle: { fontSize: 13, marginTop: 4 },
  detailCard: {
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { fontSize: 13 },
  value: { fontSize: 14, fontWeight: '700' },
  status: { fontSize: 14, fontWeight: '800' },
  emptyCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
