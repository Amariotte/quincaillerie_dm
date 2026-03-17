import { AppHeader } from '@/components/app-header';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ModuleListItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  amount: string;
  status: string;
};

type ModuleListScreenProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  items: ModuleListItem[];
  detailBasePath: string;
};

export function ModuleListScreen({ title, subtitle, icon, items, detailBasePath }: ModuleListScreenProps) {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'text');
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length === 0) {
      return items;
    }

    return items.filter((item) =>
      [item.title, item.subtitle, item.date, item.status, item.amount]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [items, query]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title={title} subtitle={subtitle} />

          <View style={[styles.searchBox, { backgroundColor: cardColor, borderColor }]}> 
            <MaterialIcons name="search" size={20} color={mutedColor} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Rechercher dans ${title.toLowerCase()}`}
              placeholderTextColor={mutedColor}
              style={[styles.searchInput, { color: textColor }]}
            />
          </View>

          <View style={styles.listBlock}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`${detailBasePath}/${item.id}` as never)}
                style={[styles.itemCard, { backgroundColor: cardColor }]}
              >
                <View style={styles.itemTopRow}>
                  <View style={[styles.iconWrap, { backgroundColor: `${tintColor}18` }]}>
                    <MaterialIcons name={icon} size={20} color={tintColor} />
                  </View>
                  <View style={styles.itemMain}>
                    <Text style={[styles.itemTitle, { color: textColor }]}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: mutedColor }]}>{item.subtitle}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={mutedColor} />
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: mutedColor }]}>{item.date}</Text>
                  <Text style={[styles.metaText, { color: textColor }]}>{item.amount}</Text>
                  <Text style={[styles.statusText, { color: tintColor }]}>{item.status}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {filteredItems.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: cardColor }]}> 
                <MaterialIcons name="inbox" size={26} color={mutedColor} />
                <Text style={[styles.emptyTitle, { color: textColor }]}>Aucun résultat</Text>
                <Text style={[styles.emptyText, { color: mutedColor }]}>Aucune donnée ne correspond à votre recherche.</Text>
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
  searchBox: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  listBlock: { gap: 12 },
  itemCard: {
    borderRadius: 20,
    padding: 14,
    gap: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  itemTopRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemMain: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '800' },
  itemSubtitle: { fontSize: 12, marginTop: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  metaText: { fontSize: 12 },
  statusText: { fontSize: 12, fontWeight: '800' },
  emptyCard: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
