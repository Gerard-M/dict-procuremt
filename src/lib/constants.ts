import type { ProcurementPhase } from './types';

const createChecklist = (items: string[]) => items.map(item => ({ id: item.toLowerCase().replace(/[\s/()]/g, '-'), label: item, checked: false }));

const phase1Checklist = createChecklist(['APP/PPMP (Annual Procurement Plan / Project Procurement Management Plan)', 'SARO (Special Allotment Release Order)', 'Budget Breakdown', 'Distribution List (for items/goods)', 'POI/Activity Design (Program of Implementation)', 'Market Research', 'Purchase Request', 'Quotations']);
const phase2Checklist = createChecklist(['Purchase Order', 'Abstract / PhilGEPS Posting', 'Purchase Request', 'Quotations', 'APP/PPMP', 'SARO', 'Budget Breakdown', 'Distribution List', 'POI/Activity Design', 'Market Research']);
const phase3Checklist = createChecklist(['ORS (Obligation Request and Status)', 'Purchase Order', 'Abstract / PhilGEPS Posting', 'Purchase Request', 'Quotations', 'APP/PPMP', 'SARO', 'Budget Breakdown', 'Distribution List', 'POI/Activity Design', 'Market Research']);
const phase4Checklist = createChecklist(['Attendance (if applicable)', 'Certificate of Completion / Satisfaction (for Supplier)', 'Photos (documentation)', 'SOA / Billing Statement', 'Delivery Receipt', 'Distribution List (Receiving Copy)']);
const phase5Checklist = createChecklist(['ORS', 'Purchase Order', 'Abstract', 'PhilGEPS Posting', 'IAR (Inspection and Acceptance Report)', 'ICS / PAR (Inventory Custodian Slip / Property Acknowledgment Receipt)', 'Request for Inspection (COA)', 'Attendance', 'Certificate of Completion / Satisfaction (Supplier)', 'Photos', 'SOA / Billing Statement', 'Delivery Receipt', 'Distribution List (Receiving Copy)', 'Purchase Request', 'Quotations', 'APP/PPMP', 'SARO', 'Budget Breakdown', 'Distribution List', 'POI / Activity Design', 'Market Research']);
const phase6Checklist = createChecklist(['DV (Disbursement Voucher)', 'ORS', 'Purchase Order', 'Abstract', 'PhilGEPS Posting', 'IAR', 'ICS / PAR', 'Request for Inspection (COA)', 'Attendance', 'Certificate of Completion / Satisfaction (Supplier)', 'Photos', 'SOA / Billing Statement', 'Delivery Receipt', 'Distribution List (Receiving Copy)', 'Purchase Request', 'Quotations', 'APP/PPMP', 'SARO', 'Budget Breakdown', 'Distribution List', 'POI / Activity Design', 'Market Research']);


export const getNewProcurementPhases = (): ProcurementPhase[] => [
  { id: 1, name: 'Phase 1: Pre-Procurement', checklist: phase1Checklist, submittedBy: null, receivedBy: null, isCompleted: false },
  { id: 2, name: 'Phase 2: Pre-Procurement', checklist: phase2Checklist, submittedBy: null, receivedBy: null, isCompleted: false },
  { id: 3, name: 'Phase 3: Pre-Procurement', checklist: phase3Checklist, submittedBy: null, receivedBy: null, isCompleted: false },
  { id: 4, name: 'Phase 4: Post-Procurement', checklist: phase4Checklist, submittedBy: null, receivedBy: null, isCompleted: false },
  { id: 5, name: 'Phase 5: Post-Procurement', checklist: phase5Checklist, submittedBy: null, receivedBy: null, isCompleted: false },
  { id: 6, name: 'Phase 6: Post-Procurement', checklist: phase6Checklist, submittedBy: null, receivedBy: null, isCompleted: false },
];

const honorariaChecklist = createChecklist(['ORS', 'DV', 'Service Contract', 'Certificate of Honoraria Classification', 'Terminal Report', 'Attendance', 'Resume / CV', 'Government ID', 'Payslip / Certificate of Gross Income', 'TIN and Bank Account details', 'Certificate of Services Rendered']);

export const getNewHonorariaPhase = (): ProcurementPhase => ({
  id: 1,
  name: 'Honoraria Processing',
  checklist: honorariaChecklist,
  submittedBy: null,
  receivedBy: null,
  isCompleted: false,
});
