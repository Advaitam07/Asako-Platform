import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface ConsumerDashboardProps {
  userName: string;
  onExploreMarketplace: () => void;
}

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({
  userName,
  onExploreMarketplace,
}) => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'consultations'>('purchases');

  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.consumers.getOrders();
        setMyOrders(res.orders);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Your requests could not be loaded.');
      }
    };
    fetchOrders();
  }, []);

  const consultations: Array<{
    id: string;
    advisor: string;
    role: string;
    topic: string;
    scheduledDate: string;
    status: string;
  }> = [];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12 font-body">
      {/* Profile Header */}
      <div className="bg-white border border-[#173B70] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-[#173B70] text-white flex items-center justify-center font-heading font-bold text-2xl shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] px-2 py-0.5 bg-[rgba(201,163,78,0.12)] border border-[#C9A34E] text-[#0F2342]">
                INDIVIDUAL CONSUMER & PRACTITIONER
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F2342] font-heading">
              {userName}
            </h1>
            <div className="text-xs text-[#475569] flex flex-wrap items-center gap-2 pt-0.5">
              <span>Account Type: Individual</span>
              <span>·</span>
              <span>Active Resources: {myOrders.length}</span>
              <span>·</span>
              <span>Booked Consultations: {consultations.length}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onExploreMarketplace}
          className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2.5 px-5 cursor-pointer"
        >
          Browse Marketplace
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E8F0] flex items-center gap-8 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'purchases'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          Purchased Toolkits & Curriculums ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('consultations')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'consultations'
              ? 'border-[#173B70] text-[#173B70]'
              : 'border-transparent text-[#475569] hover:text-[#0F2342]'
          }`}
        >
          1-on-1 Consultations ({consultations.length})
        </button>
      </div>

      {/* Tab 1: Purchases */}
      {activeTab === 'purchases' && (
        <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white">
          {errorMessage && (
            <div role="alert" className="p-4 text-sm text-red-800 bg-red-50">{errorMessage}</div>
          )}
          {myOrders.length === 0 && !errorMessage && (
            <div className="p-8 text-sm text-[#64748B]">You have no marketplace requests yet.</div>
          )}
          {myOrders.map((order) => (
            <div key={order.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#75777F]">{order.id}</span>
                  <span>·</span>
                  <span className="text-xs text-[#C9A34E] font-semibold uppercase tracking-wider">{order.category}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F2342] font-heading">
                  {order.title}
                </h3>
                <div className="text-xs text-[#475569]">
                  Created by {order.creator} · Acquired {order.date}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-[#0F2342]">{order.price}</span>
                <span className="px-3 py-1.5 text-xs font-semibold bg-[#F5F7FA] text-[#475569] border border-[#E2E8F0]">
                {String(order.status).replaceAll('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Consultations */}
      {activeTab === 'consultations' && (
        <div className="border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-white">
          {consultations.map((cns) => (
            <div key={cns.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#75777F]">{cns.id}</span>
                  <span>·</span>
                  <span className="text-xs font-semibold text-[#173B70]">{cns.advisor}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F2342] font-heading">
                  {cns.topic}
                </h3>
                <div className="text-xs text-[#475569]">
                  {cns.role} · {cns.scheduledDate}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 text-xs bg-[rgba(201,163,78,0.1)] border border-[#C9A34E] text-[#0F2342] font-bold">
                  {cns.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
