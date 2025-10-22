/**
 * Root Navigator
 * Main navigation structure
 *
 * TODO: Implement full navigation with tabs and stacks
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

const RootNavigator = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Habit Hero</Text>
      <Text style={styles.subtitle}>Database Layer Complete!</Text>
      <Text style={styles.message}>
        ✅ SQLite schema created{'\n'}
        ✅ CRUD queries implemented{'\n'}
        ✅ Seeders ready{'\n'}
        {'\n'}
        📋 Next: Build UI screens
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: typography.heading1.fontSize,
    fontWeight: typography.heading1.fontWeight,
    color: colors.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: typography.heading3.fontSize,
    fontWeight: typography.heading3.fontWeight,
    color: colors.text.primary,
    marginBottom: 24,
  },
  message: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default RootNavigator;
