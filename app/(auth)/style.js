import { StyleSheet } from 'react-native';
import COLORS from '../../styles/colors';
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryColor,
  },

  welcomeContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },

  centeredLogoWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 180,
    height: 180,
  },

  brandName: {
    marginTop: -6,
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
  },

  welcomeButton: {
    width: '80%',
    borderRadius: 999,
    paddingVertical: 14,
    backgroundColor: COLORS.brandButtonColor,
    alignItems: 'center',
  },

  welcomeButtonText: {
    color: COLORS.secondaryColor,
    fontSize: 18,
    fontWeight: '700',
  },

  formBlock: {
    width: '80%',
    marginTop: 8,
  },

  loginLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginBottom: 6,
    paddingBottom: 5,
  },

  inputRowFocused: {
    borderBottomColor: COLORS.brandButtonColor,
    borderBottomWidth: 2,
  },

  inputRowError: {
    borderBottomColor: COLORS.errorColor,
  },

  inputIcon: {
    color: 'white',
    fontSize: 18,
    marginRight: 8,
    width: 20,
    textAlign: 'center',
  },

  loginInput: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    paddingVertical: 2,
  },

  passwordToggle: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 6,
  },

  loginPlaceholder: {
    color: COLORS.accentColor,
  },

  fieldError: {
    marginBottom: 8,
    color: COLORS.errorColor,
    fontSize: 12,
    fontWeight: '600',
  },

  errorContainer: {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.errorColor,
  },

  loginButton: {
    marginTop: 14,
    backgroundColor: COLORS.brandButtonColor,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },

  loginButtonText: {
    color: COLORS.secondaryColor,
    fontSize: 14,
    fontWeight: '700',
  },

  secondaryLink: {
    marginTop: 18,
    textAlign: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },

  registerRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  registerText: {
    color: 'white',
    fontSize: 15,
  },

  registerLink: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },

  guestButton: {
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: COLORS.secondaryColor,
  },

  guestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },

  socialLinksContainer: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },

  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },

  buttonDisabled: {
    opacity: 0.7,
  },
});

export default styles;
