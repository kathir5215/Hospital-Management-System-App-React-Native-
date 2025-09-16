import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import api from '../api/api';

const Signup = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (form.password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await api.post('/api/register', form);
      setSuccess('Registration successful! Waiting for admin approval.');
      setError('');
      setForm({ username: '', email: '', password: '', role: 'ADMIN' });
      setConfirmPassword('');
    } catch (error) {
      setSuccess('');
      setError(
        error.response?.data?.message ||
          'Registration failed. Please try again later.',
      );
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}
          <Text style={styles.label}>Username*</Text>
          <TextInput
            style={styles.input}
            value={form.username}
            onChangeText={text => setForm({ ...form, username: text })}
            autoCapitalize="none"
            minLength={3}
          />
          <Text style={styles.label}>Email*</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={text => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Password* (min 8 characters)</Text>
          <TextInput
            style={styles.input}
            value={form.password}
            onChangeText={text => setForm({ ...form, password: text })}
            secureTextEntry
            minLength={8}
          />
          <Text style={styles.label}>Confirm Password*</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Text style={styles.label}>Account Type*</Text>
          <Picker
            selectedValue={form.role}
            onValueChange={value => setForm({ ...form, role: value })}
            style={styles.picker}
          >
            <Picker.Item label="Admin" value="ADMIN" />
            <Picker.Item label="Doctor" value="DOCTOR" />
            <Picker.Item label="Patient" value="PATIENT" />
          </Picker>
          <Text style={styles.note}>
            {form.role} accounts require super admin approval
          </Text>
          <Button title="Register" onPress={handleSubmit} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? Login here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  success: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 15,
  },
  link: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Signup;
