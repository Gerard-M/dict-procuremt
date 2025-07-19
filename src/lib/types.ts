export interface Signature {
  name: string;
  date: Date | null;
  remarks: string;
  signatureDataUrl: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  isLocked?: boolean;
}

export interface ProcurementPhase {
  id: number;
  name: string;
  checklist: ChecklistItem[];
  submittedBy: Signature | null;
  receivedBy: Signature | null;
  isCompleted: boolean;
}

export type ProjectType = 'ILCDB-DWIA' | 'SPARK' | 'TECH4ED-DTC' | 'PROJECT CLICK' | 'OTHERS';

export interface Procurement {
  id: string;
  title: string;
  amount: number;
  prNumber: string;
  projectType: ProjectType;
  otherProjectType?: string;
  status: 'active' | 'completed' | 'paid' | 'cancelled';
  phases: ProcurementPhase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Honoraria {
  id: string;
  activityTitle: string;
  amount: number;
  projectType: ProjectType;
  otherProjectType?: string;
  status: 'active' | 'completed';
  phase: ProcurementPhase;
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelVoucher {
  id: string;
  activityTitle: string;
  amount: number;
  projectType: ProjectType;
  otherProjectType?: string;
  status: 'active' | 'completed';
  phase: ProcurementPhase;
  createdAt: Date;
  updatedAt: Date;
}
