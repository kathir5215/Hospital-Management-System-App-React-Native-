import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  // If already logged in, redirect to Patient
  // useEffect(() => {
  //   const checkToken = async () => {
  //     const token = await AsyncStorage.getItem('token');
  //     if (token) navigation.replace('Patients');
  //   };
  //   checkToken();
  // }, [navigation]);

  // Handle login API
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/login', { username, password });
      const token = response.data.token;
      const role = response.data.roles[0].toUpperCase();
      if (token) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('role', role);
        if (onLogin) onLogin(token, role);
        navigation.navigate('Patients');
      } else {
        setError('Invalid server response');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Account not approved. Contact admin.');
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    try {
      await api.post('/api/forgot-password', { email });
      setError('Reset link sent to email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    }
  };

  return (
    <View style={styles.container}>
      {!showForgotPassword ? (
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button
            title={loading ? 'Logging in...' : 'Login'}
            onPress={handleLogin}
            disabled={loading}
          />
          <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.link}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Your Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button title="Send Reset Link" onPress={handleForgotPassword} />
          <TouchableOpacity onPress={() => setShowForgotPassword(false)}>
            <Text style={styles.link}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && <ActivityIndicator size="large" color="#007bff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  error: { color: 'red', textAlign: 'center', marginBottom: 15 },
  link: { color: '#007bff', textAlign: 'center', marginTop: 10 },
});

export default Login;
