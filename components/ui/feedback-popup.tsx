import COLORS from '@/styles/colors';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export type FeedbackPopupType = 'error' | 'success' | 'info';

export type FeedbackPopupProps = {
  visible: boolean;
  type: FeedbackPopupType;
  title: string;
  message: string;
  onClose: () => void;
  buttonLabel?: string;
};

const popupConfig: Record<FeedbackPopupType, {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
}> = {
  error: {
    icon: 'error-outline',
    iconColor: COLORS.errorColor,
    iconBackground: '#fee2e2',
  },
  success: {
    icon: 'check-circle-outline',
    iconColor: '#16a34a',
    iconBackground: '#dcfce7',
  },
  info: {
    icon: 'info-outline',
    iconColor: COLORS.primaryColor,
    iconBackground: '#d1fae5',
  },
};

export function FeedbackPopup({
  visible,
  type,
  title,
  message,
  onClose,
  buttonLabel = 'Fermer',
}: FeedbackPopupProps) {
  const config = popupConfig[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={[styles.iconWrap, { backgroundColor: config.iconBackground }]}>
            <MaterialIcons name={config.icon} size={34} color={config.iconColor} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#11181C',
    textAlign: 'center',
  },
  message: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#4b5563',
    textAlign: 'center',
  },
  actionButton: {
    minWidth: 140,
    marginTop: 22,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryColor,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});