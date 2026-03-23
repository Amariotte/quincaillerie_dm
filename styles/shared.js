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
  containerHorizontal18Top12Gap18x: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 18,
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

 
});