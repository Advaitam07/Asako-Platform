import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, Users, Briefcase, FileText, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Key } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'users' | 'audit'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [mRes, vRes, uRes, lRes] = await Promise.all([
        api.admin.getOverview(),
        api.admin.getVerifications(),
        api.admin.getUsers(),
        api.admin.getAuditLogs(),
      ]);

      setMetrics(mRes.metrics);
      setVerifications(vRes.verifications || []);
      setUsers(uRes.users || []);
      setAuditLogs(lRes.logs || []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Administration data could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcessVerification = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.admin.processVerification(id, status, `Reviewed and ${status} via Admin Dashboard`);
      setActionMessage(`Verification request ${status.toUpperCase()} recorded.`);
      setTimeout(() => setActionMessage(null), 4000);
      loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Verification could not be processed.');
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to mark ${user.email} as ${nextStatus.toUpperCase()}?`)) return;

    try {
      await api.admin.updateUserStatus(user.id, nextStatus, 'Admin account audit action');
      setActionMessage(`User ${user.email} status transitioned to ${nextStatus}.`);
      setTimeout(() => setActionMessage(null), 4000);
      loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'User status could not be updated.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12 font-body">
      {/* Header */}
      <div className="bg-[#0F2342] text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-[#173B70] border border-[#C9A34E] text-[#C9A34E] flex items-center justify-center font-heading font-bold text-2xl shrink-0">
            <Key className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] px-2 py-0.5 bg-[rgba(201,163,78,0.2)] border border-[#C9A34E] text-[#C9A34E]">
                SYSTEM AUTHORITY & AUDIT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading">
              ASAKO Governance & Administration
            </h1>
            <div className="text-xs text-white/70 flex flex-wrap items-center gap-2 pt-0.5">
              <span>Security Clearance: Root Admin</span>
              <span>·</span>
              <span>Server Protocol: REST / JSON Database Engine</span>
              <span>·</span>
              <span>Real-Time Audit Active</span>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="btn-asako-gold text-xs uppercase tracking-[0.12em] py-2.5 px-5 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-[rgba(201,163,78,0.12)] border border-[#C9A34E] text-xs font-semibold text-[#0F2342] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C9A34E]" />
          <span>{actionMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#E2E8F0] flex items-center gap-8 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'verifications'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          <span>Accreditation Requests</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-[#C9A34E] text-[#0F2342] font-mono font-bold">
            {verifications.filter((v) => v.status === 'pending').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          User Accounts & Access ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          Security Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Overview & Metrics */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-6 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-[#75777F]">
                TOTAL REGISTERED USERS
              </div>
              <div className="text-3xl font-bold text-[#0F2342] font-heading">
                {metrics?.totalUsers ?? '...'}
              </div>
              <div className="text-xs text-[#475569]">
                {metrics?.students} Students · {metrics?.companies} Companies
              </div>
            </div>

            <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-6 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-[#75777F]">
                ACTIVE OPPORTUNITIES
              </div>
              <div className="text-3xl font-bold text-[#173B70] font-heading">
                {metrics?.activeOpportunities ?? '...'}
              </div>
              <div className="text-xs text-[#475569]">
                Across engineering & architecture
              </div>
            </div>

            <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-6 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-[#75777F]">
                APPLICATION PIPELINE
              </div>
              <div className="text-3xl font-bold text-[#0F2342] font-heading">
                {metrics?.totalApplications ?? '...'}
              </div>
              <div className="text-xs text-[#475569]">
                Real-time review by hiring leads
              </div>
            </div>

            <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-6 space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-[#C9A34E]">
                PENDING VERIFICATIONS
              </div>
              <div className="text-3xl font-bold text-[#C9A34E] font-heading">
                {metrics?.pendingVerifications ?? '...'}
              </div>
              <div className="text-xs text-[#475569]">
                Institutions & providers awaiting review
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Accreditation Requests */}
      {activeTab === 'verifications' && (
        <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white">
          {verifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#475569]">No verification requests logged.</div>
          ) : (
            verifications.map((v) => (
              <div key={v.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#173B70] uppercase tracking-wider">
                      {v.role.toUpperCase()} ACCREDITATION
                    </span>
                    <span>·</span>
                    <span className="text-xs text-[#75777F]">ID: {v.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0F2342] font-heading">
                    {v.entity_name}
                  </h3>
                  <div className="text-xs text-[#475569]">
                    Submitted documents: {v.documents_info?.join(', ') || 'Standard documents'}
                  </div>
                  {v.review_notes && (
                    <div className="text-xs text-[#75777F] italic">Notes: {v.review_notes}</div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {v.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleProcessVerification(v.id, 'approved')}
                        className="px-3 py-1.5 bg-[#173B70] text-white text-xs font-semibold hover:bg-[#0F2342] flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A34E]" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleProcessVerification(v.id, 'rejected')}
                        className="px-3 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-[#0F2342] text-xs font-semibold hover:bg-red-50 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        v.status === 'approved'
                          ? 'bg-[rgba(201,163,78,0.1)] border border-[#C9A34E] text-[#0F2342]'
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}
                    >
                      {v.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white">
          {users.map((u) => (
            <div key={u.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#F5F7FA] border border-[#E2E8F0] text-[#0F2342] font-bold">
                    {u.role}
                  </span>
                  <span>·</span>
                  <span className="text-xs text-[#75777F]">{u.id}</span>
                </div>
                <div className="text-base font-bold text-[#0F2342]">{u.email}</div>
                <div className="text-xs text-[#475569]">
                  Created: {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                    u.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {u.status}
                </span>

                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleToggleUserStatus(u)}
                    className="px-3 py-1 text-xs border border-[#E2E8F0] text-[#0F2342] hover:bg-[#F5F7FA] cursor-pointer"
                  >
                    {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#475569]">No audit events logged yet.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#173B70]">{log.action}</span>
                    <span>·</span>
                    <span className="text-[#475569]">{log.admin_email}</span>
                  </div>
                  <span className="text-[10px] text-[#75777F] font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-[#475569] font-mono text-[11px]">
                  Target: {log.target_type} ({log.target_id})
                </div>
                {log.details && (
                  <div className="bg-[#F5F7FA] p-2 font-mono text-[11px] text-[#0F2342] overflow-x-auto">
                    {JSON.stringify(log.details)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
