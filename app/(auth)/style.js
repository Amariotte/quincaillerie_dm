import { StyleSheet } from 'react-native';
import COLORS from '../../styles/colors';
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5faf7',
  },

  keyboardWrapper: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
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
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 22,
  },

  loginTopBar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  logo: {
    width: 200,
    height: 200,
  },

  brandName: {
    marginTop: -30,
    fontSize: 38,
    fontWeight: '700',
    color: COLORS.primaryColor,
  },

  welcomeSubtitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondaryColor,
  },

  welcomeDescription: {
    marginTop: 12,
    fontSize: 14,
    color: '#60766a',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },

  screenTitle: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.secondaryColor,
  },

  screenSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#5f7166',
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 18,
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
    width: '100%',
    marginTop: 8,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#206A5D',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e1ede7',
  },

  loginLabel: {
    color: COLORS.primaryColor,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cfe2d8',
    borderRadius: 12,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#fcfefd',
  },

  inputRowFocused: {
    borderColor: COLORS.brandButtonColor,
    borderBottomWidth: 2,
  },

  inputRowError: {
    borderColor: COLORS.errorColor,
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
    paddingVertical: 0,
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
    marginTop: 8,
    backgroundColor: COLORS.primaryColor,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },

  loginButtonText: {
    color: COLORS.whiteColor,
    fontSize: 15,
    fontWeight: '700',
  },

  forgotLink: {
    marginTop: 6,
    marginBottom: 10,
    color: COLORS.primaryColor,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
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
    marginTop: 10,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#e9f2ed',
    borderWidth: 1,
    borderColor: '#cfe2d8',
  },

  guestButtonText: {
    color: COLORS.primaryColor,
    fontSize: 14,
    fontWeight: '700',
  },

  dividerRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d7e5de',
  },

  dividerText: {
    color: '#60766a',
    fontSize: 12,
    fontWeight: '600',
  },

  socialLinksContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },

  socialIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f8f5',
    borderWidth: 1,
    borderColor: '#d3e4db',
  },

  bottomHelpRow: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  bottomHelpText: {
    color: COLORS.primaryColor,
    fontSize: 12,
    fontWeight: '600',
  },

  buttonDisabled: {
    opacity: 0.7,
  },
});

export default styles;
