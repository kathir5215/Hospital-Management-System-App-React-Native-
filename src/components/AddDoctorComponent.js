import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createDoctors } from './CommonUrl';

const AddDoctorComponent = () => {
  const navigation = useNavigation();
  const [doctor, setDoctor] = useState({
    name: '',
    phone: '',
    gender: '',
    available: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (name, value) => {
    setDoctor(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!doctor.name.trim()) tempErrors.name = 'Name must not be empty';
    if (!doctor.phone.trim())
      tempErrors.phone = 'Phone number must not be empty';
    if (!doctor.gender.trim()) tempErrors.gender = 'Gender must not be empty';
    if (!doctor.available.trim())
      tempErrors.available = 'Availability must not be empty';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const saveDoctors = async () => {
    if (validate()) {
      try {
        await createDoctors(doctor);
        navigation.navigate('Doctors');
      } catch (error) {
        setErrors({ general: 'Failed to create a doctor' });
        console.error('Failed to create doctor:', error);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Add Doctor</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter the name"
            value={doctor.name}
            onChangeText={text => handleInputChange('name', text)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.label}>Phone Number:</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Enter the phone number"
            value={doctor.phone}
            onChangeText={text => handleInputChange('phone', text)}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <Text style={styles.label}>Gender:</Text>
          <TextInput
            style={[styles.input, errors.gender && styles.inputError]}
            placeholder="Enter the gender"
            value={doctor.gender}
            onChangeText={text => handleInputChange('gender', text)}
          />
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender}</Text>
          )}

          <Text style={styles.label}>Availability:</Text>
          <TextInput
            style={[styles.input, errors.available && styles.inputError]}
            placeholder="Enter the availability"
            value={doctor.available}
            onChangeText={text => handleInputChange('available', text)}
          />
          {errors.available && (
            <Text style={styles.errorText}>{errors.available}</Text>
          )}

          {errors.general && (
            <Text style={styles.errorText}>{errors.general}</Text>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={saveDoctors}>
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

export default AddDoctorComponent;
