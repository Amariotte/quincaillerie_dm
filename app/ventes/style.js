

import { StyleSheet } from 'react-native';
import { sharedStyles } from '../../styles/shared';

const styles = StyleSheet.create({

 
  headerCard: {
    ...sharedStyles.cardRadius20Padding16,
    gap: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  headerActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    position: 'relative',
    borderRadius: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  infoBubble: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBubbleText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  metaRow: { gap: 4 },
  metaLabel: { fontSize: 13 },
  statusText: { ...sharedStyles.statusText },
  linesCard: {
    ...sharedStyles.cardRadius20Padding16,
    gap: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  linesBlock: { gap: 12 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  lineLeft: { flex: 1 },
  lineLabel: { fontSize: 14, fontWeight: '700' },
  lineMeta: { fontSize: 12, marginTop: 4 },
  lineTotal: { fontSize: 14, fontWeight: '800' },
  summaryCard: {
    ...sharedStyles.cardRadius20Padding16,
    gap: 10,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 15, fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '900' },

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
  
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
 
 
  invoiceCard: {
    ...sharedStyles.cardRadius20Padding16,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  invoiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  invoiceRefBlock: {
    flex: 1,
  },
  invoiceRef: {
    fontSize: 16,
    fontWeight: '800',
  },
  invoiceClient: {
    fontSize: 13,
    marginTop: 4,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  invoiceBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '900',
  },
  actionButton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
  }
});

export default styles;
