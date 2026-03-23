import { StyleSheet } from 'react-native';
import { sharedStyles } from '../../styles/shared';

const styles = StyleSheet.create({
 
  card: {
    ...sharedStyles.cardRadius22Padding18,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    marginTop: -4,
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 6,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    ...sharedStyles.buttonTextPrimary,
  },


  heroCard: {
    ...sharedStyles.cardRadius22Padding18,
  },
  heroLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  heroEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  qrCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  qrGrid: {
    width: 216,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  qrCell: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 22,
  },
  helpText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },


});

export default styles;