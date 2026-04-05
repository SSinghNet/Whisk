import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, THEME } from '../styles/colors';

export default function LoadingSpinner({
  size = 'large',
  style,
  containerStyle,
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={size} color={COLORS.primary} style={style} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
