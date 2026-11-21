import { UserProfile } from '../types/index.ts';
import { TEST_VARS } from './testVariables.ts';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'admin-malcolm',
    uid: 'admin-malcolm',
    email: TEST_VARS.auth.adminEmail,
    displayName: 'Malcolm Director of Wellness',
    role: 'ADMIN',
    status: 'ACTIVE',
    wholesaleApprovalStatus: 'APPROVED',
    mfaEnabled: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'partner-equinox-owner',
    uid: 'partner-equinox-owner',
    email: 'julian@vancemedical.com',
    displayName: 'Dr. Julian Vance',
    businessName: 'Equinox Longevity Suite',
    role: 'PARTNER_OWNER',
    status: 'ACTIVE',
    partnerId: 'WH-P-000001',
    partnerSlug: 'equinox-longevity',
    wholesaleApprovalStatus: 'APPROVED',
    createdAt: '2026-01-05T00:00:00Z'
  },
  {
    id: 'partner-harbor-owner',
    uid: 'partner-harbor-owner',
    email: 'helena@harborsanctuary.com',
    displayName: 'Dr. Helena Vance',
    businessName: 'Harbor Sanctuary Beverly Hills',
    role: 'PARTNER_OWNER',
    status: 'ACTIVE',
    partnerId: 'WH-P-000002',
    partnerSlug: 'harbor-sanctuary',
    wholesaleApprovalStatus: 'APPROVED',
    createdAt: '2026-01-12T00:00:00Z'
  },
  {
    id: 'cust-elena-r',
    uid: 'cust-elena-r',
    email: 'elena.rostova@example.com',
    displayName: 'Elena Rostova',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    wholesaleApprovalStatus: 'NONE',
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'cust-marcus-c',
    uid: 'cust-marcus-c',
    email: 'marcus.chen@example.com',
    displayName: 'Marcus Chen',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    wholesaleApprovalStatus: 'NONE',
    createdAt: '2026-02-08T00:00:00Z'
  },
  {
    id: 'cust-sarah-m',
    uid: 'cust-sarah-m',
    email: 'sarah.miller@example.com',
    displayName: 'Sarah Miller',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    wholesaleApprovalStatus: 'NONE',
    createdAt: '2026-02-14T00:00:00Z'
  }
];
