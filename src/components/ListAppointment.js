import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCurrentRole } from './Auth';
import { listappointments } from './CommonUrl';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ListAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const navigation = useNavigation();
  const [role, setRole] = useState(false);
  useEffect(() => {
    const fetchRole = async () => {
      const role = await getCurrentRole();
      setRole(role);
    };

    fetchRole();
  }, []);

  useEffect(() => {
    listappointments()
      .then(response => {
        setAppointments(response.data);
      })
      .catch(error => {
        console.error(
          'Error fetching appointments:',
          error?.response || error.message,
        );
      });
  }, []);

  const addAppointmentPath = () => {
    navigation.navigate('AddAppointment');
  };

  // Example delete handler (uncomment and adapt as needed)
  // const handleDelete = (id) => {
  //   Alert.alert(
  //     'Confirm Delete',
  //     'Are you sure you want to delete this appointment?',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Delete',
  //         style: 'destructive',
  //         onPress: () => {
  //           api.delete(`/Aapi/${id}`)
  //             .then(() => setAppointments(appointments.filter(appt => appt.id !== id)))
  //             .catch((error) => console.error('Delete failed:', error));
  //         },
  //       },
  //     ]
  //   );
  // };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>{item.appointmentTime}</Text>
      <Text style={styles.cell}>{item.doctorId || 'N/A'}</Text>
      <Text style={styles.cell}>{item.patientId || 'N/A'}</Text>
      <View style={styles.actions}>
        {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() =>
              navigation.navigate('EditAppointment', { id: item.id })
            }
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {role === 'SUPER_ADMIN' && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() =>
              navigation.navigate('DeleteAppointment', { id: item.id })
            }
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>List of Appointments</Text>
      {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={addAppointmentPath}
        >
          <Text style={styles.buttonText}>Add Appointment</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={appointments}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Appointment ID</Text>
            <Text style={styles.headerCell}>Time</Text>
            <Text style={styles.headerCell}>Doctor ID</Text>
            <Text style={styles.headerCell}>Patient ID</Text>
            <Text style={styles.headerCell}>Actions</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a252f',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#343a40',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  rowEven: {
    backgroundColor: '#fff',
  },
  rowOdd: {
    backgroundColor: '#f1f3f5',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#343a40',
    paddingVertical: 5,
  },
  actions: {
    flex: 1,
    flexDirection: 'column', // Changed to row for cleaner layout
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8, // Added spacing between buttons
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#007bff',
    alignSelf: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  editButton: {
    backgroundColor: '#28a745', // Green for edit
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ListAppointments;
