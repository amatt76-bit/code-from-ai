/**
 * Profile Screen
 * User profile, settings, and account management
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useUserStore } from '@store/userStore';
import { getLevelForXP, LEVEL_UNLOCKS } from '@constants/levels';
import { Card, LevelBadge, Badge, Button } from '@components';
import { colors, typography, spacing } from '@theme';

export function ProfileScreen({ navigation }: any) {
  const { user, updateSettings } = useUserStore();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const levelInfo = getLevelForXP(user.totalXP);
  const unlocks = LEVEL_UNLOCKS[user.level] || [];

  const handleToggleSetting = (key: keyof typeof user.settings) => {
    updateSettings(user.id, {
      ...user.settings,
      [key]: !user.settings[key],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <LevelBadge levelInfo={levelInfo} size="large" showName />
        <Text style={styles.username}>{user.username}</Text>

        {user.prestigeLevel > 0 && (
          <View style={styles.prestigeContainer}>
            <Badge
              label={`Prestige ${user.prestigeLevel}`}
              variant="warning"
              size="medium"
              icon={<Text>🌟</Text>}
            />
          </View>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>

        <Card style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatItem label="Total XP" value={user.totalXP.toLocaleString()} />
            <StatItem label="Level" value={user.level} />
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <StatItem label="Combo Streak" value={user.currentComboStreak} />
            <StatItem
              label="Multiplier"
              value={`${user.comboMultiplier}x`}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <StatItem
              label="Mercy Passes"
              value={user.mercyPassesRemaining}
            />
            <StatItem
              label="Used Total"
              value={user.mercyPassesUsedTotal}
            />
          </View>
        </Card>
      </View>

      {/* Level Unlocks */}
      {unlocks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level {user.level} Unlocks</Text>
          <Card>
            {unlocks.map((unlock, index) => (
              <View
                key={index}
                style={[
                  styles.unlockItem,
                  index === unlocks.length - 1 && styles.unlockItemLast,
                ]}
              >
                <Text style={styles.unlockBullet}>✓</Text>
                <Text style={styles.unlockText}>{unlock}</Text>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <Card>
          <SettingRow
            label="Notifications"
            value={user.settings.notificationsEnabled}
            onToggle={() => handleToggleSetting('notificationsEnabled')}
          />
          <SettingRow
            label="Sound"
            value={user.settings.soundEnabled}
            onToggle={() => handleToggleSetting('soundEnabled')}
          />
          <SettingRow
            label="Confetti"
            value={user.settings.confettiEnabled}
            onToggle={() => handleToggleSetting('confettiEnabled')}
          />
          <SettingRow
            label="Haptic Feedback"
            value={user.settings.hapticEnabled}
            onToggle={() => handleToggleSetting('hapticEnabled')}
            isLast
          />
        </Card>
      </View>

      {/* Personality */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personality Mode</Text>
        <Card>
          <Text style={styles.personalityValue}>
            {user.settings.globalPersonality.charAt(0).toUpperCase() +
              user.settings.globalPersonality.slice(1)}
          </Text>
          <Text style={styles.personalityDescription}>
            Change how the app talks to you
          </Text>
        </Card>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Button
          title="View Database Info"
          onPress={() => {
            /* Show database migration info */
          }}
          variant="outline"
          fullWidth
        />

        {user.level >= 20 && user.prestigeLevel < 3 && (
          <Button
            title="🌟 Prestige (Reset to Level 1)"
            onPress={() => {
              /* Handle prestige */
            }}
            variant="warning"
            fullWidth
            style={styles.prestigeButton}
          />
        )}
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Habit Hero v1.0.0</Text>
        <Text style={styles.footerText}>Made with ❤️ and Claude Code</Text>
      </View>
    </ScrollView>
  );
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({
  label,
  value,
  onToggle,
  isLast,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.settingRow, !isLast && styles.settingRowBorder]}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },

  username: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },

  prestigeContainer: {
    marginTop: spacing.sm,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  statsGrid: {
    padding: spacing.md,
  },

  statsRow: {
    flexDirection: 'row',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },

  statValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },

  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  unlockItem: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  unlockItemLast: {
    borderBottomWidth: 0,
  },

  unlockBullet: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.success,
    marginRight: spacing.sm,
  },

  unlockText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },

  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  settingLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
  },

  personalityValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  personalityDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },

  prestigeButton: {
    marginTop: spacing.md,
  },

  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  footerText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
