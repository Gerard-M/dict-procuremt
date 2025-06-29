import { db } from './firebase';
import { ref, get, set, push, update, remove } from 'firebase/database';
import type { Procurement } from './types';

// Helper to convert date objects to ISO strings for Firebase
const serializeDates = (data: any): any => {
    if (data instanceof Date) {
        return data.toISOString();
    }
    if (Array.isArray(data)) {
        return data.map(serializeDates);
    }
    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).reduce((acc, key) => {
            acc[key] = serializeDates(data[key]);
            return acc;
        }, {} as any);
    }
    return data;
};

// Helper to convert ISO strings back to Date objects from Firebase
const deserializeDates = (data: any): any => {
    // Regex to match ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(data)) {
        const d = new Date(data);
        if (!isNaN(d.getTime())) {
            return d;
        }
    }
    if (Array.isArray(data)) {
        return data.map(deserializeDates);
    }
    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).reduce((acc, key) => {
            acc[key] = deserializeDates(data[key]);
            return acc;
        }, {} as any);
    }
    return data;
}

export const getProcurements = async (): Promise<Procurement[]> => {
  const dbRef = ref(db, 'procurements');
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    const procurementsArray = Object.keys(data).map(key => ({
      id: key,
      ...data[key],
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return deserializeDates(procurementsArray);
  }
  return [];
};

export const getProcurementById = async (id: string): Promise<Procurement | undefined> => {
  const dbRef = ref(db, `procurements/${id}`);
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    return deserializeDates({ id, ...data });
  }
  return undefined;
};

export const addProcurement = async (procurement: Omit<Procurement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Procurement> => {
  const dbRef = ref(db, 'procurements');
  const newProcurementRef = push(dbRef);
  
  const newProcurement: Omit<Procurement, 'id'> = {
    ...procurement,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await set(newProcurementRef, serializeDates(newProcurement));
  
  const result = {
      id: newProcurementRef.key!,
      ...newProcurement
  };
  return deserializeDates(result);
};

export const updateProcurement = async (id: string, updates: Partial<Omit<Procurement, 'id' | 'createdAt'>>): Promise<Procurement | undefined> => {
    const dataToUpdate = { ...updates, updatedAt: new Date() };
    await update(ref(db, `procurements/${id}`), serializeDates(dataToUpdate));
    return getProcurementById(id);
};

export const deleteProcurement = async (id: string): Promise<void> => {
    await remove(ref(db, `procurements/${id}`));
};

export const getExistingPrNumbers = async (): Promise<string[]> => {
    const procurements = await getProcurements();
    return procurements.map(p => p.prNumber);
}
