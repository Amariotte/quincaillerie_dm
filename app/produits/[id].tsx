import { AppHeader } from "@/components/app-header";
import { EmptyResultsCard } from "@/components/empty-results-card";
import apiConfig from "@/config/api";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { sharedStyles } from "@/styles/shared.js";
import { formatAmount } from "@/tools/tools";
import { Produit } from "@/types/produits.type";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProduitDetailScreen() {
  const { produit: produitParam } = useLocalSearchParams<{
    id: string;
    produit?: string;
  }>();

  const { backgroundColor, textColor, tintColor, cardColor, mutedColor } =
    useAppTheme();
  const { userToken } = useAuthContext();
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Parse produit data once and memoize it
  const produit_item = useMemo(() => {
    if (produitParam) {
      try {
        return JSON.parse(produitParam) as Produit;
      } catch {
        return null;
      }
    }
    return null;
  }, [produitParam]);

  // Fetch product image from API
  useEffect(() => {
    if (!produit_item?.id || !userToken) {
      setImageLoading(false);
      return;
    }

    const fetchProductImage = async () => {
      try {
        setImageLoading(true);
        setImageError(false);

        // Try to fetch image from API endpoint
        const imageUrl = `${apiConfig.baseURL}${apiConfig.endpoints.produits}/${produit_item.id}/image`;

        // Try fetching from API
        const response = await fetch(imageUrl, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          setProductImage(imageUrl);
        } else {
          setImageError(true);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'image:", error);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    fetchProductImage();
  }, [produit_item?.id, userToken]);

  if (!produit_item) {
    return (
      <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
        <View style={sharedStyles.fixedHeader}>
          <AppHeader
            showBack
            title="Détail produit"
            subtitle="Document introuvable"
          />
        </View>
        <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
          <View style={sharedStyles.container}>
            <EmptyResultsCard
              iconName="error-outline"
              title="Produit introuvable"
              subtitle="Ce produit n'existe pas ou a été supprimé."
              cardColor={cardColor}
              titleColor={textColor}
              subtitleColor={mutedColor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[sharedStyles.safeArea, { backgroundColor }]}>
      <View style={sharedStyles.fixedHeader}>
        <AppHeader
          showBack
          title="Détail du produit"
          subtitle={produit_item.reference ?? "Référence inconnue"}
        />
      </View>
      <ScrollView
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={sharedStyles.container}>
          {/* Product Image */}
          <View
            style={{
              width: "100%",
              height: 250,
              borderRadius: 12,
              marginBottom: 20,
              backgroundColor: cardColor,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {imageLoading ? (
              <ActivityIndicator size="large" color={tintColor} />
            ) : productImage && !imageError ? (
              <Image
                source={{ uri: productImage }}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "contain",
                }}
              />
            ) : (
              <Image
                source={require("@/assets/images/produit.png")}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "contain",
                }}
              />
            )}
          </View>

          {/* Header Card - Informations principales */}
          <View
            style={[
              sharedStyles.headerCard,
              {
                backgroundColor: cardColor,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <View style={sharedStyles.headerTopRow}>
              <Text
                style={[sharedStyles.clientName, { color: textColor }]}
                numberOfLines={2}
              >
                {produit_item.designation?.trim() || "Désignation inconnue"}
              </Text>
            </View>

            <View style={sharedStyles.metaRow}>
              <Text
                style={[
                  sharedStyles.metaCaption,
                  { color: mutedColor, fontSize: 13 },
                ]}
              >
                Référence :
              </Text>
              <Text
                style={[
                  sharedStyles.metaCaption,
                  { color: textColor, fontWeight: "600", fontSize: 13 },
                ]}
              >
                {produit_item.reference ?? "—"}
              </Text>
            </View>
            <View style={sharedStyles.metaRow}>
              <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                Famille : {produit_item.nomfamille ?? "—"}
              </Text>
            </View>
            {produit_item.unit && (
              <View style={sharedStyles.metaRow}>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                  Unité : {produit_item.unit}
                </Text>
              </View>
            )}
            {produit_item.txTva !== undefined && (
              <View style={sharedStyles.metaRow}>
                <Text style={[sharedStyles.metaCaption, { color: mutedColor }]}>
                  TVA : {produit_item.txTva}%
                </Text>
              </View>
            )}
          </View>

          {/* Summary Card - Prix */}
          <View
            style={[
              sharedStyles.summaryCard,
              {
                backgroundColor: cardColor,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            {produit_item.prixVenteHT !== undefined && (
              <View style={sharedStyles.summaryRow}>
                <Text
                  style={[
                    sharedStyles.totalLabel,
                    { color: textColor, fontSize: 14 },
                  ]}
                >
                  Prix unitaire HT
                </Text>
                <Text
                  style={[
                    sharedStyles.totalValue,
                    { color: tintColor, fontWeight: "bold", fontSize: 16 },
                  ]}
                >
                  {formatAmount(produit_item.prixVenteHT)}
                </Text>
              </View>
            )}
            {produit_item.prixVenteTTC !== undefined && (
              <View
                style={[
                  sharedStyles.summaryRow,
                  {
                    borderTopWidth: 1,
                    borderTopColor: mutedColor + "30",
                    paddingTop: 12,
                    marginTop: 8,
                  },
                ]}
              >
                <Text
                  style={[
                    sharedStyles.totalLabel,
                    { color: textColor, fontSize: 14 },
                  ]}
                >
                  Prix unitaire TTC
                </Text>
                <Text
                  style={[
                    sharedStyles.totalValue,
                    { color: tintColor, fontWeight: "bold", fontSize: 16 },
                  ]}
                >
                  {formatAmount(produit_item.prixVenteTTC)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
