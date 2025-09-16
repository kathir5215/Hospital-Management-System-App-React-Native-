import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { getCurrentRole } from './Auth';
import api from '../api/api';

const MedicalInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currentStock: 0,
    minimumStockLevel: 5,
  });
  const [imageFile, setImageFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const navigation = useNavigation();
  const [role, setRole] = useState(false);

  // Fetch user role
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const r = await getCurrentRole();
        setRole(r);
      } catch (err) {
        console.error('Failed to fetch role:', err);
      }
    };
    fetchRole();
  }, []);

  // Fetch medical items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get('/Mapi/medical-items');
        setItems(response.data);
      } catch (err) {
        setError('Failed to load medical items');
        console.error(err.response || err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'currentStock' || name === 'minimumStockLevel'
          ? parseInt(value) || 0
          : value,
    }));
  };

  // Pick image
  const handleFileChange = async () => {
    try {
      const options = { mediaType: 'photo' };
      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.assets && result.assets.length > 0) {
        setImageFile(result.assets[0]); // immediately show preview
        console.log('Selected Image:', result.assets[0]);
      }
    } catch (err) {
      setError('Failed to pick image');
      console.error(err);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('currentStock', formData.currentStock);
      formDataToSend.append('minimumStockLevel', formData.minimumStockLevel);
      if (imageFile) {
        formDataToSend.append('imageFile', {
          uri: imageFile.uri,
          type: imageFile.type || 'image/jpeg',
          name: imageFile.fileName || 'image.jpg',
        });
      }

      // POST and get created item back
      const response = await api.post('/Mapi/medical-items', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newItem = response.data; // backend must return created item with imagePath
      setItems(prevItems => [newItem, ...prevItems]); // show immediately

      // Reset form
      setFormData({
        name: '',
        description: '',
        currentStock: 0,
        minimumStockLevel: 5,
      });
      setImageFile(null);
      setShowForm(false);
    } catch (err) {
      setError('Failed to add medical item');
      console.error(err.response || err);
    }
  };

  // Delete item
  const handleDelete = async id => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/Mapi/medical-items/${id}`);
              setItems(items.filter(item => item.id !== id));
            } catch (err) {
              setError('Failed to delete medical item');
              console.error(err.response || err);
            }
          },
        },
      ],
    );
  };

  // Build image URL
  const getImageUrl = imagePath =>
    imagePath
      ? `http://10.0.2.2:8082/api/images/${imagePath}`
      : 'https://via.placeholder.com/50';

  // Render FlatList row
  const renderItem = ({ item }) => {
    const imageUrl = getImageUrl(item.imagePath);
    return (
      <View
        style={[
          styles.row,
          item.currentStock < item.minimumStockLevel && styles.lowStock,
        ]}
      >
        {imageLoading[item.id] ? (
          <ActivityIndicator
            size="small"
            color="#007bff"
            style={styles.itemImage}
          />
        ) : imageErrors[item.id] ? (
          <View style={styles.imageErrorContainer}>
            <Text style={styles.imageErrorText}>Image Failed</Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl.uri }}
            style={styles.itemImage}
            onLoadStart={() =>
              setImageLoading(prev => ({ ...prev, [item.id]: true }))
            }
            onLoadEnd={() =>
              setImageLoading(prev => ({ ...prev, [item.id]: false }))
            }
            onError={e => {
              setImageLoading(prev => ({ ...prev, [item.id]: false }));
              setImageErrors(prev => ({ ...prev, [item.id]: true }));
            }}
            resizeMode="cover"
          />
        )}
        <Text style={styles.cell}>{item.name}</Text>
        <Text style={styles.cell}>{item.description}</Text>
        <Text style={styles.cell}>{item.currentStock}</Text>
        <Text style={styles.cell}>{item.minimumStockLevel}</Text>
        {role === 'SUPER_ADMIN' && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <Text style={styles.header}>Medical Inventory</Text>

      {role === 'SUPER_ADMIN' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.buttonText}>
            {showForm ? 'Cancel' : 'Add New Medical Item'}
          </Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={text => handleChange('name', text)}
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={formData.description}
            onChangeText={text => handleChange('description', text)}
            multiline
          />
          <Text style={styles.label}>Image</Text>
          <TouchableOpacity
            style={styles.fileButton}
            onPress={handleFileChange}
          >
            <Text style={styles.buttonText}>
              {imageFile
                ? imageFile.fileName || 'Image Selected'
                : 'Pick Image'}
            </Text>
          </TouchableOpacity>
          {imageFile && (
            <Image
              source={{ uri: imageFile.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.label}>Current Stock</Text>
          <TextInput
            style={styles.input}
            value={formData.currentStock.toString()}
            onChangeText={text => handleChange('currentStock', text)}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Minimum Stock Level</Text>
          <TextInput
            style={styles.input}
            value={formData.minimumStockLevel.toString()}
            onChangeText={text => handleChange('minimumStockLevel', text)}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        scrollEnabled={false}
        ListHeaderComponent={() => (
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 0.5 }]}>Image</Text>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Description</Text>
            <Text style={styles.headerCell}>Stock</Text>
            <Text style={styles.headerCell}>Min Stock</Text>
            {role === 'SUPER_ADMIN' && (
              <Text style={styles.headerCell}>Actions</Text>
            )}
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    padding: 16,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  form: {
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
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  fileButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'center',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButton: { backgroundColor: '#dc3545', padding: 8, borderRadius: 5 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  cell: { flex: 1, textAlign: 'center', fontSize: 14 },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
    flex: 0.5,
  },
  imageErrorContainer: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
  },
  imageErrorText: { color: 'red', fontSize: 10, textAlign: 'center' },
  lowStock: { backgroundColor: '#fff3cd' },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default MedicalInventory;
