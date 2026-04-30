import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/AddPantryIngredientScreen.styles';
import { COLORS } from '../styles/colors';

export const PANTRY_UNIT_OPTIONS = [
  'count', 'gram', 'ounce', 'pound', 'milliliter', 'liter', 'gallon', 'cup', 'tablespoon', 'teaspoon',
];

export default function PantryItemQuantityPopup({
  title,
  quantity,
  onQuantityChange,
  unit,
  onUnitChange,
  expiryDate,
  onExpiryDateChange,
  primaryLabel,
  primaryIcon = 'checkmark',
  primaryLoading = false,
  onPrimary,
  onCancel,
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateStr = expiryDate ? expiryDate.toISOString().split('T')[0] : 'No expiry date';
  const pickerDate = expiryDate ?? new Date();

  return (
    <View style={styles.popupOverlay}>
      <View style={styles.popupInner}>
        <Text style={styles.popupTitle}>{title}</Text>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={styles.popupScrollContent}
        >
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            autoCapitalize="none"
            keyboardType="numeric"
            value={quantity}
            onChangeText={onQuantityChange}
          />
          <Picker
            selectedValue={unit}
            onValueChange={onUnitChange}
            style={styles.picker}
          >
            {PANTRY_UNIT_OPTIONS.map((u) => (
              <Picker.Item key={u} label={u} value={u} />
            ))}
          </Picker>
          <View style={styles.datePickerSection}>
            <Text style={styles.dateLabel}>Expiry date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, styles.dateTouchable]}
              accessibilityRole="button"
              accessibilityLabel={`Expiry date ${dateStr}, tap to change`}
            >
              <Text style={styles.dateText}>{dateStr}</Text>
              <Ionicons name="calendar-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onExpiryDateChange(null)}
              accessibilityRole="button"
              accessibilityLabel="Clear expiry date"
            >
              <Text style={styles.dateLabel}>Clear expiry date</Text>
            </TouchableOpacity>
            {showDatePicker ? (
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                  }
                  if (event?.type === 'dismissed') {
                    if (Platform.OS === 'ios') setShowDatePicker(false);
                    return;
                  }
                  if (selectedDate) {
                    onExpiryDateChange(selectedDate);
                  }
                  if (Platform.OS === 'ios') {
                    setShowDatePicker(false);
                  }
                }}
              />
            ) : null}
          </View>
        </ScrollView>
        <View style={styles.popupActionsRow}>
          <TouchableOpacity
            style={[styles.addButton, styles.popupActionHalf, primaryLoading && styles.addButtonDisabled]}
            onPress={onPrimary}
            disabled={primaryLoading}
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
          >
            {primaryLoading ? (
              <ActivityIndicator color={COLORS.buttonText} />
            ) : (
              <Ionicons name={primaryIcon} size={26} color={COLORS.buttonText} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCancel}
            style={[styles.popupClose, styles.popupActionHalf]}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Ionicons name="close" size={26} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
