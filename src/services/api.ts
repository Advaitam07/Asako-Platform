
import {
  Opportunity,
  Workshop,
  MarketplaceItem,
  StudentApplication,
  InstitutePartnership,
  UserRole,
} from '../types/asako';

const TOKEN_KEY = 'asako_jwt_token';

// Backend URL will be configured in Vercel Environment Variables.
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '');

export interface ApiUser {
  id: string;
  email: string;
  role: UserRole | 'admin';
  status: string;
  name: string;
  organization?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
  }

  public setToken(token: string | null) {
    this.token = token;

    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }

    return this.token;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage =
        typeof data.error === 'string'
          ? data.error
          : typeof data.message === 'string'
            ? data.message
            : `HTTP error ${res.status}`;

      throw new Error(errorMessage);
    }

    return data as T;
  }

  // --- AUTH ---
  public auth = {
    register: async (payload: {
      email: string;
      password: string;
      role: UserRole;
      fullName?: string;
      organizationName?: string;
    }) => {
      const res = await this.request<{
        message: string;
        token: string;
        user: ApiUser;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      this.setToken(res.token);
      return res;
    },

    login: async (email: string, password: string) => {
      const res = await this.request<{
        message: string;
        token: string;
        user: ApiUser;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      this.setToken(res.token);
      return res;
    },

    logout: async () => {
      try {
        await this.request('/api/auth/logout', {
          method: 'POST',
        });
      } finally {
        this.setToken(null);
      }
    },

    getMe: async () => {
      return this.request<{
        user: ApiUser;
        profile: any;
      }>('/api/auth/me');
    },

    updatePassword: async (
      currentPassword: string,
      newPassword: string
    ) => {
      return this.request<{ message: string }>(
        '/api/auth/update-password',
        {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );
    },
  };

  // --- OPPORTUNITIES ---
  public opportunities = {
    list: async (params?: {
      search?: string;
      category?: string;
      type?: string;
      isRemote?: boolean;
    }) => {
      const q = new URLSearchParams();

      if (params?.search) q.set('search', params.search);
      if (params?.category) q.set('category', params.category);
      if (params?.type) q.set('type', params.type);

      if (params?.isRemote !== undefined) {
        q.set('isRemote', String(params.isRemote));
      }

      return this.request<{
        opportunities: Opportunity[];
        total: number;
      }>(
        `/api/opportunities${q.toString() ? `?${q.toString()}` : ''}`
      );
    },

    getById: async (id: string) => {
      return this.request<{ opportunity: Opportunity }>(
        `/api/opportunities/${id}`
      );
    },

    apply: async (
      id: string,
      payload: {
        candidateName?: string;
        coverNote?: string;
        portfolioLinks?: string[];
        resumeUrl?: string;
      }
    ) => {
      return this.request<{
        message: string;
        application: any;
      }>(`/api/opportunities/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };

  // --- WORKSHOPS ---
  public workshops = {
    list: async (params?: {
      search?: string;
      category?: string;
      level?: string;
      format?: string;
    }) => {
      const q = new URLSearchParams();

      if (params?.search) q.set('search', params.search);
      if (params?.category) q.set('category', params.category);
      if (params?.level) q.set('level', params.level);
      if (params?.format) q.set('format', params.format);

      return this.request<{
        workshops: Workshop[];
        total: number;
      }>(
        `/api/workshops${q.toString() ? `?${q.toString()}` : ''}`
      );
    },

    getById: async (id: string) => {
      return this.request<{ workshop: Workshop }>(
        `/api/workshops/${id}`
      );
    },

    register: async (
      id: string,
      participantName?: string
    ) => {
      return this.request<{
        message: string;
        registration: any;
      }>(`/api/workshops/${id}/register`, {
        method: 'POST',
        body: JSON.stringify({ participantName }),
      });
    },

    cancel: async (id: string) => {
      return this.request<{ message: string }>(
        `/api/workshops/${id}/cancel`,
        {
          method: 'POST',
        }
      );
    },
  };

  // --- MARKETPLACE ---
  public marketplace = {
    list: async (params?: {
      search?: string;
      category?: string;
    }) => {
      const q = new URLSearchParams();

      if (params?.search) q.set('search', params.search);
      if (params?.category) q.set('category', params.category);

      return this.request<{
        listings: MarketplaceItem[];
        total: number;
      }>(
        `/api/marketplace${q.toString() ? `?${q.toString()}` : ''}`
      );
    },

    getById: async (id: string) => {
      return this.request<{ listing: MarketplaceItem }>(
        `/api/marketplace/${id}`
      );
    },

    enquire: async (
      id: string,
      payload: {
        message: string;
        contactNumber?: string;
        senderName?: string;
      }
    ) => {
      return this.request<{
        message: string;
        enquiry: any;
      }>(`/api/marketplace/${id}/enquire`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };

  // --- STUDENTS ---
  public students = {
    getProfile: async () => {
      return this.request<{ profile: any }>(
        '/api/students/profile'
      );
    },

    updateProfile: async (updates: any) => {
      return this.request<{
        message: string;
        profile: any;
      }>('/api/students/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    getApplications: async () => {
      return this.request<{
        applications: StudentApplication[];
      }>('/api/students/applications');
    },

    getSavedOpportunities: async () => {
      return this.request<{
        savedOpportunities: Opportunity[];
      }>('/api/students/saved-opportunities');
    },

    saveOpportunity: async (opportunityId: string) => {
      return this.request<{
        message: string;
        saved: any;
      }>('/api/students/saved-opportunities', {
        method: 'POST',
        body: JSON.stringify({ opportunityId }),
      });
    },

    removeSavedOpportunity: async (opportunityId: string) => {
      return this.request<{ message: string }>(
        `/api/students/saved-opportunities/${opportunityId}`,
        {
          method: 'DELETE',
        }
      );
    },

    getWorkshops: async () => {
      return this.request<{ workshops: Workshop[] }>(
        '/api/students/workshops'
      );
    },
  };

  // --- COMPANIES ---
  public companies = {
    getProfile: async () => {
      return this.request<{ profile: any }>(
        '/api/companies/profile'
      );
    },

    updateProfile: async (updates: any) => {
      return this.request<{
        message: string;
        profile: any;
      }>('/api/companies/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    getOpportunities: async () => {
      return this.request<{ opportunities: Opportunity[] }>(
        '/api/companies/opportunities'
      );
    },

    createOpportunity: async (opp: Partial<Opportunity>) => {
      return this.request<{
        message: string;
        opportunity: Opportunity;
      }>('/api/companies/opportunities', {
        method: 'POST',
        body: JSON.stringify(opp),
      });
    },

    updateOpportunity: async (
      id: string,
      updates: Partial<Opportunity>
    ) => {
      return this.request<{
        message: string;
        opportunity: Opportunity;
      }>(`/api/companies/opportunities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    deleteOpportunity: async (id: string) => {
      return this.request<{ message: string }>(
        `/api/companies/opportunities/${id}`,
        {
          method: 'DELETE',
        }
      );
    },

    getApplications: async () => {
      return this.request<{ applications: any[] }>(
        '/api/companies/applications'
      );
    },

    updateApplicationStatus: async (
      appId: string,
      status: string,
      note?: string
    ) => {
      return this.request<{
        message: string;
        application: any;
      }>(`/api/companies/applications/${appId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note }),
      });
    },
  };

  // --- INSTITUTES ---
  public institutes = {
    getProfile: async () => {
      return this.request<{ profile: any }>(
        '/api/institutes/profile'
      );
    },

    updateProfile: async (updates: any) => {
      return this.request<{
        message: string;
        profile: any;
      }>('/api/institutes/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    getPartnerships: async () => {
      return this.request<{
        partnerships: InstitutePartnership[];
      }>('/api/institutes/partnerships');
    },

    createPartnership: async (data: {
      partnerCompany: string;
      initiative: string;
      studentsInvolved: number;
      term: string;
    }) => {
      return this.request<{
        message: string;
        partnership: InstitutePartnership;
      }>('/api/institutes/partnerships', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // --- PROVIDERS ---
  public providers = {
    getProfile: async () => {
      return this.request<{ profile: any }>(
        '/api/providers/profile'
      );
    },

    updateProfile: async (updates: any) => {
      return this.request<{
        message: string;
        profile: any;
      }>('/api/providers/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    getWorkshops: async () => {
      return this.request<{ workshops: Workshop[] }>(
        '/api/providers/workshops'
      );
    },

    createWorkshop: async (workshop: Partial<Workshop>) => {
      return this.request<{
        message: string;
        workshop: Workshop;
      }>('/api/providers/workshops', {
        method: 'POST',
        body: JSON.stringify(workshop),
      });
    },

    deleteWorkshop: async (id: string) => {
      return this.request<{ message: string }>(
        `/api/providers/workshops/${id}`,
        {
          method: 'DELETE',
        }
      );
    },

    getAttendees: async (workshopId: string) => {
      return this.request<{ attendees: any[] }>(
        `/api/providers/workshops/${workshopId}/attendees`
      );
    },
  };

  // --- CONSUMERS ---
  public consumers = {
    getProfile: async () => {
      return this.request<{ profile: any }>(
        '/api/consumers/profile'
      );
    },

    updateProfile: async (updates: any) => {
      return this.request<{
        message: string;
        profile: any;
      }>('/api/consumers/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    getOrders: async () => {
      return this.request<{ orders: any[] }>(
        '/api/consumers/orders'
      );
    },

    orderResource: async (listingId: string) => {
      return this.request<{
        message: string;
        order: any;
      }>('/api/consumers/orders', {
        method: 'POST',
        body: JSON.stringify({ listingId }),
      });
    },

    getEnquiries: async () => {
      return this.request<{ enquiries: any[] }>(
        '/api/consumers/enquiries'
      );
    },
  };

  // --- NOTIFICATIONS ---
  public notifications = {
    list: async () => {
      return this.request<{
        notifications: any[];
        unreadCount: number;
      }>('/api/notifications');
    },

    markRead: async (id: string) => {
      return this.request<{ notification: any }>(
        `/api/notifications/${id}/read`,
        {
          method: 'PUT',
        }
      );
    },

    markAllRead: async () => {
      return this.request<{ message: string }>(
        '/api/notifications/read-all',
        {
          method: 'PUT',
        }
      );
    },
  };

  // --- ADMIN ---
  public admin = {
    getOverview: async () => {
      return this.request<{ metrics: any }>(
        '/api/admin/overview'
      );
    },

    getUsers: async () => {
      return this.request<{ users: any[] }>(
        '/api/admin/users'
      );
    },

    updateUserStatus: async (
      userId: string,
      status: string,
      reason?: string
    ) => {
      return this.request<{
        message: string;
        user: any;
      }>(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      });
    },

    getVerifications: async () => {
      return this.request<{ verifications: any[] }>(
        '/api/admin/verifications'
      );
    },

    processVerification: async (
      verId: string,
      status: 'approved' | 'rejected',
      reviewNotes?: string
    ) => {
      return this.request<{ message: string }>(
        `/api/admin/verifications/${verId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ status, reviewNotes }),
        }
      );
    },

    getAuditLogs: async () => {
      return this.request<{ logs: any[] }>(
        '/api/admin/audit-logs'
      );
    },
  };

  // --- UPLOADS ---
  public uploads = {
    uploadResume: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);

      return this.request<{
        message: string;
        filename: string;
        url: string;
      }>('/api/uploads/resume', {
        method: 'POST',
        body: formData,
      });
    },
  };
}

export const api = new ApiService();
