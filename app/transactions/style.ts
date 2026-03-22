import { StyleSheet } from 'react-native';
import { sharedComponents, sharedLayout } from '../../styles/shared';

const styles = StyleSheet.create({
  safeArea: { ...sharedLayout.safeArea },
  scrollContent: { ...sharedLayout.scrollContentBottom32 },
  container: { ...sharedLayout.containerHorizontal18Top12Gap16 },

  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  offlineText: {
    fontSize: 13,
    fontWeight: '700',
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
  searchInput: {
    flex: 1,
    fontSize: 15,
  },

  loaderBlock: {
    paddingVertical: 48,
    alignItems: 'center',
  },

  listBlock: {
    gap: 12,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  sectionRows: {
    gap: 10,
  },
  txCard: {
    ...sharedComponents.cardRadius20Padding16,
    gap: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  txLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    ...sharedComponents.statusBadge,
  },
  statusText: {
    ...sharedComponents.statusText,
  },
  txBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txDate: {
    fontSize: 13,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
  },

  emptyCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },

  updatedAt: {
    fontSize: 12,
    textAlign: 'center',
  },

  refreshButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  refreshText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default styles;
