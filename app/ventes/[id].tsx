import { AppHeader } from "@/components/app-header";
import { EmptyResultsCard } from "@/components/empty-results-card";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getfetchFactureById } from "@/services/api-service";
import {
  FACTURES_LIST_CACHE_KEY,
  getCacheData,
  setCacheData,
} from "@/services/cache-service";
import { sharedStyles } from "@/styles/shared.js";
import { formatAmount, formatDate, MAIN_ACCOUNT_FILTER } from "@/tools/tools";
import {
  facture,
  listFactures,
  statusFactureColorMap,
} from "@/types/factures.type";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FactureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } =
    useAppTheme();
  const { userToken } = useAuthContext();
  const [facture, setFacture] = useState<facture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFneTooltipVisible, setIsFneTooltipVisible] = useState(false);

  useEffect(() => {
    const loadFactures = async () => {
      try {
        const cachedFactures = await getCacheData<listFactures>(
          FACTURES_LIST_CACHE_KEY,
        );
        const invoice = cachedFactures?.data.find((item) => item.id === id);
        setFacture(invoice ?? null);

        if (!userToken || !id) {
          return;
        }

        const data = await getfetchFactureById(userToken, id);
        if (data) {
          setFacture(data);

          const currentData = cachedFactures?.data ?? [];
          const existsInCache = currentData.some((item) => item.id === data.id);
          const updatedData = existsInCache
            ? currentData.map((item) => (item.id === data.id ? data : item))
            : [data, ...currentData];

          await setCacheData(FACTURES_LIST_CACHE_KEY, {
            meta: cachedFactures?.meta ?? {
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
        setFacture(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFactures();
  }, [id, userToken]);

  const invoice = facture;

  if (isLoading && !invoice) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
        <View style={sharedStyles.fixedHeader}>
          <AppHeader
            showBack
            title="Détail facture"
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
                Chargement de la vente
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

  if (!invoice) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
        <View style={sharedStyles.fixedHeader}>
          <AppHeader
            showBack
            title="Détail facture"
            subtitle="Document introuvable"
          />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Vente introuvable"
              subtitle="Cette vente n'existe pas ou a été supprimée."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusColor = statusFactureColorMap[invoice.status];
  const invoiceLines = invoice.details ?? [];
  const hasFneUrl = Boolean(invoice.fneUrl && invoice.fneUrl.trim().length > 0);

  const openNormalizedInvoice = async () => {
    if (!hasFneUrl || !invoice.fneUrl) {
      return;
    }

    await Linking.openURL(invoice.fneUrl);
  };

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={sharedStyles.fixedHeader}>
        <AppHeader
          showBack
          title="Détail de la vente"
          subtitle={invoice.codeVente}
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
                {invoice.nomSousCompte?.trim()
                  ? invoice.nomSousCompte
                  : MAIN_ACCOUNT_FILTER}
              </Text>
              {hasFneUrl ? (
                <View style={sharedStyles.headerActionsRow}>
                  <View style={sharedStyles.headerActionWrap}>
                    <Pressable
                      onPress={openNormalizedInvoice}
                      onHoverIn={() => setIsFneTooltipVisible(true)}
                      onHoverOut={() => setIsFneTooltipVisible(false)}
                      onPressIn={() => setIsFneTooltipVisible(true)}
                      onPressOut={() => setIsFneTooltipVisible(false)}
                      accessibilityRole="button"
                      accessibilityLabel="Voir la facture normalisée"
                      style={[
                        sharedStyles.headerActionButton,
                        { backgroundColor: `${tintColor}18` },
                      ]}
                    >
                      <MaterialIcons
                        name="receipt-long"
                        size={16}
                        color={tintColor}
                      />
                      <View
                        style={[
                          sharedStyles.infoBubble,
                          { backgroundColor: tintColor },
                        ]}
                      >
                        <Text style={sharedStyles.infoBubbleText}>i</Text>
                      </View>
                    </Pressable>
                    {isFneTooltipVisible ? (
                      <View
                        pointerEvents="none"
                        style={sharedStyles.actionTooltip}
                      >
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="clip"
                          style={sharedStyles.actionTooltipText}
                        >
                          Voir la facture normalisée
                        </Text>
                        <View style={sharedStyles.actionTooltipArrow} />
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>

            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Émise le : {formatDate(invoice.dateVente)}
              </Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Échéance :{" "}
                {invoice.dateEchVente ? formatDate(invoice.dateEchVente) : "—"}
              </Text>
            </View>
            <View
              style={[
                sharedStyles.statusBadge,
                { backgroundColor: `${statusColor}18` },
              ]}
            >
              <Text style={[sharedStyles.statusText, { color: statusColor }]}>
                {invoice.status}
              </Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Agence : {invoice.nomAgence ?? "—"}
              </Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Caisse : {invoice.nomCaisse ?? "—"}
              </Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Opérateur saisie : {invoice.operateurSaisie ?? "—"}
              </Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Opérateur validation : {invoice.operateurValidation ?? "—"}
              </Text>
            </View>
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
                    {line.txRemise > 0 ? (
                      <Text
                        style={[sharedStyles.lineMeta, { color: mutedColor }]}
                      >
                        Tx remise: {line.txRemise}% • Remise prix:{" "}
                        {formatAmount(line.remisePrix)}
                      </Text>
                    ) : null}
                    {line.qteGratuite > 0 ? (
                      <Text
                        style={[sharedStyles.lineMeta, { color: mutedColor }]}
                      >
                        Qté gratuite: {line.qteGratuite} • TVA: {line.txTaxe}% (
                        {formatAmount(line.montantTaxe)})
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
                  Total brut HT
                </Text>
                <Text style={[sharedStyles.summaryValue, { color: textColor }]}>
                  {formatAmount(invoice.totalHT)}
                </Text>
              </View>
              <View style={sharedStyles.summaryRow}>
                <Text
                  style={[sharedStyles.summaryLabel, { color: mutedColor }]}
                >
                  Total brut TTC
                </Text>
                <Text style={[sharedStyles.summaryValue, { color: textColor }]}>
                  {formatAmount(invoice.totalNetPayer)}
                </Text>
              </View>
              <View style={sharedStyles.summaryRow}>
                <Text
                  style={[sharedStyles.summaryLabel, { color: mutedColor }]}
                >
                  Total remise HT
                </Text>
                <Text style={[sharedStyles.summaryValue, { color: textColor }]}>
                  {formatAmount(invoice.totalRemCialeHT)}
                </Text>
              </View>
              <View style={sharedStyles.summaryRow}>
                <Text
                  style={[sharedStyles.summaryLabel, { color: mutedColor }]}
                >
                  Total remise TTC
                </Text>
                <Text style={[sharedStyles.summaryValue, { color: textColor }]}>
                  {formatAmount(invoice.totalRemCialeTTC)}
                </Text>
              </View>
            </>

            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>
                Sous-total
              </Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>
                {formatAmount(invoice.totalHT)}
              </Text>
            </View>

            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.summaryLabel, { color: mutedColor }]}>
                TVA
              </Text>
              <Text style={[sharedStyles.summaryValue, { color: textColor }]}>
                {formatAmount(invoice.totalTaxe)}
              </Text>
            </View>
            <View style={sharedStyles.separator} />
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.totalLabel, { color: textColor }]}>
                Total à payer
              </Text>
              <Text style={[sharedStyles.totalValue, { color: tintColor }]}>
                {formatAmount(invoice.totalNetPayer)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
