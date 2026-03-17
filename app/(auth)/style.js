
import COLORS from '@/constants/colors';
import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryColor,
  },

  topSection: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.primaryColor,
  },
  formContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },

  input: {
    marginBottom: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
  },

  fieldError: {
    marginBottom: 12,
    color: COLORS.errorColor,
    fontSize: 12,
    fontWeight: '500',
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

  errorMessage: {
    color: COLORS.errorColor,
    fontSize: 14,
    fontWeight: '500',
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  buttonCnx: {
    marginTop: 16,
    backgroundColor: COLORS.primaryColor,
    paddingVertical: 12,
    borderRadius: 8,
  },

  demoButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryColor,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#eef7f5',
  },

  demoButtonText: {
    color: COLORS.primaryColor,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  demoHint: {
    marginTop: 10,
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  bottomSection: {
    flex: 2,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    height: '50%',
    backgroundColor: '#858080',
  },

  footerSection: {
    marginTop: 24,
    alignItems: 'center',
  },

  footerText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 6,
  },

  footerLink: {
    color: COLORS.primaryColor,
    fontSize: 14,
    fontWeight: '700',
  },

});

export default styles;
