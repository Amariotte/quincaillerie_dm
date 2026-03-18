import { AppHeader } from '@/components/app-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const quickInsights = [
  { id: '1', title: 'Stock critique', detail: '8 produits à recompléter cette semaine', icon: 'inventory-2' },
  { id: '2', title: 'Clients à relancer', detail: '4 factures arrivent à échéance sous 48h', icon: 'support-agent' },
  { id: '3', title: 'Promotions actives', detail: '2 campagnes en cours sur le rayon peinture', icon: 'campaign' },
];

export default function ExploreScreen() {
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader title="Explorer" subtitle="Vue rapide des points d'attention" />

          <View style={[styles.heroCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.heroLabel, { color: mutedColor }]}>Vue opérationnelle</Text>
            <Text style={[styles.heroTitle, { color: textColor }]}>Priorités du jour</Text>
            <Text style={[styles.heroText, { color: mutedColor }]}>Suivez les éléments à traiter avant la clôture de la journée commerciale.</Text>
          </View>

          <View style={styles.cardsBlock}>
            {quickInsights.map((item) => (
              <View key={item.id} style={[styles.infoCard, { backgroundColor: cardColor }]}> 
                <View style={[styles.iconWrap, { backgroundColor: `${tintColor}18` }]}>
                  <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={tintColor} />
                </View>
                <View style={styles.cardTextBlock}>
                  <Text style={[styles.cardTitle, { color: textColor }]}>{item.title}</Text>
                  <Text style={[styles.cardDetail, { color: mutedColor }]}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </View>
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
    paddingBottom: 32,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 18,
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
  },
  heroLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  heroText: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },
  cardsBlock: {
    gap: 12,
  },
  infoCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardDetail: {
    fontSize: 13,
    marginTop: 5,
    lineHeight: 20,
  },
});
