import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCurrentRole = async () => {
  const role = await AsyncStorage.getItem('role');
  return role ? role?.trim()?.toUpperCase() || '' : null;
};
