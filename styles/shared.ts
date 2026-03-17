import { TextStyle, ViewStyle } from 'react-native';

type SharedLayout = {
  safeArea: ViewStyle;
  scrollContentBottom32: ViewStyle;
  containerHorizontal18Top12Gap16: ViewStyle;
  containerHorizontal18Top12Gap18: ViewStyle;
};

type SharedComponents = {
  cardRadius20Padding16: ViewStyle;
  cardRadius22Padding18: ViewStyle;
  statusBadge: ViewStyle;
  statusText: TextStyle;
  buttonTextPrimary: TextStyle;
};

export const sharedLayout: SharedLayout = {
  safeArea: {
    flex: 1,
  },
  scrollContentBottom32: {
    paddingBottom: 32,
  },
  containerHorizontal18Top12Gap16: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 16,
  },
  containerHorizontal18Top12Gap18: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 18,
  },
};

export const sharedComponents: SharedComponents = {
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
};