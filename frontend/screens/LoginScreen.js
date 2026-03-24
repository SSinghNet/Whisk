import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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

                <TouchableOpacity
                    style={[styles.primaryButton, disableSubmit && styles.disabledButton]}
                    onPress={submitLogin}
                    disabled={disableSubmit}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={onSwitchToSignup}>
                    <Text style={styles.secondaryButtonText}>Need an account? Sign up</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#f6f7fb',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: '#6b7280',
        marginBottom: 18,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        marginBottom: 12,
        backgroundColor: '#ffffff',
    },
    primaryButton: {
        backgroundColor: '#2563eb',
        borderRadius: 10,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    disabledButton: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        marginTop: 14,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        color: '#dc2626',
        marginBottom: 8,
        fontSize: 13,
    },
});
