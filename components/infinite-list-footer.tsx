import { sharedStyles } from "@/styles/shared";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

type InfiniteListFooterProps = {
  isLoadingMore: boolean;
  tintColor: string;
  mutedColor: string;
};

export function InfiniteListFooter({
  isLoadingMore,
  tintColor,
  mutedColor,
}: InfiniteListFooterProps) {
  if (!isLoadingMore) {
    return <View style={{ height: 12 }} />;
  }

  return (
    <View style={{ alignItems: "center", paddingVertical: 16, gap: 8 }}>
      <ActivityIndicator size="small" color={tintColor} />
      <Text style={[sharedStyles.loadingText, { color: mutedColor }]}>Chargement...</Text>
    </View>
  );
}