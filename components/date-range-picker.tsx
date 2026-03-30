import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ActiveField = "start" | "end" | null;

type PeriodPreset = "day" | "week" | "month" | "year";

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
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatLongDate = (value: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
};

const formatShortDate = (value: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(value);
};

const formatMonthYear = (value: Date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(value);
};

const parsePickerDate = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const [day, month, year] = trimmed.split("/");
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

const getStartOfWeek = (value: Date) => {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
};

const getEndOfWeek = (value: Date) => {
  const startOfWeek = getStartOfWeek(value);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return endOfWeek;
};

const getPresetRange = (preset: PeriodPreset) => {
  const now = new Date();

  if (preset === "day") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    };
  }

  if (preset === "week") {
    return {
      start: getStartOfWeek(now),
      end: getEndOfWeek(now),
    };
  }

  if (preset === "month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  }

  return {
    start: new Date(now.getFullYear(), 0, 1),
    end: new Date(now.getFullYear(), 11, 31),
  };
};

const getWeekNumber = (value: Date) => {
  const date = new Date(
    Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()),
  );
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const isSameRange = (
  startDateValue: string,
  endDateValue: string,
  start: Date,
  end: Date,
) => {
  return (
    startDateValue === formatPickerDate(start) &&
    endDateValue === formatPickerDate(end)
  );
};

const detectPresetFromRange = (
  startDateValue: string,
  endDateValue: string,
): PeriodPreset | null => {
  if (!startDateValue || !endDateValue) {
    return null;
  }

  const dayRange = getPresetRange("day");
  if (isSameRange(startDateValue, endDateValue, dayRange.start, dayRange.end)) {
    return "day";
  }

  const weekRange = getPresetRange("week");
  if (
    isSameRange(startDateValue, endDateValue, weekRange.start, weekRange.end)
  ) {
    return "week";
  }

  const monthRange = getPresetRange("month");
  if (
    isSameRange(startDateValue, endDateValue, monthRange.start, monthRange.end)
  ) {
    return "month";
  }

  const yearRange = getPresetRange("year");
  if (
    isSameRange(startDateValue, endDateValue, yearRange.start, yearRange.end)
  ) {
    return "year";
  }

  return null;
};

const formatPeriodLabel = (
  preset: PeriodPreset | null,
  startDateValue: string,
  endDateValue: string,
) => {
  const startDate = parsePickerDate(startDateValue);
  const endDate = parsePickerDate(endDateValue);

  if (preset === "day" && startDate) {
    return `Jour : ${formatLongDate(startDate)}`;
  }

  if (preset === "week" && startDate && endDate) {
    const weekNumber = getWeekNumber(startDate);
    return `Semaine ${weekNumber} : du ${formatShortDate(startDate)} au ${formatLongDate(endDate)}`;
  }

  if (preset === "month" && startDate) {
    return `Mois : ${formatMonthYear(startDate)}`;
  }

  if (preset === "year" && startDate) {
    return `Année : ${startDate.getFullYear()}`;
  }

  if (startDateValue && endDateValue) {
    return `Période : du ${startDateValue} au ${endDateValue}`;
  }

  if (startDateValue) {
    return `À partir du ${startDateValue}`;
  }

  if (endDateValue) {
    return `Jusqu'au ${endDateValue}`;
  }

  return "";
};

const presetOptions: { key: PeriodPreset; label: string }[] = [
  { key: "day", label: "Jour" },
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "year", label: "Année" },
];

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
  const [selectedPreset, setSelectedPreset] = useState<PeriodPreset | null>(
    null,
  );

  useEffect(() => {
    if (!startDateValue && !endDateValue) {
      setSelectedPreset(null);
      return;
    }

    setSelectedPreset((currentPreset) => {
      const detectedPreset = detectPresetFromRange(
        startDateValue,
        endDateValue,
      );

      if (detectedPreset) {
        return detectedPreset;
      }

      return currentPreset;
    });
  }, [endDateValue, startDateValue]);

  const applyDate = (field: Exclude<ActiveField, null>, value: Date) => {
    const formatted = formatPickerDate(value);
    setSelectedPreset(null);

    if (field === "start") {
      onChangeStartDate(formatted);
      return;
    }

    onChangeEndDate(formatted);
  };

  const applyPreset = (preset: PeriodPreset) => {
    const range = getPresetRange(preset);

    onChangeStartDate(formatPickerDate(range.start));
    onChangeEndDate(formatPickerDate(range.end));
    setSelectedPreset(preset);
  };

  const openPicker = (field: Exclude<ActiveField, null>) => {
    const currentValue = field === "start" ? startDateValue : endDateValue;
    const baseDate = parsePickerDate(currentValue) ?? new Date();

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: baseDate,
        mode: "date",
        is24Hour: true,
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type !== "set" || !selectedDate) {
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
    setSelectedPreset(null);

    if (field === "start") {
      onChangeStartDate("");
      return;
    }

    onChangeEndDate("");
  };

  const resetPeriod = () => {
    setSelectedPreset(null);
    onChangeStartDate("");
    onChangeEndDate("");
  };

  const periodLabel = useMemo(
    () => formatPeriodLabel(selectedPreset, startDateValue, endDateValue),
    [endDateValue, selectedPreset, startDateValue],
  );

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.row}>
          <View
            style={[
              styles.fieldBox,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <TouchableOpacity
              style={styles.fieldPressable}
              onPress={() => openPicker("start")}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="calendar-month"
                size={18}
                color={mutedColor}
              />
              <Text
                style={[
                  styles.fieldText,
                  { color: startDateValue ? textColor : mutedColor },
                ]}
              >
                {startDateValue || "Du"}
              </Text>
            </TouchableOpacity>
            {startDateValue ? (
              <TouchableOpacity
                onPress={() => clearField("start")}
                style={styles.clearButton}
                hitSlop={8}
              >
                <MaterialIcons name="close" size={16} color={mutedColor} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View
            style={[
              styles.fieldBox,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <TouchableOpacity
              style={styles.fieldPressable}
              onPress={() => openPicker("end")}
              activeOpacity={0.8}
            >
              <MaterialIcons name="event" size={18} color={mutedColor} />
              <Text
                style={[
                  styles.fieldText,
                  { color: endDateValue ? textColor : mutedColor },
                ]}
              >
                {endDateValue || "Au"}
              </Text>
            </TouchableOpacity>
            {endDateValue ? (
              <TouchableOpacity
                onPress={() => clearField("end")}
                style={styles.clearButton}
                hitSlop={8}
              >
                <MaterialIcons name="close" size={16} color={mutedColor} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.presetRow}>
          {presetOptions.map((option) => {
            const isActive = option.key === selectedPreset;

            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => applyPreset(option.key)}
                activeOpacity={0.85}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: isActive ? tintColor : cardColor,
                    borderColor: isActive ? tintColor : borderColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    { color: isActive ? "#ffffff" : textColor },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {periodLabel ? (
          <View
            style={[
              styles.periodSummary,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <MaterialIcons name="date-range" size={16} color={tintColor} />
            <Text style={[styles.periodSummaryText, { color: textColor }]}>
              {periodLabel}
            </Text>
          </View>
        ) : null}

        {startDateValue || endDateValue ? (
          <Pressable onPress={resetPeriod} style={styles.resetButton}>
            <MaterialIcons name="restart-alt" size={16} color={tintColor} />
            <Text style={[styles.resetText, { color: tintColor }]}>
              Réinitialiser la période
            </Text>
          </Pressable>
        ) : null}
      </View>

      {Platform.OS === "ios" ? (
        <Modal
          visible={activeField !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveField(null)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setActiveField(null)}
          >
            <Pressable style={styles.modalCard} onPress={() => undefined}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setActiveField(null)}>
                  <Text style={[styles.modalActionText, { color: mutedColor }]}>
                    Annuler
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  Choisir une date
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (activeField) {
                      applyDate(activeField, iosDraftDate);
                    }
                    setActiveField(null);
                  }}
                >
                  <Text style={[styles.modalActionText, { color: tintColor }]}>
                    Valider
                  </Text>
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
    flexDirection: "row",
    gap: 10,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  fieldBox: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 4,
  },
  fieldPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  presetChip: {
    minWidth: 78,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  periodSummary: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  periodSummaryText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  resetButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 13,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
