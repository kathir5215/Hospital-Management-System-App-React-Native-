import api from '../api/api';

export const listPatients = async () => await api.get('/Papi/patient');
export const createPatients = async patient =>
  await api.post('/Papi/patient', patient);
export const deletePatient = async id => await api.delete(`/Papi/${id}`);

export const listDoctors = async () => await api.get('/Dapi/doctor');
export const createDoctors = async doctor =>
  await api.post('/Dapi/doctor', doctor);
export const deleteDoctor = async id => await api.delete(`/Dapi/${id}`);

export const listappointments = async () => await api.get('/Aapi/appointments');
export const createAppointments = async appointment =>
  await api.post('/Aapi/appointments', appointment);
export const deleteAppointment = async id => await api.delete(`/Aapi/${id}`);

export const listMedicalItems = async () =>
  await api.get('/Mapi/medical-items');
export const listPrescriptions = async () =>
  await api.get('/api/prescriptions');
export const getPrescription = async id =>
  await api.get(`/api/prescriptions/${id}`);
export const createPrescription = async prescription =>
  await api.post('/api/prescriptions', prescription);
export const updatePrescription = async (id, prescription) =>
  await api.put(`/api/prescriptions/${id}`, prescription);
export const deletePrescription = async id =>
  await api.delete(`/api/prescriptions/${id}`);

export const listPrescriptionItems = async prescriptionId =>
  await api.get(`/api/prescription-items/prescription/${prescriptionId}`);

export const getPrescriptionItem = async id =>
  await api.get(`/api/prescription-items/${id}`);

export const createPrescriptionItem = async data =>
  await api.post('/api/prescription-items', data);

export const updatePrescriptionItem = async (id, data) =>
  await api.put(`/api/prescription-items/${id}`, data);

export const deletePrescriptionItem = async id =>
  await api.delete(`/api/prescription-items/${id}`);
