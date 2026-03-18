import { StyleSheet } from 'react-native';
import { sharedLayout } from '../../styles/shared';

const styles = StyleSheet.create({
  safeArea: {
    ...sharedLayout.safeArea,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  brandLogo: {
    width: 84,
    height: 52,
    borderRadius: 12,
  },

  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  powerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  
  balanceCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 18,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '900',
  },
  balanceCaption: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  offlineBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '700',
  },
  depositButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    maxWidth: 170,
  },
  depositText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    flexShrink: 1,
  },
  metricsRow: {
    gap: 12,
  },
  metricBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  updateText: {
    marginTop: 14,
    textAlign: 'right',
    fontSize: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 20,
  },
  menuCard: {
    width: '23.5%',
    minHeight: 106,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionTitle: {
    marginBottom: 0,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  transactionList: {
    gap: 10,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 4,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 24,
  },
});

export default styles;
