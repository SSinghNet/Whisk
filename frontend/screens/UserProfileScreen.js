import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import AppButton from '../components/AppButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getUserRecipes, getPantryItems } from '../lib/api';
import { supabase } from '../lib/supabase';
import styles from '../styles/UserProfileScreen.styles';
import { COLORS } from '../styles/colors';

export default function UserProfileScreen({ session, onLogout }) {
  const [stats, setStats] = useState({ recipes: 0, pantryItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const user = session?.user ?? {};
  const email = user.email ?? '';
  const initials = email ? email.slice(0, 2).toUpperCase() : '?';
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

  function togglePasswordForm() {
    setShowPasswordForm((prev) => !prev);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(false);
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    setPasswordError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (updateError) {
      setPasswordError(updateError.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordForm(false);
      }, 2000);
    }
  }

  const canSubmitPassword = newPassword.length > 0 && confirmPassword.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoiding}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

          <View style={styles.rowDivider} />

          {/* Change Password row */}
          <TouchableOpacity
            style={styles.infoRow}
            onPress={togglePasswordForm}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Password</Text>
              <Text style={styles.changePasswordLink}>Change password</Text>
            </View>
            <Ionicons
              name={showPasswordForm ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          {/* Inline password form */}
          {showPasswordForm && (
            <View style={styles.passwordForm}>
              {passwordSuccess ? (
                <View style={styles.successRow}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  <Text style={styles.successText}>Password updated!</Text>
                </View>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="New password"
                    placeholderTextColor={COLORS.placeholder}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={(t) => { setNewPassword(t); setPasswordError(null); }}
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={COLORS.placeholder}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={(t) => { setConfirmPassword(t); setPasswordError(null); }}
                    autoCapitalize="none"
                  />
                  {passwordError ? (
                    <Text style={styles.passwordError}>{passwordError}</Text>
                  ) : null}
                  <AppButton
                    title="Update Password"
                    onPress={handleChangePassword}
                    variant="primary"
                    disabled={!canSubmitPassword}
                    loading={passwordLoading}
                  />
                  <AppButton
                    title="Cancel"
                    onPress={togglePasswordForm}
                    variant="ghost"
                  />
                </>
              )}
            </View>
          )}
        </View>

        <AppButton
          title="Sign Out"
          variant="danger"
          onPress={onLogout}
          style={styles.signOutBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
