import React from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const navigation = useNavigation();

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    const role = await AsyncStorage.getItem('role');

    if (!token || !role || role === 'null') {
      navigation.replace('Login');
      return null;
    }

    if (!allowedRoles.includes(role)) {
      navigation.replace('RoleCheck');
      return null;
    }

    return children;
  };

  return checkAuth();
};

export default ProtectedRoute;
