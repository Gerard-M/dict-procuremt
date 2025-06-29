import type { Procurement } from './types';
import { getNewProcurementPhases } from './constants';

const mockProcurements: Procurement[] = [
  {
    id: '1',
    title: 'Supply and Delivery of IT Equipment for ILCDB',
    amount: 1500000,
    prNumber: '2023-01-01',
    projectType: 'ILCDB-DWIA',
    status: 'active',
    phases: (() => {
      const phases = getNewProcurementPhases();
      phases[0].isCompleted = true;
      phases[0].checklist.forEach(c => c.checked = true);
      phases[1].isCompleted = true;
      phases[1].checklist.forEach(c => c.checked = true);
      phases[2].checklist[0].checked = true;
      phases[2].checklist[1].checked = true;
      return phases;
    })(),
    createdAt: new Date('2023-01-15T09:00:00'),
    updatedAt: new Date('2023-03-20T14:30:00'),
  },
  {
    id: '2',
    title: 'Procurement of Laptops for SPARK Project',
    amount: 750000,
    prNumber: '2023-01-02',
    projectType: 'SPARK',
    status: 'active',
    phases: (() => {
      const phases = getNewProcurementPhases();
      phases[0].isCompleted = true;
      phases[0].checklist.forEach(c => c.checked = true);
      return phases;
    })(),
    createdAt: new Date('2023-01-20T11:00:00'),
    updatedAt: new Date('2023-02-10T16:00:00'),
  },
  {
    id: '3',
    title: 'TECH4ED Center Internet Subscription Renewal',
    amount: 120000,
    prNumber: '2022-12-15',
    projectType: 'TECH4ED-DTC',
    status: 'archived',
    phases: getNewProcurementPhases().map(p => ({ ...p, isCompleted: true, checklist: p.checklist.map(c => ({...c, checked: true})) })),
    createdAt: new Date('2022-12-01T10:00:00'),
    updatedAt: new Date('2023-01-25T11:45:00'),
  },
    {
    id: '4',
    title: 'Development of Project CLICK Learning Modules',
    amount: 450000,
    prNumber: '2023-02-10',
    projectType: 'PROJECT CLICK',
    status: 'active',
    phases: getNewProcurementPhases(),
    createdAt: new Date('2023-02-10T14:00:00'),
    updatedAt: new Date('2023-02-11T09:00:00'),
  },
];

// Simulate a database
let db: Procurement[] = [...mockProcurements];

export const getProcurements = async (): Promise<Procurement[]> => {
  return Promise.resolve(db);
};

export const getProcurementById = async (id: string): Promise<Procurement | undefined> => {
  return Promise.resolve(db.find(p => p.id === id));
};

export const addProcurement = async (procurement: Omit<Procurement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Procurement> => {
  const newProcurement: Procurement = {
    ...procurement,
    id: (db.length + 1).toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.push(newProcurement);
  return Promise.resolve(newProcurement);
};

export const updateProcurement = async (id: string, updates: Partial<Procurement>): Promise<Procurement | undefined> => {
    const index = db.findIndex(p => p.id === id);
    if (index !== -1) {
        db[index] = { ...db[index], ...updates, updatedAt: new Date() };
        return Promise.resolve(db[index]);
    }
    return Promise.resolve(undefined);
};

export const getExistingPrNumbers = async (): Promise<string[]> => {
    return Promise.resolve(db.map(p => p.prNumber));
}
