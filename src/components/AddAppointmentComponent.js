import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createAppointments, listDoctors, listPatients } from './CommonUrl';
import { useNavigation } from '@react-navigation/native';

const AddAppointmentComponent = () => {
  const navigation = useNavigation();
  const [appointment, setAppointment] = useState({
    appointmentTime: '',
    doctorId: '',
    patientId: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    listDoctors()
      .then(res => setDoctors(res.data))
      .catch(() => setDoctors([]));
    listPatients()
      .then(res => setPatients(res.data))
      .catch(() => setPatients([]));
  }, []);
  const handleChange = (name, value) => {
    setAppointment(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!appointment.appointmentTime.trim())
      tempErrors.appointmentTime = 'Appointment time is required';
    if (!appointment.doctorId) tempErrors.doctorId = 'Doctor must be selected';
    if (!appointment.patientId)
      tempErrors.patientId = 'Patient must be selected';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await createAppointments(appointment);
        navigation.navigate('Appointments');
      } catch (err) {
        console.error('Failed to create appointment', err);
        setErrors({ submit: 'Failed to create appointment. Try again.' });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add Appointment</Text>
      {errors.submit && <Text style={styles.errorText}>{errors.submit}</Text>}
      <View style={styles.form}>
        <Text style={styles.label}>Appointment Time</Text>
        <TextInput
          style={[styles.input, errors.appointmentTime && styles.inputError]}
          placeholder="YYYY-MM-DD HH:MM"
          value={appointment.appointmentTime}
          onChangeText={text => handleChange('appointmentTime', text)}
        />
        {errors.appointmentTime && (
          <Text style={styles.errorText}>{errors.appointmentTime}</Text>
        )}

        <Text style={styles.label}>Doctor</Text>
        <Picker
          selectedValue={appointment.doctorId}
          onValueChange={value => handleChange('doctorId', value)}
          style={[styles.picker, errors.doctorId && styles.inputError]}
        >
          <Picker.Item label="Select Doctor" value="" />
          {doctors.map(doc => (
            <Picker.Item key={doc.id} label={doc.name} value={doc.id} />
          ))}
        </Picker>
        {errors.doctorId && (
          <Text style={styles.errorText}>{errors.doctorId}</Text>
        )}

        <Text style={styles.label}>Patient</Text>
        <Picker
          selectedValue={appointment.patientId}
          onValueChange={value => handleChange('patientId', value)}
          style={[styles.picker, errors.patientId && styles.inputError]}
        >
          <Picker.Item label="Select Patient" value="" />
          {patients.map(pat => (
            <Picker.Item
              key={pat.id}
              label={`${pat.firstName} ${pat.lastName}`}
              value={pat.id}
            />
          ))}
        </Picker>
        {errors.patientId && (
          <Text style={styles.errorText}>{errors.patientId}</Text>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Add Appointment</Text>
        </TouchableOpacity>
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
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
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

export default AddAppointmentComponent;
