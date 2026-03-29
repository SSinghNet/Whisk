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
import styles from '../styles/LoginScreen.styles';

export default function LoginScreen({ onLogin, onSwitchToSignup, loading, error }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function submitLogin() {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            return;
        }

        onLogin({
            email: trimmedEmail,
            password,
        });
    }

    const disableSubmit = loading || !email.trim() || !password;

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Login to continue using Whisk.</Text>

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

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <AppButton
                    title="Login"
                    onPress={submitLogin}
                    variant="primary"
                    disabled={disableSubmit}
                    loading={loading}
                    style={{ marginTop: 4 }}
                />

                <AppButton
                    title="Need an account? Sign up"
                    onPress={onSwitchToSignup}
                    variant="secondary"
                    style={styles.secondaryButton}
                />
            </View>
        </KeyboardAvoidingView>
    );
}


