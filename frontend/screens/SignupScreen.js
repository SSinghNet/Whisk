import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    View,
} from 'react-native';
import AppButton from '../components/AppButton';
import styles from '../styles/SignupScreen.styles';

export default function SignupScreen({ onSignup, onSwitchToLogin, loading, error }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    function submitSignup() {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
            return;
        }

        onSignup({
            name: trimmedName,
            email: trimmedEmail,
            password,
            confirmPassword,
        });
    }

    const disableSubmit =
        loading || !name.trim() || !email.trim() || !password || !confirmPassword;

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up and start saving recipes.</Text>

                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Full Name"
                    style={styles.input}
                />

                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                />

                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    secureTextEntry
                    style={styles.input}
                />

                <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm Password"
                    secureTextEntry
                    style={styles.input}
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <AppButton
                    title="Sign Up"
                    onPress={submitSignup}
                    variant="primary"
                    disabled={disableSubmit}
                    loading={loading}
                    style={{ marginTop: 4 }}
                />

                <AppButton
                    title="Already have an account? Login"
                    onPress={onSwitchToLogin}
                    variant="secondary"
                    style={styles.secondaryButton}
                />
            </View>
        </KeyboardAvoidingView>
    );
}


