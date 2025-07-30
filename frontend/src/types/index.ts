export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Domain {
  id: string;
  name: string;
  registrar: string | null;
  status: string;
  registeredAt: string | null;
  expiresAt: string | null;
  nameservers: string[];
  notes: string | null;
  renewalPrice?: number | null;
  createdAt: string;
  updatedAt: string;

  whoisData?: any;
  isMainDomain: boolean;
  domainHosting?: string | null;
  hosting?: Pick<Hosting, 'id' | 'name' | 'provider'> | null;
  vps?: Pick<VPS, 'id' | 'name' | 'provider'> | null;
  websites?: { id: string; name: string; url: string }[];
}

export interface Hosting {
  id: string;
  name: string;
  provider: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED' | 'EXPIRING_SOON';
  ipAddress?: string;
  username?: string;
  password?: string; // Will be masked in responses
  expiresAt?: string;
  renewalPrice?: number | null;

  notes?: string;
  createdAt: string;
  updatedAt: string;
  domains?: Pick<Domain, 'id' | 'name' | 'status' | 'isMainDomain'>[];
  domainIds?: string[];
  // New fields
  planName?: string;
  cpanelUrl?: string;
}

// For form handling with date inputs
export interface HostingFormData {
  id?: string;
  name?: string; // Make name optional since we'll derive it from provider
  provider: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED' | 'EXPIRING_SOON';
  ipAddress?: string;
  username?: string;
  password?: string;

  notes?: string;
  updatedAt?: string;
  domains?: Pick<Domain, 'id' | 'name' | 'status' | 'isMainDomain'>[];
  domainIds?: string[];
  planName?: string;
  cpanelUrl?: string;
  // Date handling fields
  createdAt?: string;
  expiresAt?: string;
  createdAtDate?: string;
  expiresAtDate?: string;
}

export interface VPS {
  id: string;
  name: string;
  provider: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'STOPPED' | 'EXPIRED' | 'CANCELLED';
  ipAddress?: string;
  sshPort?: number;
  sshKey?: string;
  username?: string;
  password?: string; // Will be masked in responses
  cpanelUrl?: string;
  expiresAt?: string;
  renewalPrice?: number | null;

  notes?: string;
  createdAt: string;
  updatedAt: string;
  domains?: Pick<Domain, 'id' | 'name' | 'status' | 'isMainDomain'>[];
  domainIds?: string[];
}

// For form handling with date inputs
export interface VPSFormData {
  id?: string;
  name: string;
  provider: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'STOPPED' | 'EXPIRED' | 'CANCELLED';
  ipAddress?: string;
  sshPort?: number;
  sshKey?: string;
  username?: string;
  password?: string;
  cpanelUrl?: string;
  notes?: string;

  // Date handling fields
  expiresAt?: string;
  expiresAtDate?: string;
}

export interface Website {
  id: string;
  name: string;
  url: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DEVELOPMENT';
  cms?: string;
  version?: string;
  sslStatus: 'VALID' | 'EXPIRED' | 'INVALID' | 'NONE';
  sslProvider?: string;
  sslExpiresAt?: string;
  backupEnabled: boolean;
  backupFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  lastBackup?: string;
  uptimeMonitoring: boolean;
  monitoringUrl?: string;
  notes?: string;
  username?: string; // Website access username
  password?: string; // Website access password (will be masked in responses)
  createdAt: string;
  updatedAt: string;
  domainId?: string;
  domain?: Pick<Domain, 'id' | 'name'>;
  hostingId?: string;
  hosting?: Pick<Hosting, 'id' | 'name' | 'provider'>;
  vpsId?: string;
  vps?: Pick<VPS, 'id' | 'name' | 'provider'>;
}

// For form handling with date inputs
export interface WebsiteFormData {
  id?: string;
  name: string;
  url: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DEVELOPMENT';
  cms?: string;
  version?: string;
  sslStatus: 'VALID' | 'EXPIRED' | 'INVALID' | 'NONE';
  sslProvider?: string;
  backupEnabled: boolean;
  backupFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  uptimeMonitoring: boolean;
  monitoringUrl?: string;
  notes?: string;
  username?: string; // Website access username
  password?: string; // Website access password
  domainId?: string;
  hostingId?: string;
  vpsId?: string;
  // Date handling fields
  sslExpiresAt?: string;
  sslExpiresAtDate?: string;
  lastBackup?: string;
  lastBackupDate?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
  error?: {
    code: string;
    message: string;
    issues?: any[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'FINANCE' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
} 