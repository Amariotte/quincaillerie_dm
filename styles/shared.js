import COLORS from '@/styles/colors';
import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },  
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 16,
  },
 

   fixedHeader: {
      paddingHorizontal: 18,
      paddingTop: 12,
    },
  
  cardRadius20Padding16: {
    borderRadius: 20,
    padding: 16,
  },
  cardRadius22Padding18: {
    borderRadius: 22,
    padding: 18,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerCard: {
    borderRadius: 20,
    padding: 16,
    gap: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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

 
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
 
 
  headerActionText: {
    fontSize: 12,
    fontWeight: '800',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  buttonTextPrimary: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

   emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },

   searchBox: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

    metaCaption: {
    fontSize: 12,
  },

   searchInput: {
    flex: 1,
    fontSize: 15,
  },

   emptyCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },

   periodRow: {
    flexDirection: 'row',
    gap: 10,
  },

    periodInputBox: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  periodInput: {
    flex: 1,
    fontSize: 14,
  },
  filterRow: {
    gap: 10,
    paddingRight: 10,
  },

  statLabel: {
    fontSize: 13,
  },

  statCount: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },

statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
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

  listBlock: {
    gap: 12,
  },

   

   filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
  },

   metaValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },

   errorMessage: {
    color: COLORS.errorColor,
    fontSize: 14,
    fontWeight: '500',
  },


    clientName: { fontSize: 18, fontWeight: '800' },

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

    loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

   metaModeRow: {
    marginTop: 2,
    gap: 4,
  },

  actionButton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
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
  }
,
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

  descriptionText: { fontSize: 15, lineHeight: 22 },

   summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 15, fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },

   totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '900' },

    sectionTitle: { fontSize: 17, fontWeight: '800' },
  linesBlock: { gap: 12 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  lineLeft: { flex: 1 },
  lineLabel: { fontSize: 14, fontWeight: '700' },
  lineSubLabel: { fontSize: 12, marginTop: 4 },
  lineMeta: { fontSize: 12, marginTop: 4 },
  lineTotal: { fontSize: 14, fontWeight: '800' },

  loadingBanner: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  
  summaryCard: {
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },

    linesCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
 
  invoiceCard: {
    borderRadius: 20,
    padding: 16,
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

});