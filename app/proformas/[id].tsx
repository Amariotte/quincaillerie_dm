import { AppHeader } from "@/components/app-header";
import { EmptyResultsCard } from "@/components/empty-results-card";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { deleteDevis, getfetchDevisById } from "@/services/api-service";
import {
  DEVIS_LIST_CACHE_KEY,
  getCacheData,
  setCacheData,
} from "@/services/cache-service";
import { sharedStyles } from "@/styles/shared.js";
import { formatAmount, formatDate, MAIN_ACCOUNT_FILTER } from "@/tools/tools";
import { devis, listDevis, statusDevisColorMap } from "@/types/devis.type";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProformaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } =
    useAppTheme();
  const { userToken } = useAuthContext();
  const [proforma, setProforma] = useState<devis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadProformas = async () => {
      try {
        const cachedProformas =
          await getCacheData<listDevis>(DEVIS_LIST_CACHE_KEY);
        const proforma = cachedProformas?.data.find((item) => item.id === id);
        setProforma(proforma ?? null);

        if (!userToken || !id) {
          return;
        }

        const data = await getfetchDevisById(userToken, id);
        if (data) {
          setProforma(data);

          const currentData = cachedProformas?.data ?? [];
          const existsInCache = currentData.some((item) => item.id === data.id);
          const updatedData = existsInCache
            ? currentData.map((item) => (item.id === data.id ? data : item))
            : [data, ...currentData];

          await setCacheData(DEVIS_LIST_CACHE_KEY, {
            meta: cachedProformas?.meta ?? {
              page: 1,
              next: 1,
              totalPages: 1,
              total: updatedData.length,
              size: updatedData.length,
            },
            data: updatedData,
          });
        }
      } catch {
        setProforma(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProformas();
  }, [id, userToken]);

  const devis = proforma;

  if (isLoading && !devis) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader
            showBack
            title="Détail de la proforma"
            subtitle="Chargement en cours"
          />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <View
              style={[sharedStyles.emptyCard, { backgroundColor: cardColor }]}
            >
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[sharedStyles.emptyTitle, { color: textColor }]}>
                Chargement de la proforma
              </Text>
              <Text style={[sharedStyles.emptyText, { color: mutedColor }]}>
                Les informations détaillées sont en cours de récupération.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!devis) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
          <AppHeader
            showBack
            title="Détail de la proforma"
            subtitle="Document introuvable"
          />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Proforma introuvable"
              subtitle="Cette proforma n'existe pas ou a été supprimée."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusColor = statusDevisColorMap[devis.status];
  const invoiceLines = devis.details ?? [];
  const isDraft = devis.status === "En saisie";

  const handleEdit = () => {
    router.push({ pathname: "/devis/nouveau", params: { id: devis.id } });
  };

  const handleDelete = () => {
    if (!userToken) {
      return;
    }

    Alert.alert(
      "Supprimer le devis",
      `Voulez-vous vraiment supprimer le devis ${devis.codeDevis} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteDevis(userToken, devis.id);

              const cachedProformas =
                await getCacheData<listDevis>(DEVIS_LIST_CACHE_KEY);
              const updatedData = (cachedProformas?.data ?? []).filter(
                (item) => item.id !== devis.id,
              );

              await setCacheData(DEVIS_LIST_CACHE_KEY, {
                meta: cachedProformas?.meta ?? {
                  page: 1,
                  next: 1,
                  totalPages: 1,
                  total: updatedData.length,
                  size: updatedData.length,
                },
                data: updatedData,
              });

              router.replace("/proformas");
            } catch (error) {
              Alert.alert(
                "Suppression impossible",
                error instanceof Error
                  ? error.message
                  : "Le devis n'a pas pu être supprimé.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
        <AppHeader
          showBack
          title="Détail de la proforma"
          subtitle={devis.codeDevis}
        />
      </View>
      <ScrollView
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={sharedStyles.container}>
          {isLoading ? (
            <View
              style={[
                sharedStyles.loadingBanner,
                { backgroundColor: cardColor },
              ]}
            >
              <ActivityIndicator size="small" color={tintColor} />
              <Text style={[sharedStyles.loadingText, { color: mutedColor }]}>
                Chargement des informations en cours...
              </Text>
            </View>
          ) : null}

          <View
            style={[sharedStyles.headerCard, { backgroundColor: cardColor }]}
          >
            <View style={sharedStyles.headerTopRow}>
              <Text style={[sharedStyles.clientName, { color: textColor }]}>
                {devis.nomSousCompte?.trim()
                  ? devis.nomSousCompte
                  : MAIN_ACCOUNT_FILTER}
              </Text>
            </View>

            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Émise le : {formatDate(devis.dateDevis)}
              </Text>
            </View>
            <View
              style={[
                sharedStyles.statusBadge,
                { backgroundColor: `${statusColor}18` },
              ]}
            >
              <Text style={[sharedStyles.statusText, { color: statusColor }]}>
                {devis.status}
              </Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Agence : {devis.nomAgence ?? "—"}
              </Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Opérateur saisie : {devis.operateurSaisie ?? "—"}
              </Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Opérateur validation : {devis.operateurValidation ?? "—"}
              </Text>
            </View>

            {isDraft ? (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={handleEdit}
                  disabled={isDeleting}
                  style={[styles.primaryAction, { backgroundColor: tintColor }]}
                >
                  <MaterialIcons name="edit" size={18} color="#ffffff" />
                  <Text style={styles.primaryActionText}>Modifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={isDeleting}
                  style={[
                    styles.secondaryAction,
                    { borderColor: "#ef4444", opacity: isDeleting ? 0.6 : 1 },
                  ]}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={18}
                    color="#ef4444"
                  />
                  <Text style={styles.secondaryActionText}>
                    {isDeleting ? "Suppression..." : "Supprimer"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <View
            style={[sharedStyles.linesCard, { backgroundColor: cardColor }]}
          >
            <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>
              Articles
            </Text>
            <View style={sharedStyles.linesBlock}>
              {invoiceLines.map((line) => (
                <View key={line.id} style={sharedStyles.lineRow}>
                  <View style={sharedStyles.lineLeft}>
                    <Text
                      style={[sharedStyles.lineLabel, { color: textColor }]}
                    >
                      {line.designation}
                    </Text>
                    {line.nomSuplementaire ? (
                      <Text
                        style={[sharedStyles.lineMeta, { color: mutedColor }]}
                      >
                        Supplémentaire: {line.nomSuplementaire}
                      </Text>
                    ) : null}
                    {line.descPackage ? (
                      <Text
                        style={[sharedStyles.lineMeta, { color: mutedColor }]}
                      >
                        Package: {line.descPackage}
                      </Text>
                    ) : null}
                    <Text
                      style={[sharedStyles.lineMeta, { color: mutedColor }]}
                    >
                      {line.qteVendue} × {formatAmount(line.prixVenteTTC)}
                    </Text>

                    {line.qteGratuite > 0 ? (
                      <Text
                        style={[sharedStyles.lineMeta, { color: mutedColor }]}
                      >
                        Quantité gratuite : {line.qteGratuite}
                      </Text>
                    ) : null}

                    {line.remisePrix > 0 ? (
                      <Text
                        style={[sharedStyles.lineMeta, { color: mutedColor }]}
                      >
                        Remise sur le prix : {formatAmount(line.remisePrix)}
                      </Text>
                    ) : null}

                    {line.txRemise > 0 ? (
                      <Text
                        style={[sharedStyles.lineMeta, { color: mutedColor }]}
                      >
                        Taux de remise : {line.txRemise}%
                      </Text>
                    ) : null}

                    {line.txTaxe > 0 ? (
                      <Text
                        style={[sharedStyles.lineMeta, { color: mutedColor }]}
                      >
                        TVA: {line.txTaxe}% ({formatAmount(line.montantTaxe)})
                      </Text>
                    ) : null}

                    {line.montantHT > 0 || line.montantTTC > 0 ? (
                      <Text
                        style={[sharedStyles.lineMeta, { color: mutedColor }]}
                      >
                        Totaux ligne HT/TTC: {formatAmount(line.montantHT)} /{" "}
                        {formatAmount(line.montantTTC)}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[sharedStyles.lineTotal, { color: textColor }]}>
                    {formatAmount(line.montantTTC)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[sharedStyles.summaryCard, { backgroundColor: cardColor }]}
          >
            <>
              <View style={sharedStyles.summaryRow}>
                <Text
                  style={[sharedStyles.summaryLabel, { color: mutedColor }]}
                >
                  TOTAL HT
                </Text>
                <Text style={[sharedStyles.summaryValue, { color: textColor }]}>
                  {formatAmount(devis.totalHT)}
                </Text>
              </View>

              <View style={sharedStyles.summaryRow}>
                <Text
                  style={[sharedStyles.summaryLabel, { color: mutedColor }]}
                >
                  REMISE
                </Text>
                <Text style={[sharedStyles.summaryValue, { color: textColor }]}>
                  {formatAmount(devis.totalRemCialeHT)}
                </Text>
              </View>
            </>

            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>
                TVA
              </Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>
                {formatAmount(devis.totalTaxe)}
              </Text>
            </View>
            <View style={sharedStyles.separator} />
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.totalLabel, { color: textColor }]}>
                NET A PAYER
              </Text>
              <Text style={[sharedStyles.totalValue, { color: tintColor }]}>
                {formatAmount(devis.totalNetPayer)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryActionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    backgroundColor: "#ffffff",
  },
  secondaryActionText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "800",
  },
});
