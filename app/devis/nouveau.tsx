import { AppHeader } from '@/components/app-header';
import { quoteClients, quoteProducts } from '@/data/fakeDatas/devis';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type QuoteLine = {
  productId: string;
  quantity: number;
};

const formatAmount = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;

export default function NouveauDevisScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'text');
  const [selectedClientId, setSelectedClientId] = useState(quoteClients[0]?.id ?? '');
  const [quoteTitle, setQuoteTitle] = useState('Fournitures chantier résidence Kintambo');
  const [validityDays, setValidityDays] = useState('15');
  const [notes, setNotes] = useState('Livraison en deux vagues selon disponibilité du stock.');
  const [lines, setLines] = useState<QuoteLine[]>([
    { productId: 'prod-1', quantity: 12 },
    { productId: 'prod-4', quantity: 20 },
  ]);

  const selectedClient = quoteClients.find((client) => client.id === selectedClientId) ?? quoteClients[0];

  const addProduct = (productId: string) => {
    setLines((currentLines) => {
      const existingLine = currentLines.find((line) => line.productId === productId);

      if (existingLine) {
        return currentLines.map((line) =>
          line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line
        );
      }

      return [...currentLines, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, direction: 'increase' | 'decrease') => {
    setLines((currentLines) =>
      currentLines
        .map((line) => {
          if (line.productId !== productId) {
            return line;
          }

          const nextQuantity = direction === 'increase' ? line.quantity + 1 : line.quantity - 1;
          return { ...line, quantity: nextQuantity };
        })
        .filter((line) => line.quantity > 0)
    );
  };

  const subtotal = lines.reduce((sum, line) => {
    const product = quoteProducts.find((item) => item.id === line.productId);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);
  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + tax;

  const handleSubmit = () => {
    Alert.alert('Devis créé', 'Le nouveau devis a été enregistré en brouillon.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AppHeader showBack title="Nouveau devis" subtitle="Préparez une proposition commerciale claire" />

          <View style={[styles.heroCard, { backgroundColor: cardColor }]}> 
            <Text style={[styles.heroLabel, { color: mutedColor }]}>Client sélectionné</Text>
            <Text style={[styles.heroTitle, { color: textColor }]}>{selectedClient?.name}</Text>
            <Text style={[styles.heroSubtitle, { color: mutedColor }]}>{selectedClient?.sector}</Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Client</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clientsRow}>
              {quoteClients.map((client) => {
                const isActive = client.id === selectedClientId;

                return (
                  <TouchableOpacity
                    key={client.id}
                    onPress={() => setSelectedClientId(client.id)}
                    style={[
                      styles.clientChip,
                      {
                        backgroundColor: isActive ? tintColor : cardColor,
                        borderColor: isActive ? tintColor : borderColor,
                      },
                    ]}
                  >
                    <Text style={[styles.clientName, { color: isActive ? '#ffffff' : textColor }]}>{client.name}</Text>
                    <Text style={[styles.clientSector, { color: isActive ? '#e5f3ff' : mutedColor }]}>{client.sector}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Informations du devis</Text>
            <View style={[styles.formCard, { backgroundColor: cardColor }]}> 
              <Text style={[styles.inputLabel, { color: mutedColor }]}>Objet</Text>
              <TextInput
                value={quoteTitle}
                onChangeText={setQuoteTitle}
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Objet du devis"
                placeholderTextColor={mutedColor}
              />
              <Text style={[styles.inputLabel, { color: mutedColor }]}>Validité (jours)</Text>
              <TextInput
                value={validityDays}
                onChangeText={setValidityDays}
                keyboardType="number-pad"
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="15"
                placeholderTextColor={mutedColor}
              />
              <Text style={[styles.inputLabel, { color: mutedColor }]}>Notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                style={[styles.input, styles.notesInput, { color: textColor, borderColor }]}
                placeholder="Conditions ou remarques"
                placeholderTextColor={mutedColor}
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Catalogue rapide</Text>
            <View style={styles.productsGrid}>
              {quoteProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => addProduct(product.id)}
                  style={[styles.productCard, { backgroundColor: cardColor }]}
                >
                  <Text style={[styles.productLabel, { color: textColor }]}>{product.label}</Text>
                  <Text style={[styles.productMeta, { color: mutedColor }]}>{product.unit}</Text>
                  <Text style={[styles.productPrice, { color: tintColor }]}>{formatAmount(product.price)}</Text>
                  <View style={[styles.addButton, { backgroundColor: `${tintColor}18` }]}>
                    <MaterialIcons name="add" size={16} color={tintColor} />
                    <Text style={[styles.addButtonText, { color: tintColor }]}>Ajouter</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Lignes du devis</Text>
            <View style={styles.linesBlock}>
              {lines.map((line) => {
                const product = quoteProducts.find((item) => item.id === line.productId);

                if (!product) {
                  return null;
                }

                return (
                  <View key={line.productId} style={[styles.lineCard, { backgroundColor: cardColor }]}> 
                    <View style={styles.lineInfo}>
                      <Text style={[styles.lineTitle, { color: textColor }]}>{product.label}</Text>
                      <Text style={[styles.lineMeta, { color: mutedColor }]}>
                        {formatAmount(product.price)} / {product.unit}
                      </Text>
                    </View>
                    <View style={styles.lineRight}>
                      <View style={[styles.quantityBox, { borderColor }]}> 
                        <TouchableOpacity onPress={() => updateQuantity(product.id, 'decrease')}>
                          <MaterialIcons name="remove" size={18} color={textColor} />
                        </TouchableOpacity>
                        <Text style={[styles.quantityValue, { color: textColor }]}>{line.quantity}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(product.id, 'increase')}>
                          <MaterialIcons name="add" size={18} color={textColor} />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.lineTotal, { color: textColor }]}>{formatAmount(product.price * line.quantity)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: cardColor }]}> 
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>Sous-total</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: mutedColor }]}>TVA 16%</Text>
              <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(tax)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: textColor }]}>Total devis</Text>
              <Text style={[styles.totalValue, { color: tintColor }]}>{formatAmount(total)}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor }]}>
              <Text style={[styles.secondaryButtonText, { color: textColor }]}>Enregistrer brouillon</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={[styles.primaryButton, { backgroundColor: tintColor }]}>
              <Text style={styles.primaryButtonText}>Créer le devis</Text>
            </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTextBlock: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginTop: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  clientsRow: {
    gap: 12,
    paddingRight: 12,
  },
  clientChip: {
    width: 220,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '800',
  },
  clientSector: {
    fontSize: 12,
    marginTop: 6,
  },
  formCard: {
    borderRadius: 20,
    padding: 16,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  productsGrid: {
    gap: 12,
  },
  productCard: {
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  productLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  productMeta: {
    fontSize: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  addButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
  linesBlock: {
    gap: 12,
  },
  lineCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  lineInfo: {
    flex: 1,
  },
  lineTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  lineMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  lineRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '800',
    minWidth: 18,
    textAlign: 'center',
  },
  lineTotal: {
    fontSize: 14,
    fontWeight: '800',
  },
  summaryCard: {
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  actionRow: {
    gap: 12,
    marginTop: 4,
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
