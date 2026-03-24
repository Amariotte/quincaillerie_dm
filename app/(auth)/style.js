import { StyleSheet } from 'react-native';
import COLORS from '../../styles/colors';
import { Colors } from '../../styles/theme';
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  welcomeContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 28,
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
    marginBottom: 24,
  },

  logo: {
    width: 250,
    height: 250,
  },

  brandName: {
    marginTop: -40,
    fontSize: 45,
    fontWeight: '700',
    color: COLORS.primaryColor,
  },

  welcomeButton: {
    width: '70%',
    borderRadius: 999,
    paddingVertical: 14,
    backgroundColor: COLORS.primaryColor,
    alignItems: 'center',
  },

  welcomeButtonText: {
    color: COLORS.whiteColor,
    fontSize: 18,
    fontWeight: '700',
  },

  formBlock: {
    width: '80%',
    marginTop: 8,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#206A5D',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  loginLabel: {
    color: COLORS.primaryColor,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#b8cfc2',
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
    color: COLORS.primaryColor,
    fontSize: 18,
    marginRight: 8,
    width: 20,
    textAlign: 'center',
  },

  loginInput: {
    flex: 1,
    color: COLORS.secondaryColor,
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
    backgroundColor: '#fff7f7',
    borderWidth: 1,
    borderColor: COLORS.errorColor,
  },

  loginButton: {
    marginTop: 14,
    backgroundColor: COLORS.primaryColor,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },

  loginButtonText: {
    color: COLORS.whiteColor,
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


  guestButton: {
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: COLORS.primaryColor,
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
    backgroundColor: '#eef5f0',
    borderWidth: 1,
    borderColor: '#d6e5db',
  },

  buttonDisabled: {
    opacity: 0.7,
  },
});

export default styles;
