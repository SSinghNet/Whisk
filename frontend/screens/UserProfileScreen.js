import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import AppButton from '../components/AppButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getUserRecipes, getPantryItems } from '../lib/api';
import styles from '../styles/UserProfileScreen.styles';
import { COLORS } from '../styles/colors';

export default function UserProfileScreen({ session, onLogout }) {
  const [stats, setStats] = useState({ recipes: 0, pantryItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = session?.user ?? {};
  const email = user.email ?? '';
  const initials = email
    ? email.slice(0, 2).toUpperCase()
    : '?';
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const [recipes, pantry] = await Promise.all([
          getUserRecipes(session.access_token),
          getPantryItems(session.access_token),
        ]);
        setStats({
          recipes: Array.isArray(recipes) ? recipes.length : 0,
          pantryItems: Array.isArray(pantry) ? pantry.length : 0,
        });
      } catch (e) {
        setError('Could not load profile stats.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Profile" />

      <ErrorMessage message={error} />

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.memberSince}>Member since {memberSince}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Text style={styles.statValue}>{stats.pantryItems}</Text>
          )}
          <View style={styles.statLabelRow}>
            <Ionicons name="basket-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.statLabel}>Pantry Items</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCard}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Text style={styles.statValue}>{stats.recipes}</Text>
          )}
          <View style={styles.statLabelRow}>
            <Ionicons name="book-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.statLabel}>Saved Recipes</Text>
          </View>
        </View>
      </View>

      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{memberSince}</Text>
          </View>
        </View>
      </View>

      <AppButton
        title="Sign Out"
        variant="danger"
        onPress={onLogout}
        style={styles.signOutBtn}
      />
    </ScrollView>
  );
}
