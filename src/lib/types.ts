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
  status: 'active' | 'archived';
  phases: ProcurementPhase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Honoraria {
  id: string;
  speakerName: string;
  activityTitle: string;
  amount: number;
  status: 'active' | 'archived';
  phase: ProcurementPhase;
  createdAt: Date;
  updatedAt: Date;
}
