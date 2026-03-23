

import { StyleSheet } from 'react-native';
import { sharedStyles } from '../../styles/shared';


const styles = StyleSheet.create({


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
