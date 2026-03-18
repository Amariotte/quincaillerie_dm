import { useThemeColor } from '@/hooks/use-theme-color';

export type AppTheme = {
  backgroundColor: string;
  textColor: string;
  tintColor: string;
  cardColor: string;
  mutedColor: string;
  borderColor: string;
};

export function useAppTheme(): AppTheme {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'text');

  return { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor };
}
