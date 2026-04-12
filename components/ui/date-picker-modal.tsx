// Web-compatible date picker modal. Uses ScrollView-based day/month/year
// columns since react-native-modal-datetime-picker doesn't work on web.
import { palette } from '@/constants/theme';
import { colors, radius, spacing, typography } from '@/styles';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { AppText } from './app-text';

type DatePickerModalProps = {
  isVisible: boolean;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  maximumDate?: Date;
  currentValue?: string; // YYYY-MM-DD
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function ScrollPicker({
  items,
  selectedIndex,
  onSelect,
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const scrollRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, [selectedIndex]);

  return (
    <View style={pickerStyles.container}>
      {/* Selection highlight */}
      <View style={pickerStyles.highlight} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          onSelect(Math.max(0, Math.min(idx, items.length - 1)));
        }}
      >
        {items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={pickerStyles.item}
            onPress={() => {
              onSelect(i);
              scrollRef.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
            }}
          >
            <AppText style={[
              pickerStyles.itemText,
              i === selectedIndex && pickerStyles.selectedItemText,
            ]}>
              {item}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    flex: 1,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: palette.amber,
    opacity: 0.15,
    borderRadius: radius.sm,
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: typography.default,
    color: colors.textPrimary,
    opacity: 0.5,
  },
  selectedItemText: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
    opacity: 1,
  },
});

export function DatePickerModal({
  isVisible,
  onConfirm,
  onCancel,
  maximumDate,
  currentValue,
}: DatePickerModalProps) {
  const now = new Date();
  const maxYear = maximumDate ? maximumDate.getFullYear() : now.getFullYear();
  const minYear = maxYear - 18;

  // Parse current value or default to today
  const parsed = currentValue ? new Date(currentValue) : now;
  const initYear  = Math.min(Math.max(parsed.getFullYear(), minYear), maxYear);
  const initMonth = parsed.getMonth(); // 0-indexed
  const initDay   = parsed.getDate() - 1; // 0-indexed

  const [selectedYear,  setSelectedYear]  = useState(initYear - minYear);
  const [selectedMonth, setSelectedMonth] = useState(initMonth);
  const [selectedDay,   setSelectedDay]   = useState(initDay);

  // Build year list oldest → newest
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) =>
    String(minYear + i)
  );

  // Days in selected month/year
  const year  = minYear + selectedYear;
  const month = selectedMonth;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days  = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );

  // Clamp day if month changes
  const clampedDay = Math.min(selectedDay, daysInMonth - 1);

  const handleConfirm = () => {
    const date = new Date(year, month, clampedDay + 1);
    onConfirm(date);
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onCancel}>
        <TouchableOpacity activeOpacity={1} style={modalStyles.sheet}>

          {/* Title row */}
          <View style={modalStyles.titleRow}>
            <TouchableOpacity onPress={onCancel}>
              <AppText style={modalStyles.cancelText}>Cancel</AppText>
            </TouchableOpacity>
            <AppText variant="heading" style={modalStyles.title}>Date of Birth</AppText>
            <TouchableOpacity onPress={handleConfirm}>
              <AppText style={modalStyles.confirmText}>Confirm</AppText>
            </TouchableOpacity>
          </View>

          {/* Column headers */}
          <View style={modalStyles.columnHeaders}>
            <AppText style={[modalStyles.columnHeader, { flex: 1.4 }]}>Month</AppText>
            <AppText style={[modalStyles.columnHeader, { flex: 0.7 }]}>Day</AppText>
            <AppText style={[modalStyles.columnHeader, { flex: 1 }]}>Year</AppText>
          </View>

          {/* Picker columns */}
          <View style={modalStyles.pickersRow}>
            <ScrollPicker
              items={MONTHS}
              selectedIndex={selectedMonth}
              onSelect={setSelectedMonth}
            />
            <ScrollPicker
              items={days}
              selectedIndex={clampedDay}
              onSelect={setSelectedDay}
            />
            <ScrollPicker
              items={years}
              selectedIndex={selectedYear}
              onSelect={setSelectedYear}
            />
          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.title,
    color: colors.textPrimary,
  },
  cancelText: {
    fontSize: typography.default,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  confirmText: {
    fontSize: typography.default,
    color: palette.amber,
    fontWeight: '700',
  },
  columnHeaders: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  columnHeader: {
    fontSize: typography.tiny,
    fontWeight: '600',
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  pickersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});