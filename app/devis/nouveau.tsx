import { AppHeader } from "@/components/app-header";
import {
  ConfirmationPopup,
  FeedbackPopupType,
  MessagePopup,
} from "@/components/ui/feedback-popup";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  deleteDevisLigne,
  getAllProduits,
  getfetchDevisById,
  getfetchSousComptes,
  postDevisLigne,
  postValidateDevis,
  updateDevisLigne,
} from "@/services/api-service";
import { sharedStyles } from "@/styles/shared.js";
import { formatAmount } from "@/tools/tools";
import { devis, devisLigneEdit, statusDevisColorMap } from "@/types/devis.type";
import { Produit } from "@/types/produits.type";
import { sousCompte } from "@/types/sousCompte.type";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LocalLine = {
  idProduit: string;
  idDevisLigne?: string;
  designation: string;
  prixUnitaire: number;
  qteDevis: number;
};

const mapDevisToLocalLines = (dev: devis): LocalLine[] =>
  (dev.details ?? []).map((l) => ({
    idProduit: l.idProduit,
    idDevisLigne: l.id,
    designation: l.designation,
    prixUnitaire: l.prixVenteTTC,
    qteDevis: l.qteVendue,
  }));

export default function ProformaSaisieScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const {
    backgroundColor,
    textColor,
    tintColor,
    cardColor,
    mutedColor,
    borderColor,
  } = useAppTheme();
  const { userToken } = useAuthContext();
  const router = useRouter();

  const [proforma, setProforma] = useState<devis | null>(null);
  const [lines, setLines] = useState<LocalLine[]>([]);
  const [products, setProducts] = useState<Produit[]>([]);
  const [sousComptes, setSousComptes] = useState<sousCompte[]>([]);
  const [sousCompteSearch, setSousCompteSearch] = useState("");
  const [selectedSousCompteId, setSelectedSousCompteId] = useState<
    string | null
  >(null);
  const [selectedSousCompteName, setSelectedSousCompteName] = useState("");
  const [showSousCompteList, setShowSousCompteList] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [messagePopupVisible, setMessagePopupVisible] = useState(false);
  const [messagePopupType, setMessagePopupType] =
    useState<FeedbackPopupType>("info");
  const [messagePopupTitle, setMessagePopupTitle] = useState("Information");
  const [messagePopupMessage, setMessagePopupMessage] = useState("");
  const [messagePopupButtonLabel, setMessagePopupButtonLabel] =
    useState("Fermer");
  const [messagePopupCloseAction, setMessagePopupCloseAction] = useState<
    (() => void) | null
  >(null);

  const [confirmPopupVisible, setConfirmPopupVisible] = useState(false);
  const [confirmPopupTitle, setConfirmPopupTitle] = useState("Confirmation");
  const [confirmPopupMessage, setConfirmPopupMessage] = useState("");
  const [confirmPopupConfirmLabel, setConfirmPopupConfirmLabel] =
    useState("Valider");
  const [confirmPopupCancelLabel, setConfirmPopupCancelLabel] =
    useState("Annuler");
  const [confirmPopupAction, setConfirmPopupAction] = useState<
    (() => void) | null
  >(null);

  const openMessagePopup = useCallback(
    (
      type: FeedbackPopupType,
      title: string,
      message: string,
      buttonLabel = "Fermer",
      onCloseAction?: () => void,
    ) => {
      setMessagePopupType(type);
      setMessagePopupTitle(title);
      setMessagePopupMessage(message);
      setMessagePopupButtonLabel(buttonLabel);
      setMessagePopupCloseAction(() => onCloseAction ?? null);
      setMessagePopupVisible(true);
    },
    [],
  );

  const closeMessagePopup = useCallback(() => {
    setMessagePopupVisible(false);
    const action = messagePopupCloseAction;
    setMessagePopupCloseAction(null);
    if (action) {
      action();
    }
  }, [messagePopupCloseAction]);

  const openConfirmationPopup = useCallback(
    (
      title: string,
      message: string,
      onConfirmAction: () => void,
      confirmLabel = "Valider",
      cancelLabel = "Annuler",
    ) => {
      setConfirmPopupTitle(title);
      setConfirmPopupMessage(message);
      setConfirmPopupConfirmLabel(confirmLabel);
      setConfirmPopupCancelLabel(cancelLabel);
      setConfirmPopupAction(() => onConfirmAction);
      setConfirmPopupVisible(true);
    },
    [],
  );

  const closeConfirmationPopup = useCallback(() => {
    setConfirmPopupVisible(false);
    setConfirmPopupAction(null);
  }, []);

  const confirmPopup = useCallback(() => {
    const action = confirmPopupAction;
    setConfirmPopupVisible(false);
    setConfirmPopupAction(null);
    if (action) {
      action();
    }
  }, [confirmPopupAction]);

  const applyUpdatedDevis = useCallback((dev: devis | null) => {
    if (!dev) {
      return;
    }

    setProforma(dev);
    setLines(mapDevisToLocalLines(dev));
    setSelectedSousCompteName(dev.nomSousCompte ?? "");
  }, []);

  // Chargement initial : proforma + sous-comptes (bloquant) puis produits (arrière-plan)
  useEffect(() => {
    const load = async () => {
      if (!userToken) {
        setIsLoading(false);
        setIsLoadingProducts(false);
        return;
      }
      // 1. Charger la proforma et les sous-comptes — bloque l'affichage
      try {
        const [dev, sousCompteResp] = await Promise.all([
          isEditMode
            ? getfetchDevisById(userToken, id!)
            : Promise.resolve(null),
          getfetchSousComptes(userToken),
        ]);
        setSousComptes(sousCompteResp.data ?? []);
        if (dev) {
          applyUpdatedDevis(dev);
        }
        if (dev?.nomSousCompte && sousCompteResp.data) {
          const matched = sousCompteResp.data.find(
            (sc) => sc.nom === dev.nomSousCompte,
          );
          if (matched) {
            setSelectedSousCompteId(matched.id);
          }
        }
      } catch {
        // En cas d'erreur réseau, on garde un formulaire utilisable.
        setSousComptes([]);
      } finally {
        setIsLoading(false); // formulaire visible dès maintenant
      }
      // 2. Charger tous les produits en arrière-plan (non-bloquant)
      try {
        const prod = await getAllProduits(userToken);
        setProducts(prod.data ?? []);
      } catch {
        // échec silencieux — catalogue vide
      } finally {
        setIsLoadingProducts(false);
      }
    };
    void load();
  }, [applyUpdatedDevis, id, userToken, isEditMode]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        (p.designation ?? "").toLowerCase().includes(q) ||
        (p.reference ?? "").toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const filteredSousComptes = useMemo(() => {
    const q = sousCompteSearch.trim().toLowerCase();
    if (!q) return sousComptes;
    return sousComptes.filter(
      (sc) =>
        (sc.nom ?? "").toLowerCase().includes(q) ||
        (sc.ncc ?? "").toLowerCase().includes(q),
    );
  }, [sousComptes, sousCompteSearch]);

  const hasSousCompteOptions = sousComptes.length > 0;

  const selectedSousCompteLabel = useMemo(() => {
    if (selectedSousCompteName.trim()) {
      return selectedSousCompteName;
    }

    if (!selectedSousCompteId) {
      return "Compte principal";
    }

    const found = sousComptes.find((sc) => sc.id === selectedSousCompteId);
    return found?.nom ?? "Compte principal";
  }, [selectedSousCompteId, selectedSousCompteName, sousComptes]);

  const handleSelectSousCompte = useCallback(
    async (nextSousCompte: sousCompte | null) => {
      setSelectedSousCompteId(nextSousCompte?.id ?? null);
      setSelectedSousCompteName(nextSousCompte?.nom ?? "");
      setShowSousCompteList(false);

      const devisId = proforma?.id;
      const updatableLines = lines.filter((line) => line.idDevisLigne);

      if (!devisId || !userToken || updatableLines.length === 0) {
        return;
      }

      try {
        let updatedDevis: devis | null = null;
        for (const currentLine of updatableLines) {
          const payload: devisLigneEdit = {
            qte: currentLine.qteDevis,
            produitId: currentLine.idProduit,
            sousCompteId: nextSousCompte?.id,
          };

          updatedDevis = await updateDevisLigne(
            userToken,
            devisId,
            currentLine.idDevisLigne!,
            payload,
          );
        }

        applyUpdatedDevis(updatedDevis);
      } catch {
        // error displayed globally by api-client
      }
    },
    [applyUpdatedDevis, lines, proforma?.id, userToken],
  );

  const localTotal = useMemo(
    () =>
      lines.reduce((sum, line) => sum + line.prixUnitaire * line.qteDevis, 0),
    [lines],
  );
  const displayTotal = proforma?.totalNetPayer ?? localTotal;
  const displayHT = proforma?.totalHT ?? localTotal;
  const displayTaxe = proforma?.totalTaxe ?? 0;
  const totalUnits = useMemo(
    () => lines.reduce((sum, line) => sum + line.qteDevis, 0),
    [lines],
  );

  // Modification de quantité : mise à jour locale + appel API si proforma existante
  const handleQtyChange = useCallback(
    async (line: LocalLine, rawValue: string) => {
      const qty = Math.max(
        0,
        parseInt(rawValue.replace(/[^0-9]/g, ""), 10) || 0,
      );

      setLines((prev) => {
        if (qty === 0) {
          return prev.filter(
            (currentLine) => currentLine.idDevisLigne !== line.idDevisLigne,
          );
        }

        return prev.map((currentLine) =>
          currentLine.idDevisLigne === line.idDevisLigne
            ? { ...currentLine, qteDevis: qty }
            : currentLine,
        );
      });

      if (!proforma?.id || !userToken) {
        return;
      }

      try {
        if (qty === 0) {
          if (line.idDevisLigne) {
            const updatedDevis = await deleteDevisLigne(
              userToken,
              proforma.id,
              line.idDevisLigne,
              { sousCompteId: selectedSousCompteId ?? undefined },
            );
            applyUpdatedDevis(updatedDevis);
          }
          return;
        }

        const payload: devisLigneEdit = {
          qte: qty,
          produitId: line.idProduit,
          sousCompteId: selectedSousCompteId ?? undefined,
        };

        if (line.idDevisLigne) {
          const updatedDevis = await updateDevisLigne(
            userToken,
            proforma.id,
            line.idDevisLigne,
            payload,
          );
          applyUpdatedDevis(updatedDevis);
        } else {
          const updatedDevis = await postDevisLigne(
            userToken,
            payload,
            proforma.id,
          );
          applyUpdatedDevis(updatedDevis);
        }
      } catch {
        // error displayed globally by api-client
      }
    },
    [applyUpdatedDevis, proforma?.id, selectedSousCompteId, userToken],
  );

  // Suppression locale d'une ligne
  const removeLine = useCallback(
    async (line: LocalLine) => {
      setLines((prev) =>
        prev.filter(
          (currentLine) => currentLine.idDevisLigne !== line.idDevisLigne,
        ),
      );

      if (!proforma?.id || !userToken || !line.idDevisLigne) {
        return;
      }

      try {
        const updatedDevis = await deleteDevisLigne(
          userToken,
          proforma.id,
          line.idDevisLigne,
          { sousCompteId: selectedSousCompteId ?? undefined },
        );
        applyUpdatedDevis(updatedDevis);
      } catch {
        // error displayed globally by api-client
      }
    },
    [applyUpdatedDevis, proforma?.id, selectedSousCompteId, userToken],
  );

  // Ajout d'un produit depuis le catalogue
  const addProduct = useCallback(
    async (product: Produit) => {
      if (lines.some((l) => l.idProduit === product.id)) {
        setShowCatalog(false);
        return;
      }

      setShowCatalog(false);
      setProductSearch("");
      if (userToken) {
        const ligne: devisLigneEdit = {
          qte: 1,
          produitId: product.id,
          sousCompteId: selectedSousCompteId ?? undefined,
        };
        try {
          setIsSaving(true);
          const updatedDevis = await postDevisLigne(
            userToken,
            ligne,
            proforma?.id,
          );
          applyUpdatedDevis(updatedDevis);
        } catch {
          // error displayed globally by api-client
        } finally {
          setIsSaving(false);
        }
      }
    },
    [applyUpdatedDevis, lines, proforma?.id, selectedSousCompteId, userToken],
  );

  const handleValidate = useCallback(async () => {
    const token = userToken;
    const devisId = proforma?.id;

    if (lines.length === 0) {
      openMessagePopup(
        "info",
        "Aucun article",
        "Ajoutez au moins un produit avant de valider.",
      );
      return;
    }
    if (!token || !devisId) {
      openMessagePopup(
        "error",
        "Erreur",
        "Impossible de valider le devis pour le moment.",
      );
      return;
    }

    setIsSaving(true);
    try {
      await postValidateDevis(token, devisId);

      openMessagePopup(
        "success",
        "Devis validé",
        "Le devis a été validé.",
        "OK",
        () => router.back(),
      );
    } catch {
      // error displayed globally by api-client
    } finally {
      setIsSaving(false);
    }
  }, [lines.length, openMessagePopup, proforma?.id, router, userToken]);

  const handleValidateRequest = useCallback(() => {
    if (lines.length === 0) {
      openMessagePopup(
        "info",
        "Aucun article",
        "Ajoutez au moins un produit avant de valider.",
      );
      return;
    }
    if (!userToken || !proforma?.id) {
      openMessagePopup(
        "error",
        "Erreur",
        "Impossible de valider le devis pour le moment.",
      );
      return;
    }
    openConfirmationPopup(
      "Confirmer la validation",
      "Le devis sera validé et ne pourra plus être modifié. Continuer ?",
      handleValidate,
      "Valider",
      "Annuler",
    );
  }, [
    lines.length,
    userToken,
    proforma?.id,
    openMessagePopup,
    openConfirmationPopup,
    handleValidate,
  ]);

  const handleSave = useCallback(() => {
    if (lines.length === 0) {
      openMessagePopup(
        "info",
        "Aucun article",
        "Ajoutez au moins un produit avant d'enregistrer.",
      );
      return;
    }
    if (!proforma?.id) {
      openMessagePopup(
        "error",
        "Erreur",
        "Le devis n'a pas pu être créé. Veuillez ajouter un produit.",
      );
      return;
    }
    openMessagePopup(
      "success",
      "Devis enregistré",
      `Le devis ${proforma.codeDevis} a été enregistré avec succès.`,
      "OK",
      () => router.back(),
    );
  }, [lines.length, openMessagePopup, proforma, router]);

  if (isLoading) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader
            showBack
            title={isEditMode ? "Modifier le devis" : "Nouveau devis"}
          />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = proforma
    ? statusDevisColorMap[proforma.status]
    : tintColor;

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader
          showBack
          title={isEditMode ? "Modifier le devis" : "Nouveau devis"}
          subtitle={proforma?.codeDevis ?? "Saisie des articles"}
        />
      </View>

      <ScrollView
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={sharedStyles.container}>
          {/* En-tête proforma en mode édition */}
          {proforma && (
            <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
              <View style={styles.infoTopRow}>
                <Text style={[styles.infoCode, { color: tintColor }]}>
                  {proforma.codeDevis}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${statusColor}18` },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {proforma.status}
                  </Text>
                </View>
              </View>
              {proforma.nomAgence ? (
                <Text style={[styles.infoMeta, { color: mutedColor }]}>
                  {proforma.nomAgence}
                </Text>
              ) : null}
            </View>
          )}

          {/* Section articles */}
          {hasSousCompteOptions && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Sous-compte
              </Text>
              <TouchableOpacity
                disabled={!hasSousCompteOptions}
                onPress={() => setShowSousCompteList(true)}
                style={[
                  styles.sousComptePicker,
                  {
                    backgroundColor: cardColor,
                    borderColor,
                    opacity: hasSousCompteOptions ? 1 : 0.85,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sousCompteLabel, { color: mutedColor }]}>
                    Sélectionner un sous-compte (optionnel)
                  </Text>
                  <Text
                    style={[styles.sousCompteValue, { color: textColor }]}
                    numberOfLines={1}
                  >
                    {selectedSousCompteLabel}
                  </Text>
                </View>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={28}
                  color={mutedColor}
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Articles
              </Text>
              <TouchableOpacity
                onPress={() => setShowCatalog(true)}
                style={[styles.addLineBtn, { backgroundColor: tintColor }]}
              >
                <MaterialIcons name="add" size={18} color="#fff" />
                <Text style={styles.addLineBtnText}>Ajouter un produit</Text>
              </TouchableOpacity>
            </View>

            {/* Lignes du devis */}
            {lines.length === 0 ? (
              <View style={[styles.emptyLines, { backgroundColor: cardColor }]}>
                <MaterialIcons
                  name="playlist-add"
                  size={36}
                  color={mutedColor}
                />
                <Text style={[styles.emptyLinesText, { color: mutedColor }]}>
                  Aucun article. Appuyez sur « Ajouter un produit » pour
                  commencer.
                </Text>
              </View>
            ) : (
              <View style={styles.linesBlock}>
                {lines.map((line) => {
                  const lineTotal = line.prixUnitaire * line.qteDevis;
                  return (
                    <View
                      key={line.idProduit}
                      style={[styles.lineCard, { backgroundColor: cardColor }]}
                    >
                      {/* Info produit */}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.lineDesignation, { color: textColor }]}
                          numberOfLines={2}
                        >
                          {line.designation}
                        </Text>
                        <Text
                          style={[styles.linePrixUnit, { color: mutedColor }]}
                        >
                          {formatAmount(line.prixUnitaire)} / unité
                        </Text>
                        <Text
                          style={[styles.lineSubtotal, { color: tintColor }]}
                        >
                          = {formatAmount(lineTotal)}
                        </Text>
                      </View>
                      {/* Contrôle quantité */}
                      <View style={styles.lineRightCol}>
                        <View style={[styles.qtyRow, { borderColor }]}>
                          <TouchableOpacity
                            onPress={() =>
                              handleQtyChange(line, String(line.qteDevis - 1))
                            }
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                          >
                            <MaterialIcons
                              name={
                                line.qteDevis <= 1 ? "delete-outline" : "remove"
                              }
                              size={20}
                              color={line.qteDevis <= 1 ? "#ef4444" : textColor}
                            />
                          </TouchableOpacity>
                          <TextInput
                            value={String(line.qteDevis)}
                            onChangeText={(v) => handleQtyChange(line, v)}
                            keyboardType="number-pad"
                            selectTextOnFocus
                            style={[
                              styles.qtyInput,
                              { color: textColor, borderColor },
                            ]}
                          />
                          <TouchableOpacity
                            onPress={() =>
                              handleQtyChange(line, String(line.qteDevis + 1))
                            }
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                          >
                            <MaterialIcons
                              name="add"
                              size={20}
                              color={textColor}
                            />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeLine(line)}
                          style={styles.removeBtn}
                        >
                          <MaterialIcons
                            name="delete-outline"
                            size={18}
                            color="#ef4444"
                          />
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
                  {lines.length} article{lines.length !== 1 ? "s" : ""}
                </Text>
                <Text style={[styles.summaryLabel, { color: mutedColor }]}>
                  {totalUnits} unité{totalUnits !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: mutedColor }]}>
                  Total HT
                </Text>
                <Text style={[styles.summaryValue, { color: textColor }]}>
                  {formatAmount(displayHT)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: mutedColor }]}>
                  TVA
                </Text>
                <Text style={[styles.summaryValue, { color: textColor }]}>
                  {formatAmount(displayTaxe)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: textColor }]}>
                  Total
                </Text>
                <Text style={[styles.totalValue, { color: tintColor }]}>
                  {formatAmount(displayTotal)}
                </Text>
              </View>
            </View>
          )}

          {/* Boutons d'action */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              disabled={isSaving}
              style={[
                styles.secondaryBtn,
                { borderColor, opacity: isSaving ? 0.7 : 1 },
              ]}
              onPress={handleSave}
            >
              <Text style={[styles.secondaryBtnText, { color: textColor }]}>
                Enregistrer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleValidateRequest}
              disabled={isSaving}
              style={[
                styles.primaryBtn,
                { backgroundColor: tintColor, opacity: isSaving ? 0.7 : 1 },
              ]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>{"Valider le devis"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Modal sélection sous-compte */}
      <Modal
        visible={showSousCompteList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSousCompteList(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
            }}
            activeOpacity={1}
            onPress={() => setShowSousCompteList(false)}
          />
          <View style={[styles.modalSheet, { backgroundColor }]}>
            <View
              style={[styles.modalHandle, { backgroundColor: borderColor }]}
            />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Choisir un sous-compte
              </Text>
              <TouchableOpacity onPress={() => setShowSousCompteList(false)}>
                <MaterialIcons name="close" size={22} color={mutedColor} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={sousCompteSearch}
              onChangeText={setSousCompteSearch}
              style={[styles.searchInput, { color: textColor, borderColor }]}
              placeholder="Rechercher un sous-compte..."
              placeholderTextColor={mutedColor}
            />
            <TouchableOpacity
              onPress={() => handleSelectSousCompte(null)}
              style={styles.catalogRow}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.catalogLabel, { color: textColor }]}
                  numberOfLines={1}
                >
                  Compte principal
                </Text>
              </View>
              <MaterialIcons
                name={
                  selectedSousCompteId === null
                    ? "radio-button-checked"
                    : "radio-button-unchecked"
                }
                size={22}
                color={selectedSousCompteId === null ? tintColor : mutedColor}
              />
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: `${borderColor}60` }} />
            <FlatList
              data={filteredSousComptes}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View
                  style={{ height: 1, backgroundColor: `${borderColor}60` }}
                />
              )}
              renderItem={({ item }) => {
                const isSelected = selectedSousCompteId === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelectSousCompte(item)}
                    style={styles.catalogRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.catalogLabel, { color: textColor }]}
                        numberOfLines={1}
                      >
                        {item.nom}
                      </Text>
                    </View>
                    <MaterialIcons
                      name={
                        isSelected
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                      }
                      size={22}
                      color={isSelected ? tintColor : mutedColor}
                    />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={[styles.catalogEmpty, { color: mutedColor }]}>
                  Aucun sous-compte trouvé
                </Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal catalogue produits */}
      <Modal
        visible={showCatalog}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCatalog(false);
          setProductSearch("");
        }}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
            }}
            activeOpacity={1}
            onPress={() => {
              setShowCatalog(false);
              setProductSearch("");
            }}
          />
          <View style={[styles.modalSheet, { backgroundColor }]}>
            <View
              style={[styles.modalHandle, { backgroundColor: borderColor }]}
            />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Catalogue produits
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCatalog(false);
                  setProductSearch("");
                }}
              >
                <MaterialIcons name="close" size={22} color={mutedColor} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={productSearch}
              onChangeText={setProductSearch}
              style={[styles.searchInput, { color: textColor, borderColor }]}
              placeholder="Rechercher par désignation, référence…"
              placeholderTextColor={mutedColor}
            />
            {isLoadingProducts ? (
              <View style={{ paddingVertical: 32, alignItems: "center" }}>
                <ActivityIndicator size="large" color={tintColor} />
                <Text
                  style={[
                    styles.catalogEmpty,
                    { color: mutedColor, marginTop: 10 },
                  ]}
                >
                  Chargement du catalogue…
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 440 }}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                  <View
                    style={{ height: 1, backgroundColor: `${borderColor}60` }}
                  />
                )}
                renderItem={({ item: product }) => {
                  const alreadyAdded = lines.some(
                    (l) => l.idProduit === product.id,
                  );
                  return (
                    <TouchableOpacity
                      onPress={() => addProduct(product)}
                      disabled={alreadyAdded}
                      style={[
                        styles.catalogRow,
                        alreadyAdded && { opacity: 0.4 },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.catalogLabel, { color: textColor }]}
                          numberOfLines={1}
                        >
                          {product.designation}
                        </Text>
                      </View>
                      <Text style={[styles.catalogPrice, { color: tintColor }]}>
                        {formatAmount(product.prixVenteTTC)}
                      </Text>
                      <MaterialIcons
                        name={
                          alreadyAdded ? "check-circle" : "add-circle-outline"
                        }
                        size={22}
                        color={tintColor}
                        style={{ marginLeft: 10 }}
                      />
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text style={[styles.catalogEmpty, { color: mutedColor }]}>
                    Aucun produit trouvé
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      <MessagePopup
        visible={messagePopupVisible}
        type={messagePopupType}
        title={messagePopupTitle}
        message={messagePopupMessage}
        buttonLabel={messagePopupButtonLabel}
        onClose={closeMessagePopup}
      />
      <ConfirmationPopup
        visible={confirmPopupVisible}
        type="info"
        title={confirmPopupTitle}
        message={confirmPopupMessage}
        confirmLabel={confirmPopupConfirmLabel}
        cancelLabel={confirmPopupCancelLabel}
        onConfirm={confirmPopup}
        onCancel={closeConfirmationPopup}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    borderRadius: 18,
    padding: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoCode: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  infoClient: {
    fontSize: 17,
    fontWeight: "800",
  },
  infoMeta: {
    fontSize: 13,
  },
  sousComptePicker: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sousCompteLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  sousCompteValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionBlock: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  addLineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addLineBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  catalogLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  catalogMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  catalogPrice: {
    fontSize: 13,
    fontWeight: "700",
  },
  catalogEmpty: {
    textAlign: "center",
    padding: 16,
    fontSize: 13,
  },
  emptyLines: {
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  emptyLinesText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  linesBlock: {
    gap: 10,
  },
  lineCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lineDesignation: {
    fontSize: 14,
    fontWeight: "700",
  },
  linePrixUnit: {
    fontSize: 12,
    marginTop: 3,
  },
  lineSubtotal: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  lineRightCol: {
    alignItems: "center",
    gap: 8,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyInput: {
    fontSize: 15,
    fontWeight: "800",
    minWidth: 38,
    textAlign: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 2,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  primaryBtn: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
});
