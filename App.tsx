import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderComponent from './src/components/HeaderComponent';
import Login from './src/components/Login';
import Signup from './src/components/Signup';
import UserManagement from './src/components/UserManagement';
import ListPatients from './src/components/ListPatients';
import ListDoctors from './src/components/ListDoctors';
import ListAppointments from './src/components/ListAppointment';
import MedicalInventory from './src/components/MedicalInventory';
import PrescriptionForm from './src/components/PrescriptionForm';
import AddPatientComponent from './src/components/AddPatientComponent';
import AddDoctorComponent from './src/components/AddDoctorComponent';
import AddAppointmentComponent from './src/components/AddAppointmentComponent';

export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'PATIENT' | null;

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation, role, onLogout }) => {
  const handleLogoutClick = () => {
    onLogout();
    navigation.navigate('Login');
  };

  return (
    <View style={drawerStyles.drawerContainer}>
      <Text style={drawerStyles.drawerTitle}>Hospital Management System</Text>
      {role && (
        <>
          <TouchableOpacity
            onPress={() => navigation.navigate('Patients')}
            style={drawerStyles.drawerItem}
          >
            <Text style={drawerStyles.drawerItemText}>Patients</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Doctors')}
            style={drawerStyles.drawerItem}
          >
            <Text style={drawerStyles.drawerItemText}>Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Appointments')}
            style={drawerStyles.drawerItem}
          >
            <Text style={drawerStyles.drawerItemText}>Appointments</Text>
          </TouchableOpacity>
          {role === 'SUPER_ADMIN' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('MedicalInventory')}
              style={drawerStyles.drawerItem}
            >
              <Text style={drawerStyles.drawerItemText}>Medical Inventory</Text>
            </TouchableOpacity>
          )}
          {(role === 'SUPER_ADMIN' ||
            role === 'ADMIN' ||
            role === 'DOCTOR' ||
            role === 'PATIENT') && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Prescriptions')}
              style={drawerStyles.drawerItem}
            >
              <Text style={drawerStyles.drawerItemText}>Prescriptions</Text>
            </TouchableOpacity>
          )}
          {role === 'SUPER_ADMIN' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Users')}
              style={drawerStyles.drawerItem}
            >
              <Text style={drawerStyles.drawerItemText}>Registered Users</Text>
            </TouchableOpacity>
          )}
          {/* {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddPatient')}
              style={drawerStyles.drawerItem}
            >
              <Text style={drawerStyles.drawerItemText}>Add Patient</Text>
            </TouchableOpacity>
          )}
          {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddDoctor')}
              style={drawerStyles.drawerItem}
            >
              <Text style={drawerStyles.drawerItemText}>Add Doctor</Text>
            </TouchableOpacity>
          )}
          {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddAppointment')}
              style={drawerStyles.drawerItem}
            >
              <Text style={drawerStyles.drawerItemText}>Add Appointment</Text>
            </TouchableOpacity>
          )} */}
        </>
      )}
      {!role && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={drawerStyles.drawerItem}
        >
          <Text style={drawerStyles.drawerItemText}>Signup</Text>
        </TouchableOpacity>
      )}
      {role && (
        <View style={drawerStyles.authSection}>
          <Text style={drawerStyles.roleText}>Role: {role}</Text>
          <TouchableOpacity
            onPress={handleLogoutClick}
            style={drawerStyles.logoutButton}
          >
            <Text style={drawerStyles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const drawerStyles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#1e2a38',
    padding: 20,
    paddingTop: 40,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  drawerItem: {
    padding: 10,
    marginVertical: 5,
  },
  drawerItemText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  authSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 10,
    alignItems: 'center',
  },
  roleText: {
    color: '#e9ecef',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

const App = () => {
  const [role, setRole] = useState<RoleType>(null);

  // Handle login
  const handleLogin = async (token: string, userRole: string) => {
    await AsyncStorage.setItem('token', token);
    const upperRole = userRole.toUpperCase() as RoleType;
    await AsyncStorage.setItem('role', upperRole || '');
    setRole(upperRole);
  };

  // Handle logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    setRole(null);
  };

  // Fetch role on app start
  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await AsyncStorage.getItem('role');
      if (storedRole) setRole(storedRole as RoleType);
    };
    fetchRole();
  }, []);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Login"
        drawerContent={props => (
          <CustomDrawerContent {...props} role={role} onLogout={handleLogout} />
        )}
        screenOptions={{
          header: props => (
            <HeaderComponent {...props} role={role} onLogout={handleLogout} />
          ),
          drawerStyle: {
            backgroundColor: '#1e2a38',
            width: 250,
          },
          // Disable animations to avoid reanimated issues if not configured
          drawerType: 'front',
          swipeEnabled: true,
        }}
      >
        <Drawer.Screen
          name="Login"
          options={{ drawerItemStyle: { display: 'none' } }}
        >
          {props => <Login {...props} onLogin={handleLogin} />}
        </Drawer.Screen>
        <Drawer.Screen name="Signup" component={Signup} />
        <Drawer.Screen name="Users" component={UserManagement} />
        <Drawer.Screen name="Patients" component={ListPatients} />
        <Drawer.Screen name="Doctors" component={ListDoctors} />
        <Drawer.Screen name="Appointments" component={ListAppointments} />
        <Drawer.Screen name="MedicalInventory" component={MedicalInventory} />
        <Drawer.Screen name="Prescriptions" component={PrescriptionForm} />
        <Drawer.Screen name="AddPatient" component={AddPatientComponent} />
        <Drawer.Screen name="AddDoctor" component={AddDoctorComponent} />
        <Drawer.Screen
          name="AddAppointment"
          component={AddAppointmentComponent}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default App;
