// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// const HeaderComponent = ({ onLogout, role }) => {
//   const navigation = useNavigation();

//   const handleLogoutClick = () => {
//     onLogout();
//     navigation.navigate('Login');
//   };
//   console.log(role, 'ss');

//   return (
//     <View style={styles.navbar}>
//       <Text style={styles.brand}>Hospital Management System</Text>
//       {role ? (
//         <View style={styles.navContainer}>
//           <View style={styles.navLinks}>
//             <TouchableOpacity onPress={() => navigation.navigate('Patients')}>
//               <Text style={styles.navLink}>Patients</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => navigation.navigate('Doctors')}>
//               <Text style={styles.navLink}>Doctors</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() => navigation.navigate('Appointments')}
//             >
//               <Text style={styles.navLink}>Appointments</Text>
//             </TouchableOpacity>
//             {role === 'SUPER_ADMIN' && (
//               <TouchableOpacity
//                 onPress={() => navigation.navigate('MedicalInventory')}
//               >
//                 <Text style={styles.navLink}>Medical Inventory</Text>
//               </TouchableOpacity>
//             )}
//             {(role === 'SUPER_ADMIN' ||
//               role === 'ADMIN' ||
//               role === 'DOCTOR' ||
//               role === 'PATIENT') && (
//               <TouchableOpacity
//                 onPress={() => navigation.navigate('Prescriptions')}
//               >
//                 <Text style={styles.navLink}>Prescriptions</Text>
//               </TouchableOpacity>
//             )}
//             {role === 'SUPER_ADMIN' && (
//               <TouchableOpacity onPress={() => navigation.navigate('Users')}>
//                 <Text style={styles.navLink}>Registered Users</Text>
//               </TouchableOpacity>
//             )}
//             <View style={styles.authSection}>
//               <Text style={styles.roleText}>Role: {role}</Text>
//             </View>
//             <TouchableOpacity onPress={handleLogoutClick}>
//               <Text style={styles.logoutButton}>Logout</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       ) : (
//         <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//           <Text style={styles.navLink}>Login</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// // const styles = StyleSheet.create({
// //   navbar: {
// //     backgroundColor: '#1e2a38', // Darker, professional background
// //     padding: 20,
// //     paddingTop: 30, // Adjusted for status bar
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 3 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 5,
// //     elevation: 6, // Enhanced for Android
// //   },
// //   brand: {
// //     color: '#fff',
// //     fontSize: 24,
// //     fontWeight: '700',
// //     letterSpacing: 1.2,
// //     textShadowColor: 'rgba(0, 0, 0, 0.3)',
// //     textShadowOffset: { width: 1, height: 1 },
// //     textShadowRadius: 3,
// //     marginBottom: 20,
// //     textAlign: 'center',
// //   },
// //   navContainer: {
// //     flex: 1,
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     flexWrap: 'wrap',
// //     gap: 10, // Added for spacing
// //   },
// //   navLinks: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     alignItems: 'center',
// //     gap: 5, // Improved spacing between links
// //   },
// //   navLink: {
// //     color: '#fff',
// //     fontSize: 15,
// //     padding: 10,
// //     borderBottomWidth: 2,
// //     borderBottomColor: 'transparent',
// //     fontWeight: '600',
// //   },
// //   authSection: {
// //     flexDirection: 'column',
// //     alignItems: 'center',
// //   },
// //   roleText: {
// //     color: '#fff',
// //     fontSize: 15,
// //     fontWeight: '500',
// //   },
// //   logoutButton: {
// //     color: '#fff',
// //     backgroundColor: '#007bff',
// //     paddingVertical: 10,
// //     paddingHorizontal: 20,
// //     borderRadius: 10,
// //     fontSize: 12,
// //     fontWeight: '600',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 1 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 2,
// //     elevation: 2,
// //   },
// // });

// const styles = StyleSheet.create({
//   navbar: {
//     backgroundColor: '#1e2a38',
//     padding: 15,
//     paddingTop: 35,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 5,
//     elevation: 6,
//   },
//   brand: {
//     color: '#fff',
//     fontSize: 24,
//     fontWeight: '700',
//     letterSpacing: 1.2,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   navContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//   },
//   navLinks: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     alignItems: 'center',
//     gap: 15,
//   },
//   navLink: {
//     color: '#fff',
//     fontSize: 15,
//     padding: 10,
//     borderBottomWidth: 2,
//     borderBottomColor: 'transparent',
//     fontWeight: '600',
//   },
//   authSection: {
//     flexDirection: 'column',
//     alignItems: 'flex-end',
//     gap: 8,
//   },
//   roleText: {
//     color: '#e9ecef',
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   logoutButton: {
//     color: '#fff',
//     backgroundColor: '#007bff',
//     paddingVertical: 8,
//     paddingHorizontal: 18,
//     borderRadius: 10,
//     fontSize: 15,
//     fontWeight: '600',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 2,
//   },
// });

// export default HeaderComponent;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HeaderComponent = ({ onLogout, role }) => {
  const navigation = useNavigation();

  const handleLogoutClick = () => {
    onLogout();
    navigation.navigate('Login');
  };

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.headerContainer}>
        {role && (
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <Icon name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={styles.brand}>Hospital Management System</Text>
        {role && (
          <TouchableOpacity
            onPress={handleLogoutClick}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#1e2a38',
    padding: 15,
    paddingTop: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    padding: 10,
  },
  logoutButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default HeaderComponent;
