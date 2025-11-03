/**
 * LoginForm Component
 *
 * A sample login form component used to demonstrate test generation
 * with the React Native MCP Server.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

export interface LoginFormProps {
  /**
   * Callback when login is successful
   */
  onLoginSuccess: (username: string) => void;

  /**
   * Callback when login fails
   */
  onLoginError: (error: string) => void;

  /**
   * Optional custom validator for username
   */
  validateUsername?: (username: string) => boolean;
}

/**
 * Login form component with validation and error handling
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onLoginError,
  validateUsername,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultValidateUsername = (value: string): boolean => {
    return value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
  };

  const validator = validateUsername || defaultValidateUsername;

  const handleLogin = async () => {
    // Clear previous error
    setError(null);

    // Validate username
    if (!validator(username)) {
      const errorMsg = 'Username must be at least 3 characters and alphanumeric';
      setError(errorMsg);
      onLoginError(errorMsg);
      return;
    }

    // Validate password
    if (password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters';
      setError(errorMsg);
      onLoginError(errorMsg);
      return;
    }

    // Simulate API call
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate success
      setLoading(false);
      onLoginSuccess(username);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setLoading(false);
      setError(errorMsg);
      onLoginError(errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText} testID="error-message">
            {error}
          </Text>
        </View>
      )}

      <TextInput
        testID="username-input"
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        testID="password-input"
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        testID="login-button"
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" testID="loading-indicator" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
});
