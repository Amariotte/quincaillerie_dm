import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ActiveField = 'start' | 'end' | null;

type DateRangePickerProps = {
  startDateValue: string;
  endDateValue: string;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
  cardColor: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  tintColor: string;
};

const formatPickerDate = (value: Date) => {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
};

const parsePickerDate = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const [day, month, year] = trimmed.split('/');
  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);

  if (
    !Number.isInteger(dayNum) ||
    !Number.isInteger(monthNum) ||
    !Number.isInteger(yearNum) ||
    dayNum < 1 ||
    dayNum > 31 ||
    monthNum < 1 ||
    monthNum > 12 ||
    yearNum < 1900
  ) {
    return null;
  }

  const parsed = new Date(yearNum, monthNum - 1, dayNum);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getDate() !== dayNum ||
    parsed.getMonth() !== monthNum - 1 ||
    parsed.getFullYear() !== yearNum
  ) {
    return null;
  }

  return parsed;
};

export function DateRangePicker({
  startDateValue,
  endDateValue,
  onChangeStartDate,
  onChangeEndDate,
  cardColor,
  borderColor,
  textColor,
  mutedColor,
  tintColor,
}: DateRangePickerProps) {
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [iosDraftDate, setIosDraftDate] = useState(new Date());

  const applyDate = (field: Exclude<ActiveField, null>, value: Date) => {
    const formatted = formatPickerDate(value);

    if (field === 'start') {
      onChangeStartDate(formatted);
      return;
    }

    onChangeEndDate(formatted);
  };

  const openPicker = (field: Exclude<ActiveField, null>) => {
    const currentValue = field === 'start' ? startDateValue : endDateValue;
    const baseDate = parsePickerDate(currentValue) ?? new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: baseDate,
        mode: 'date',
        is24Hour: true,
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type !== 'set' || !selectedDate) {
            return;
          }

          applyDate(field, selectedDate);
        },
      });
      return;
    }

    setIosDraftDate(baseDate);
    setActiveField(field);
  };

  const clearField = (field: Exclude<ActiveField, null>) => {
    if (field === 'start') {
      onChangeStartDate('');
      return;
    }

    onChangeEndDate('');
  };

  const resetPeriod = () => {
    onChangeStartDate('');
    onChangeEndDate('');
  };

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.row}>
          <View style={[styles.fieldBox, { backgroundColor: cardColor, borderColor }]}> 
            <TouchableOpacity style={styles.fieldPressable} onPress={() => openPicker('start')} activeOpacity={0.8}>
              <MaterialIcons name="calendar-month" size={18} color={mutedColor} />
              <Text style={[styles.fieldText, { color: startDateValue ? textColor : mutedColor }]}>
                {startDateValue || 'Du'}
              </Text>
            </TouchableOpacity>
            {startDateValue ? (
              <TouchableOpacity onPress={() => clearField('start')} style={styles.clearButton} hitSlop={8}>
                <MaterialIcons name="close" size={16} color={mutedColor} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={[styles.fieldBox, { backgroundColor: cardColor, borderColor }]}> 
            <TouchableOpacity style={styles.fieldPressable} onPress={() => openPicker('end')} activeOpacity={0.8}>
              <MaterialIcons name="event" size={18} color={mutedColor} />
              <Text style={[styles.fieldText, { color: endDateValue ? textColor : mutedColor }]}>
                {endDateValue || 'Au'}
              </Text>
            </TouchableOpacity>
            {endDateValue ? (
              <TouchableOpacity onPress={() => clearField('end')} style={styles.clearButton} hitSlop={8}>
                <MaterialIcons name="close" size={16} color={mutedColor} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {startDateValue || endDateValue ? (
          <Pressable onPress={resetPeriod} style={styles.resetButton}>
            <MaterialIcons name="restart-alt" size={16} color={tintColor} />
            <Text style={[styles.resetText, { color: tintColor }]}>Réinitialiser la période</Text>
          </Pressable>
        ) : null}
      </View>

      {Platform.OS === 'ios' ? (
        <Modal visible={activeField !== null} transparent animationType="fade" onRequestClose={() => setActiveField(null)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveField(null)}>
            <Pressable style={styles.modalCard} onPress={() => undefined}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setActiveField(null)}>
                  <Text style={[styles.modalActionText, { color: mutedColor }]}>Annuler</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: textColor }]}>Choisir une date</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (activeField) {
                      applyDate(activeField, iosDraftDate);
                    }
                    setActiveField(null);
                  }}
                >
                  <Text style={[styles.modalActionText, { color: tintColor }]}>Valider</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={iosDraftDate}
                mode="date"
                display="inline"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setIosDraftDate(selectedDate);
                  }
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldBox: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 4,
  },
  fieldPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  fieldText: {
    flex: 1,
    fontSize: 14,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});