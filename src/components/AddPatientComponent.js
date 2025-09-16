import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { createPatients } from './CommonUrl';
import { useNavigation } from '@react-navigation/native';

const AddPatientComponent = () => {
  const navigation = useNavigation();
  const [patient, setPatient] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    gender: '',
  });
  const [error, setError] = useState({});

  const handleChanges = (name, value) => {
    setPatient(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let throwable = {};
    if (!patient.firstName.trim())
      throwable.firstName = 'FirstName must not be empty';
    if (!patient.lastName.trim())
      throwable.lastName = 'LastName must not be empty';
    if (!patient.phone.trim()) throwable.phone = 'Phone no must not be empty';
    if (!patient.address.trim())
      throwable.address = 'Address must not be empty';
    if (!patient.gender.trim()) throwable.gender = 'Gender must not be empty';
    setError(throwable);
    return Object.keys(throwable).length === 0;
  };

  const savePatient = async () => {
    if (validate()) {
      try {
        await createPatients(patient);
        navigation.navigate('Patients');
      } catch (error) {
        console.error('Failed', error);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Add Patient</Text>
        <View style={styles.form}>
          <Text style={styles.label}>FirstName:</Text>
          <TextInput
            style={[styles.input, error.firstName && styles.inputError]}
            placeholder="Enter the FirstName"
            value={patient.firstName}
            onChangeText={text => handleChanges('firstName', text)}
          />
          {error.firstName && (
            <Text style={styles.errorText}>{error.firstName}</Text>
          )}

          <Text style={styles.label}>LastName:</Text>
          <TextInput
            style={[styles.input, error.lastName && styles.inputError]}
            placeholder="Enter the LastName"
            value={patient.lastName}
            onChangeText={text => handleChanges('lastName', text)}
          />
          {error.lastName && (
            <Text style={styles.errorText}>{error.lastName}</Text>
          )}

          <Text style={styles.label}>Phone no:</Text>
          <TextInput
            style={[styles.input, error.phone && styles.inputError]}
            placeholder="Enter the Phone no"
            value={patient.phone}
            onChangeText={text => handleChanges('phone', text)}
            keyboardType="phone-pad"
          />
          {error.phone && <Text style={styles.errorText}>{error.phone}</Text>}

          <Text style={styles.label}>Address:</Text>
          <TextInput
            style={[styles.input, error.address && styles.inputError]}
            placeholder="Enter the Address"
            value={patient.address}
            onChangeText={text => handleChanges('address', text)}
          />
          {error.address && (
            <Text style={styles.errorText}>{error.address}</Text>
          )}

          <Text style={styles.label}>Gender:</Text>
          <TextInput
            style={[styles.input, error.gender && styles.inputError]}
            placeholder="Enter the Gender"
            value={patient.gender}
            onChangeText={text => handleChanges('gender', text)}
          />
          {error.gender && <Text style={styles.errorText}>{error.gender}</Text>}

          <TouchableOpacity style={styles.submitButton} onPress={savePatient}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPatientComponent;
