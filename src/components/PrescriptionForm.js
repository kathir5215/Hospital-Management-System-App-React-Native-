import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import {
  listDoctors,
  listPatients,
  listMedicalItems,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
  listPrescriptions,
  listPrescriptionItems,
  createPrescriptionItem,
  updatePrescriptionItem,
  deletePrescriptionItem,
} from './CommonUrl';
import { getCurrentRole } from './Auth';

const PrescriptionForm = () => {
  const route = useRoute();
  const { id } = route.params || {};
  const navigation = useNavigation();
  const isEditMode = Boolean(id);
  const [viewMode, setViewMode] = useState(!id);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    notes: '',
    items: [],
  });
  const [role, setRole] = useState(false);
  useEffect(() => {
    const fetchRole = async () => {
      const role = await getCurrentRole();
      setRole(role);
    };

    fetchRole();
  }, []);

  const [newItem, setNewItem] = useState({
    medicalItemId: '',
    quantity: 1,
    dosage: '1 tablet',
    frequency: 'morning',
    timing: 'after meal',
    duration: '7 days',
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicalItems, setMedicalItems] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [medicalItemsRes, doctorsRes, patientsRes] = await Promise.all([
          listMedicalItems(),
          listDoctors(),
          listPatients(),
        ]);
        setMedicalItems(medicalItemsRes.data);
        setDoctors(doctorsRes.data);
        setPatients(patientsRes.data);

        if (viewMode) {
          const prescriptionsRes = await listPrescriptions();
          const enhancedPrescriptions = prescriptionsRes.data.map(
            prescription => {
              const doctorId = prescription.doctorId || prescription.doctor?.id;
              const patientId =
                prescription.patientId || prescription.patient?.id;
              const doctor = doctorsRes.data.find(d => d.id === doctorId);
              const patient = patientsRes.data.find(p => p.id === patientId);
              return {
                ...prescription,
                doctorId,
                patientId,
                doctor: doctor || { name: 'N/A' },
                patient: patient || { firstName: 'N/A', lastName: '' },
              };
            },
          );
          setPrescriptions(enhancedPrescriptions);
        }

        if (isEditMode) {
          const [prescriptionRes, itemsRes] = await Promise.all([
            getPrescription(id),
            listPrescriptionItems(id),
          ]);
          setFormData({
            ...prescriptionRes.data,
            items: itemsRes.data.map(item => ({
              ...item,
              medicalItemName:
                medicalItemsRes.data.find(m => m.id === item.medicalItemId)
                  ?.name || 'Unknown',
              medicalItem: medicalItemsRes.data.find(
                m => m.id === item.medicalItemId,
              ),
            })),
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode, viewMode]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (name, value) => {
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async () => {
    setError('');
    if (!newItem.medicalItemId) {
      setError('Please select a medication');
      return;
    }
    const selectedItem = medicalItems.find(
      item => item.id == newItem.medicalItemId,
    );
    if (!selectedItem) {
      setError('Selected medication not found');
      return;
    }
    const existingQuantity = formData.items
      .filter(item => item.medicalItemId == newItem.medicalItemId)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (selectedItem.currentStock < existingQuantity + newItem.quantity) {
      setError(
        `Insufficient stock. Only ${selectedItem.currentStock} available`,
      );
      return;
    }
    try {
      if (isEditMode && formData.id) {
        const itemDto = {
          medicalItemId: newItem.medicalItemId,
          quantity: newItem.quantity,
          dosage: newItem.dosage,
          frequency: newItem.frequency,
          timing: newItem.timing,
          duration: newItem.duration,
          prescriptionId: formData.id,
        };
        const response = await createPrescriptionItem(itemDto);
        setFormData(prev => ({
          ...prev,
          items: [
            ...prev.items,
            {
              ...response.data,
              medicalItemName: selectedItem.name,
            },
          ],
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          items: [
            ...prev.items,
            {
              medicalItemId: parseInt(newItem.medicalItemId),
              quantity: parseInt(newItem.quantity),
              dosage: newItem.dosage,
              frequency: newItem.frequency,
              timing: newItem.timing,
              duration: newItem.duration,
              medicalItemName: selectedItem.name,
            },
          ],
        }));
      }
      setNewItem({
        medicalItemId: '',
        quantity: 1,
        dosage: '1 tablet',
        frequency: 'morning',
        timing: 'after meal',
        duration: '7 days',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add medication');
    }
  };

  const handleRemoveItem = async (index, itemId) => {
    if (isEditMode && itemId) {
      try {
        await deletePrescriptionItem(itemId);
        setFormData(prev => ({
          ...prev,
          items: prev.items.filter((_, i) => i !== index),
        }));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to remove item');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleDeletePrescription = async prescriptionId => {
    try {
      setIsLoading(true);
      await deletePrescription(prescriptionId);
      setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
      setSuccess('Prescription deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (formData.items.length === 0) {
      setError('At least one medication is required');
      return;
    }
    try {
      setIsLoading(true);
      const cleanedFormData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        notes: formData.notes || '', // Ensure notes is not null
        items: formData.items.map(item => ({
          medicalItemId: parseInt(item.medicalItemId),
          quantity: parseInt(item.quantity),
          dosage: item.dosage || '1 tablet',
          frequency: item.frequency || 'morning',
          timing: item.timing || 'after meal',
          duration: item.duration || '7 days',
        })),
      };
      if (isEditMode) {
        await updatePrescription(formData.id, cleanedFormData);
      } else {
        await createPrescription(cleanedFormData);
      }
      setSuccess(
        isEditMode
          ? 'Prescription updated successfully'
          : 'Prescription created successfully',
      );
      setTimeout(() => setSuccess(''), 3000);
      navigation.navigate('Prescriptions');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPrescription = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>
        {item.patient.firstName} {item.patient.lastName}
      </Text>
      <Text style={styles.cell}>{item.doctor.name}</Text>
      <Text style={styles.cell}>{item.notes}</Text>
      <View style={styles.cell}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              setFormData({
                ...item,
                items: item.items || [],
              });
              setViewMode(false);
              setShowDetails(true);
            }}
          >
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
          {role === 'DOCTOR' && (
            <>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  navigation.navigate('Prescriptions', { id: item.id });
                  setFormData({
                    ...item,
                    items: item.items || [],
                  });
                  setViewMode(false);
                  setShowDetails(false);
                }}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePrescription(item.id)}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.medicalItemName}</Text>
      <Text style={styles.cell}>{item.quantity}</Text>
      <Text style={styles.cell}>{item.dosage}</Text>
      <Text style={styles.cell}>{item.frequency}</Text>
      <Text style={styles.cell}>{item.duration}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(index, item.id)}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Prescription Form</Text>
      {error && (
        <View style={styles.alertError}>
          <Text style={styles.alertText}>{error}</Text>
          <TouchableOpacity onPress={() => setError('')}>
            <Text style={styles.closeButton}>X</Text>
          </TouchableOpacity>
        </View>
      )}
      {success && (
        <View style={styles.alertSuccess}>
          <Text style={styles.alertText}>{success}</Text>
          <TouchableOpacity onPress={() => setSuccess('')}>
            <Text style={styles.closeButton}>X</Text>
          </TouchableOpacity>
        </View>
      )}
      {viewMode ? (
        <View>
          <Text style={styles.subHeader}>Prescriptions</Text>
          {role === 'DOCTOR' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setFormData({
                  patientId: '',
                  doctorId: '',
                  notes: '',
                  items: [],
                });
                setViewMode(false);
              }}
            >
              <Text style={styles.buttonText}>Create New Prescription</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={prescriptions}
            renderItem={renderPrescription}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            ListHeaderComponent={() => (
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>ID</Text>
                <Text style={styles.headerCell}>Patient</Text>
                <Text style={styles.headerCell}>Doctor</Text>
                <Text style={styles.headerCell}>Notes</Text>
                <Text style={styles.headerCell}>Actions</Text>
              </View>
            )}
          />
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Patient</Text>
          <Picker
            selectedValue={formData.patientId}
            onValueChange={value => handleChange('patientId', value)}
            style={styles.picker}
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
          <Text style={styles.label}>Doctor</Text>
          <Picker
            selectedValue={formData.doctorId}
            onValueChange={value => handleChange('doctorId', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Doctor" value="" />
            {doctors.map(doc => (
              <Picker.Item key={doc.id} label={doc.name} value={doc.id} />
            ))}
          </Picker>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.input}
            value={formData.notes}
            onChangeText={text => handleChange('notes', text)}
            multiline
          />
          <Text style={styles.subHeader}>Medications</Text>
          <View style={styles.itemForm}>
            <Picker
              selectedValue={newItem.medicalItemId}
              onValueChange={value => handleItemChange('medicalItemId', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Medication" value="" />
              {medicalItems.map(item => (
                <Picker.Item key={item.id} label={item.name} value={item.id} />
              ))}
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              value={newItem.quantity.toString()}
              onChangeText={text =>
                handleItemChange('quantity', parseInt(text) || 0)
              }
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Dosage"
              value={newItem.dosage}
              onChangeText={text => handleItemChange('dosage', text)}
            />
            <Picker
              selectedValue={newItem.frequency}
              onValueChange={value => handleItemChange('frequency', value)}
              style={styles.picker}
            >
              <Picker.Item label="Morning" value="morning" />
              <Picker.Item label="Evening" value="evening" />
              <Picker.Item label="Both" value="both" />
            </Picker>
            <Picker
              selectedValue={newItem.duration}
              onValueChange={value => handleItemChange('duration', value)}
              style={styles.picker}
            >
              <Picker.Item label="1 day" value="1 day" />
              <Picker.Item label="3 days" value="3 days" />
              <Picker.Item label="5 days" value="5 days" />
              <Picker.Item label="7 days" value="7 days" />
              <Picker.Item label="10 days" value="10 days" />
              <Picker.Item label="14 days" value="14 days" />
              <Picker.Item label="21 days" value="21 days" />
              <Picker.Item label="28 days" value="28 days" />
              <Picker.Item label="30 days" value="30 days" />
              <Picker.Item label="As needed" value="As needed" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
            {role === 'DOCTOR' && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddItem}
                disabled={isLoading || !newItem.medicalItemId}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          {formData.items.length > 0 && (
            <FlatList
              data={formData.items}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              ListHeaderComponent={() => (
                <View style={styles.tableHeader}>
                  <Text style={styles.headerCell}>Medication</Text>
                  <Text style={styles.headerCell}>Qty</Text>
                  <Text style={styles.headerCell}>Dosage</Text>
                  <Text style={styles.headerCell}>Frequency</Text>
                  <Text style={styles.headerCell}>Duration</Text>
                  <Text style={styles.headerCell}>Action</Text>
                </View>
              )}
            />
          )}
          {role === 'DOCTOR' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setViewMode(true)}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading || formData.items.length === 0}
              >
                <Text style={styles.buttonText}>
                  {isEditMode ? 'Update' : 'Create'} Prescription
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  itemForm: {
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#17a2b8',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  editButton: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#343a40',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
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
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PrescriptionForm;
