import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../api/api';
import { Picker } from '@react-native-picker/picker';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'username',
    direction: 'asc',
  });

  const normalizeUser = user => ({
    ...user,
    username: user.username || '',
    email: user.email || '',
    roles: user.roles || [],
  });

  const fetchUsers = useCallback(async () => {
    try {
      const [allUsersResponse, pendingResponse] = await Promise.all([
        api.get('/api/users?approved=true'),
        api.get('/api/users?approved=false'),
      ]);

      const filteredUsers = allUsersResponse.data
        .filter(user => !user.roles.includes('SUPER_ADMIN'))
        .map(normalizeUser);

      const filteredPending = pendingResponse.data
        .filter(user => !user.roles.includes('SUPER_ADMIN'))
        .map(normalizeUser);

      setUsers(filteredUsers);
      setPendingUsers(filteredPending);
    } catch (error) {
      setError('Failed to load users. Please refresh the page.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async userId => {
    try {
      await api.patch(`/api/users/${userId}/approve`, { approved: true });
      await fetchUsers();
      setSuccess('User approved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message || 'Approval failed. Please try again.',
      );
    }
  };

  const handleReject = async userId => {
    Alert.alert(
      'Confirm Reject',
      'Are you sure you want to reject this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/users/${userId}`);
              await fetchUsers();
              setSuccess('User rejected successfully');
              setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
              setError(
                error.response?.data?.message ||
                  'Rejection failed. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const handleDeleteUser = async userId => {
    Alert.alert('Confirm Delete', 'Permanently delete this user account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/users/${userId}`);
            await fetchUsers();
            setSuccess('User deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
          } catch (error) {
            setError(
              error.response?.data?.message ||
                'Deletion failed. Please try again.',
            );
          }
        },
      },
    ]);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/users/${userId}/role`, { role: newRole });
      await fetchUsers();
      setSuccess('User role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Role update failed. Please try again.',
      );
    }
  };

  const handleSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredPendingUsers = pendingUsers.filter(
    user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredUsers = sortedUsers.filter(
    user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderPendingUser = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>{item.username}</Text>
      <Text style={styles.cell}>{item.email}</Text>
      <Text style={styles.cell}>{item.roles[0]}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUser = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>{item.username}</Text>
      <Text style={styles.cell}>{item.email}</Text>
      <Picker
        selectedValue={item.roles[0]}
        onValueChange={value => handleRoleChange(item.id, value)}
        style={styles.picker}
      >
        <Picker.Item label="Admin" value="ADMIN" />
        <Picker.Item label="Doctor" value="DOCTOR" />
        <Picker.Item label="Patient" value="PATIENT" />
      </Picker>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteUser(item.id)}
      >
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Management</Text>
      {success && (
        <View style={styles.alertSuccess}>
          <Text style={styles.alertText}>{success}</Text>
          <TouchableOpacity onPress={() => setSuccess('')}>
            <Text style={styles.closeButton}>X</Text>
          </TouchableOpacity>
        </View>
      )}
      {error && (
        <View style={styles.alertError}>
          <Text style={styles.alertText}>{error}</Text>
          <TouchableOpacity onPress={() => setError('')}>
            <Text style={styles.closeButton}>X</Text>
          </TouchableOpacity>
        </View>
      )}
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <View style={styles.card}>
        <Text style={styles.subHeader}>
          Pending Approvals
          {filteredPendingUsers.length > 0 &&
            ` (${filteredPendingUsers.length})`}
        </Text>
        {filteredPendingUsers.length > 0 ? (
          <FlatList
            data={filteredPendingUsers}
            renderItem={renderPendingUser}
            keyExtractor={item => item.id.toString()}
            ListHeaderComponent={() => (
              <View style={styles.tableHeader}>
                <TouchableOpacity onPress={() => handleSort('id')}>
                  <Text style={styles.headerCell}>
                    ID{' '}     
                    {sortConfig.key === 'id' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('username')}>
                  <Text style={styles.headerCell}>
                    Username{' '}
                    {sortConfig.key === 'username' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.headerCell}>Email</Text>
                <Text style={styles.headerCell}>Role</Text>
                <Text style={styles.headerCell}>Actions</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.infoText}>No pending user approvals found</Text>
        )}
      </View>
      <View style={styles.card}>
        <View style={styles.subHeaderContainer}>
          <Text style={styles.subHeader}>Registered Users</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchUsers}>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {filteredUsers.length > 0 ? (
          <FlatList
            data={filteredUsers}
            renderItem={renderUser}
            keyExtractor={item => item.id.toString()}
            ListHeaderComponent={() => (
              <View style={styles.tableHeader}>
                <TouchableOpacity onPress={() => handleSort('id')}>
                  <Text style={styles.headerCell}>
                    ID{' '}
                    {sortConfig.key === 'id' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('username')}>
                  <Text style={styles.headerCell}>
                    Username{' '}
                    {sortConfig.key === 'username' &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.headerCell}>Email</Text>
                <Text style={styles.headerCell}>Role</Text>
                <Text style={styles.headerCell}>Actions</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.infoText}>No registered users found</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  picker: {
    flex: 1,
    marginHorizontal: 5,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alertSuccess: {
    backgroundColor: '#d4edda',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertError: {
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertText: {
    color: '#000',
    fontSize: 14,
  },
  closeButton: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    textAlign: 'center',
    color: '#31708f',
    fontSize: 14,
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserManagement;
