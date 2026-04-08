import { StyleSheet } from "react-native";
import { sharedStyles } from "../../styles/shared";

const styles = StyleSheet.create({
  loaderBlock: {
    paddingVertical: 48,
    alignItems: "center",
  },

  sectionBlock: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  sectionRows: {
    gap: 10,
  },
  txCard: {
    ...sharedStyles.cardRadius20Padding16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  txTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  txLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  txContent: {
    flex: 1,
    gap: 3,
  },
  txBottomRow: {
    alignItems: "flex-end",
    gap: 3,
  },
  txDate: {
    fontSize: 12,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "800",
  },
});

export default styles;
