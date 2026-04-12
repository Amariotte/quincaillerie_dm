import { AppHeader } from "@/components/app-header";
import { EmptyResultsCard } from "@/components/empty-results-card";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getfetchOperationById } from "@/services/api-service";
import { sharedStyles } from "@/styles/shared.js";
import { formatAmount, formatDate, MAIN_ACCOUNT_FILTER } from "@/tools/tools";
import { operation, typeMouvementColorMap } from "@/types/operations.type";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OperationDetailScreen() {
 
  const { userToken } = useAuthContext();
  const { backgroundColor, textColor, cardColor, mutedColor } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  
 
  const [operationFromApi, setOperationFromApi] = useState<operation | null>(
    null,
  );
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);

  useEffect(() => {
    if (!id || !userToken) {
      return;
    }

    let isCancelled = false;

    const loadOperationDetail = async () => {
      try {
        setIsLoadingFallback(true);
        const result = await getfetchOperationById(userToken, id);

        if (!isCancelled) {
          setOperationFromApi(result);
        }
      } catch {
        if (!isCancelled) {
          setOperationFromApi(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingFallback(false);
        }
      }
    };

    void loadOperationDetail();

    return () => {
      isCancelled = true;
    };
  }, [id, userToken]);


  if (!operationFromApi && isLoadingFallback) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
        <View style={sharedStyles.fixedHeader}>
        <AppHeader showBack title="Détail opération" subtitle="Chargement en cours" />
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={textColor} />
        </View>
      </SafeAreaView>
    );
  }

  if (!operationFromApi) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
        <View style={sharedStyles.fixedHeader}>
          <AppHeader
            showBack
            title="Détail opération"
            subtitle="Document introuvable"
          />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Opération introuvable"
              subtitle="Cette opération n'existe pas ou a été supprimée."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const operationType = operationFromApi.libType ?? "Décaissement";
  const typeColor = typeMouvementColorMap[operationType];

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={sharedStyles.fixedHeader}>
        <AppHeader
          showBack
          title="Détail de l'opération"
          subtitle={operationFromApi.codeOp}
        />
      </View>
      <ScrollView
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={sharedStyles.container}>
          {/* Header Card - Informations principales */}
          <View
            style={[sharedStyles.headerCard, { backgroundColor: cardColor }]}
          >
            <View style={sharedStyles.headerTopRow}>
              <Text style={[sharedStyles.clientName, { color: textColor }]}>
                {operationFromApi.nomSousCompte?.trim()
                  ? operationFromApi.nomSousCompte
                  : MAIN_ACCOUNT_FILTER}
              </Text>
            </View>
            <View
              style={[
                sharedStyles.statusBadge,
                { backgroundColor: `${typeColor}18` },
              ]}
            >
              <Text style={[sharedStyles.statusText, { color: typeColor }]}>
                {operationType}
              </Text>
            </View>

            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Date : {formatDate(operationFromApi.dateOp)}
              </Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Agence : {operationFromApi.nomAgence ?? "—"}
              </Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Mode paiement : {operationFromApi.nomModePaiement ?? "—"}
              </Text>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Référence : {operationFromApi.refOp ?? "—"}
              </Text>
            </View>
          </View>

          {/* Description Card */}

          <View
            style={[sharedStyles.linesCard, { backgroundColor: cardColor }]}
          >
            <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>
              Rubrique
            </Text>
            <Text style={[sharedStyles.descriptionText, { color: textColor }]}>
              {operationFromApi.libRubrique}
            </Text>
          </View>

          {operationFromApi.descOp && (
            <View
              style={[sharedStyles.linesCard, { backgroundColor: cardColor }]}
            >
              <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>
                Description
              </Text>
              <Text
                style={[sharedStyles.descriptionText, { color: textColor }]}
              >
                {operationFromApi.descOp}
              </Text>
            </View>
          )}

          {/* Participants Card */}
          <View
            style={[sharedStyles.linesCard, { backgroundColor: cardColor }]}
          >
            <Text style={[sharedStyles.sectionTitle, { color: textColor }]}>
              Participants
            </Text>
            <View style={sharedStyles.linesBlock}>
              <View style={sharedStyles.lineRow}>
                <View style={sharedStyles.lineLeft}>
                  <Text style={[sharedStyles.lineLabel, { color: textColor }]}>
                    Solliciteur
                  </Text>
                  <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>
                    {operationFromApi.solliciteurOp ?? "—"}
                  </Text>
                </View>
              </View>
              <View style={sharedStyles.lineRow}>
                <View style={sharedStyles.lineLeft}>
                  <Text style={[sharedStyles.lineLabel, { color: textColor }]}>
                    {operationType == "Encaissement"
                      ? "Déposant"
                      : "Bénéficiaire"}
                  </Text>
                  <Text style={[sharedStyles.lineMeta, { color: mutedColor }]}>
                    {operationFromApi.depoOrBene ?? "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Summary Card - Montant */}
          <View
            style={[sharedStyles.summaryCard, { backgroundColor: cardColor }]}
          >
            <View style={sharedStyles.summaryRow}>
              <Text style={[sharedStyles.totalLabel, { color: textColor }]}>
                Montant de l&apos;opération
              </Text>
              <Text style={[sharedStyles.totalValue, { color: typeColor }]}>
                {formatAmount(operationFromApi.montantOp)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
