import { AppHeader } from '@/components/app-header';
import { useAuthContext } from '@/hooks/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getfetchDevisById, getfetchProduits, postDevisLigne } from '@/services/api-service';
import { sharedStyles } from '@/styles/shared.js';
import { formatAmount } from '@/tools/tools';
import { devis, devisLigneEdit, statusDevisColorMap } from '@/types/devis.type';
import { Produit } from '@/types/produits.type';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LocalLine = {
  idProduit: string;
  idDevisLigne?: string;
  designation: string;
  prixUnitaire: number;
  qteDevis: number;
};


export default function ProformaSaisieScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor } = useAppTheme();
  const { userToken } = useAuthContext();
  const router = useRouter();

  const [proforma, setProforma] = useState<devis | null>(null);
  const [lines, setLines] = useState<LocalLine[]>([]);
  const [products, setProducts] = useState<Produit[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  // Chargement initial : catalogue produits + proforma existante si mode édition
  useEffect(() => {
    const load = async () => {
      if (!userToken) { setIsLoading(false); return; }
      try {
        const [prod, dev] = await Promise.all([
          getfetchProduits(userToken),
          isEditMode ? getfetchDevisById(userToken, id!) : Promise.resolve(null),
        ]);
        setProducts(prod.data ?? []);
        if (dev) {
          setProforma(dev);
          setLines(
            (dev.details ?? []).map((l) => ({
              idProduit: l.id,
              idDevisLigne: l.id,
              designation: l.designation,
              prixUnitaire: l.prixVenteTTC,
              qteDevis: l.qteVendue,
            })),
          );
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, userToken, isEditMode]);

  // Après un appel API de ligne, recharger le détail proforma pour actualiser les totaux
  const refreshProforma = useCallback(async (devId: string) => {
    if (!userToken) return;
    const dev = await getfetchDevisById(userToken, devId);
    if (dev) {
      setProforma(dev);
      setLines(
        (dev.details ?? []).map((l) => ({
          idProduit: l.id,
          idDevisLigne: l.id,
          designation: l.designation,
          prixUnitaire: l.prixVenteTTC,
          qteDevis: l.qteVendue,
        })),
      );
    }
  }, [userToken]);

  

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.designation.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        (p.unit ?? '').toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const localTotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.prixUnitaire * line.qteDevis, 0),
    [lines],
  );
  const displayTotal = proforma?.totalNetPayer ?? localTotal;
  const displayHT = proforma?.totalHT ?? localTotal;
  const displayTaxe = proforma?.totalTaxe ?? 0;
  const totalUnits = useMemo(() => lines.reduce((sum, line) => sum + line.qteDevis, 0), [lines]);


  // Modification de quantité : mise à jour locale + appel API si proforma existante
  const handleQtyChange = useCallback(
    async (idProduit: string, rawValue: string) => {
      const qty = Math.max(0, parseInt(rawValue.replace(/[^0-9]/g, ''), 10) || 0);
      setLines((prev) => {
        if (qty === 0) {
          return prev.filter((line) => line.idProduit !== idProduit);
        }
        return prev.map((line) => (line.idProduit === idProduit ? { ...line, qteDevis: qty } : line));
      });
      if (proforma?.id && userToken && qty > 0) {
        const existing = lines.find((line) => line.idProduit === idProduit);
        const ligne: devisLigneEdit = {
          idDevis: proforma.id,
          idDevisLigne: existing?.idDevisLigne,
          qteDevis: qty,
          idProduit,
        };
        try {
          await postDevisLigne(userToken, ligne);
          await refreshProforma(proforma.id);
        } catch { /* géré par popup global */ }
      }
    },
    [proforma?.id, userToken, lines, refreshProforma],
  );

  // Suppression locale d'une ligne
  const removeLine = useCallback((idProduit: string) => {
    setLines((prev) => prev.filter((line) => line.idProduit !== idProduit));
  }, []);

  // Ajout d'un produit depuis le catalogue
  const addProduct = useCallback(
    async (product: Produit) => {
      if (lines.some((l) => l.idProduit === product.id)) {
        setShowCatalog(false);
        return;
      }
      setLines((prev) => [
        ...prev,
        { idProduit: product.id, designation: product.designation, prixUnitaire: product.prixVenteTTC, qteDevis: 1 },
      ]);
      setShowCatalog(false);
      setProductSearch('');
      if (proforma?.id && userToken) {
        const ligne: devisLigneEdit = { idDevis: proforma.id, qteDevis: 1, idProduit: product.id };
        try {
          await postDevisLigne(userToken, ligne);
          await refreshProforma(proforma.id);
        } catch { /* géré par popup global */ }
      }
    },
    [lines, proforma?.id, userToken, refreshProforma],
  );

  const handleSave = () => {
    if (lines.length === 0) {
      Alert.alert('Aucun article', "Ajoutez au moins un produit avant d'enregistrer.");
      return;
    }
    setIsSaving(true);
    // Ici : appel API création/validation proforma
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        isEditMode ? 'Proforma modifiée' : 'Proforma créée',
        isEditMode ? 'Les modifications ont été enregistrées.' : 'La proforma a été créée.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    }, 800);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader showBack title={isEditMode ? 'Modifier la proforma' : 'Nouvelle proforma'} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = proforma ? statusDevisColorMap[proforma.status] : tintColor;

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader
          showBack
          title={isEditMode ? 'Modifier la proforma' : 'Nouvelle proforma'}
          subtitle={proforma?.codeDevis ?? 'Saisie des articles'}
        />
      </View>

      <ScrollView contentContainerStyle={sharedStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.container}>

          {/* En-tête proforma en mode édition */}
          {proforma && (
            <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
              <View style={styles.infoTopRow}>
                <Text style={[styles.infoCode, { color: tintColor }]}>{proforma.codeDevis}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{proforma.status}</Text>
                </View>
              </View>
              {proforma.nomSousCompte ? (
                <Text style={[styles.infoClient, { color: textColor }]}>{proforma.nomSousCompte}</Text>
              ) : null}
              {proforma.nomAgence ? (
                <Text style={[styles.infoMeta, { color: mutedColor }]}>{proforma.nomAgence}</Text>
              ) : null}
            </View>
          )}

          {/* Section articles */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Articles</Text>
              <TouchableOpacity
                onPress={() => setShowCatalog((v) => !v)}
                style={[styles.addLineBtn, { backgroundColor: tintColor }]}
              >
                <MaterialIcons name={showCatalog ? 'close' : 'add'} size={18} color="#fff" />
                <Text style={styles.addLineBtnText}>{showCatalog ? 'Fermer' : 'Ajouter un produit'}</Text>
              </TouchableOpacity>
            </View>

            {/* Catalogue produits (collapsible) */}
            {showCatalog && (
              <View style={[styles.catalogBox, { backgroundColor: cardColor }]}>
                <TextInput
                  value={productSearch}
                  onChangeText={setProductSearch}
                  style={[styles.searchInput, { color: textColor, borderColor }]}
                  placeholder="Rechercher par désignation, référence…"
                  placeholderTextColor={mutedColor}
                />
                <FlatList
                  data={filteredProducts}
                  keyExtractor={(item) => item.id}
                  style={{ maxHeight: 300 }}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                  ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: `${borderColor}60` }} />}
                  renderItem={({ item: product }) => {
                    const alreadyAdded = lines.some((l) => l.idProduit === product.id);
                    return (
                      <TouchableOpacity
                        onPress={() => addProduct(product)}
                        disabled={alreadyAdded}
                        style={[styles.catalogRow, alreadyAdded && { opacity: 0.4 }]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.catalogLabel, { color: textColor }]} numberOfLines={1}>
                            {product.designation}
                          </Text>
                          <Text style={[styles.catalogMeta, { color: mutedColor }]}>
                            {product.reference}{product.unit ? ` · ${product.unit}` : ''}
                          </Text>
                        </View>
                        <Text style={[styles.catalogPrice, { color: tintColor }]}>
                          {formatAmount(product.prixVenteTTC)}
                        </Text>
                        <MaterialIcons
                          name={alreadyAdded ? 'check-circle' : 'add-circle-outline'}
                          size={22}
                          color={tintColor}
                          style={{ marginLeft: 10 }}
                        />
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <Text style={[styles.catalogEmpty, { color: mutedColor }]}>Aucun produit trouvé</Text>
                  }
                />
              </View>
            )}

            {/* Lignes du devis */}
            {lines.length === 0 ? (
              <View style={[styles.emptyLines, { backgroundColor: cardColor }]}>
                <MaterialIcons name="playlist-add" size={36} color={mutedColor} />
                <Text style={[styles.emptyLinesText, { color: mutedColor }]}>
                  Aucun article. Appuyez sur « Ajouter un produit » pour commencer.
                </Text>
              </View>
            ) : (
              <View style={styles.linesBlock}>
                {lines.map((line) => {
                  const lineTotal = line.prixUnitaire * line.qteDevis;
                  return (
                    <View key={line.idProduit} style={[styles.lineCard, { backgroundColor: cardColor }]}>
                      {/* Info produit */}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.lineDesignation, { color: textColor }]} numberOfLines={2}>
                          {line.designation}
                        </Text>
                        <Text style={[styles.linePrixUnit, { color: mutedColor }]}>
                          {formatAmount(line.prixUnitaire)} / unité
                        </Text>
                        <Text style={[styles.lineSubtotal, { color: tintColor }]}>
                          = {formatAmount(lineTotal)}
                        </Text>
                      </View>
                      {/* Contrôle quantité */}
                      <View style={styles.lineRightCol}>
                        <View style={[styles.qtyRow, { borderColor }]}>
                          <TouchableOpacity
                            onPress={() => handleQtyChange(line.idProduit, String(line.qteDevis - 1))}
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                          >
                            <MaterialIcons
                              name={line.qteDevis <= 1 ? 'delete-outline' : 'remove'}
                              size={20}
                              color={line.qteDevis <= 1 ? '#ef4444' : textColor}
                            />
                          </TouchableOpacity>
                          <TextInput
                            value={String(line.qteDevis)}
                            onChangeText={(v) => handleQtyChange(line.idProduit, v)}
                            keyboardType="number-pad"
                            selectTextOnFocus
                            style={[styles.qtyInput, { color: textColor, borderColor }]}
                          />
                          <TouchableOpacity
                            onPress={() => handleQtyChange(line.idProduit, String(line.qteDevis + 1))}
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                          >
                            <MaterialIcons name="add" size={20} color={textColor} />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => removeLine(line.idProduit)} style={styles.removeBtn}>
                          <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Synthèse des totaux */}
          {lines.length > 0 && (
            <View style={[styles.summaryCard, { backgroundColor: cardColor }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: mutedColor }]}>
                  {lines.length} article{lines.length !== 1 ? 's' : ''}
                </Text>
                <Text style={[styles.summaryLabel, { color: mutedColor }]}>
                  {totalUnits} unité{totalUnits !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: mutedColor }]}>Total HT</Text>
                <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(displayHT)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: mutedColor }]}>TVA</Text>
                <Text style={[styles.summaryValue, { color: textColor }]}>{formatAmount(displayTaxe)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: textColor }]}>Total</Text>
                <Text style={[styles.totalValue, { color: tintColor }]}>{formatAmount(displayTotal)}</Text>
              </View>
            </View>
          )}

          {/* Boutons d'action */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.secondaryBtn, { borderColor }]} onPress={() => router.back()}>
              <Text style={[styles.secondaryBtnText, { color: textColor }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={[styles.primaryBtn, { backgroundColor: tintColor, opacity: isSaving ? 0.7 : 1 }]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {isEditMode ? 'Enregistrer' : 'Créer la proforma'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    borderRadius: 18,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCode: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoClient: {
    fontSize: 17,
    fontWeight: '800',
  },
  infoMeta: {
    fontSize: 13,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  addLineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addLineBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  catalogBox: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  catalogLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  catalogMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  catalogPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  catalogEmpty: {
    textAlign: 'center',
    padding: 16,
    fontSize: 13,
  },
  emptyLines: {
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  emptyLinesText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  linesBlock: {
    gap: 10,
  },
  lineCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lineDesignation: {
    fontSize: 14,
    fontWeight: '700',
  },
  linePrixUnit: {
    fontSize: 12,
    marginTop: 3,
  },
  lineSubtotal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  lineRightCol: {
    alignItems: 'center',
    gap: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyInput: {
    fontSize: 15,
    fontWeight: '800',
    minWidth: 38,
    textAlign: 'center',
    paddingVertical: 2,
    borderBottomWidth: 1,
  },
  removeBtn: {
    padding: 4,
  },
  summaryCard: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
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
    marginVertical: 2,
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
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});


