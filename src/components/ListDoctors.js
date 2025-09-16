import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { listDoctors } from './CommonUrl';
import { getCurrentRole } from './Auth';

const ListDoctors = () => {
  const [doctors, setDoctors] = useState([]);
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
    listDoctors()
      .then(response => {
        setDoctors(response.data);
      })
      .catch(error => {
        console.error(
          'Error fetching doctors:',
          error?.response || error.message,
        );
      });
  }, []);

  const addDoctorPath = () => {
    navigation.navigate('AddDoctor');
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.phone}</Text>
      <Text style={styles.cell}>{item.available || 'N/A'}</Text>
      <View style={styles.actions}>
        {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('EditDoctor', { id: item.id })}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {role === 'SUPER_ADMIN' && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => navigation.navigate('DeleteDoctor', { id: item.id })}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>List of Doctors</Text>
      {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={addDoctorPath}
        >
          <Text style={styles.buttonText}>Add Doctor</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={doctors}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Doctor ID</Text>
            <Text style={styles.headerCell}>Doctor Name</Text>
            <Text style={styles.headerCell}>Phone</Text>
            <Text style={styles.headerCell}>Available</Text>
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
    fontSize: 11,
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
    fontSize: 12,
    color: '#343a40',
    paddingVertical: 5,
  },
  actions: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 7,
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
    fontSize: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    alignItems: 'center',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ListDoctors;
