import React, { useState, useEffect } from 'react';
import { MarketplaceItem } from '../../types/asako';
import { AlertCircle, Check, Search, ShoppingBag, X } from 'lucide-react';
import { api } from '../../services/api';

export const MarketplaceScreen: React.FC = () => {
  const [itemsList, setItemsList] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<MarketplaceItem | null>(null);
  const [enquiryMessage, setEnquiryMessage] = useState('Hi, I’m interested in this offering. Could you share more details?');
  const [enquirySent, setEnquirySent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        const res = await api.marketplace.list();
        setItemsList(res.listings);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Marketplace listings could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMarketplace();
  }, []);

  const categories = [
    'Design System',
    'Educational Curriculum',
    'Pro Consultation',
  ];

  const filteredItems = itemsList.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCreator = item.creator.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchCreator && !matchDesc) return false;
    }

    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const handleOrder = (item: MarketplaceItem) => {
    setActiveModalItem(item);
    setEnquirySent(false);
    setErrorMessage(null);
  };

  const handleEnquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeModalItem) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await api.marketplace.enquire(activeModalItem.id, { message: enquiryMessage });
      setEnquirySent(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Your enquiry could not be sent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12">
      {/* Title */}
      <div className="border-b border-[#E2E8F0] pb-8 space-y-3">
        <div className="text-[11px] font-body font-semibold uppercase tracking-[0.12em] text-[#C9A34E]">
          CONSUMER & PRO RESOURCE COMMERCE
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F2342] font-heading tracking-[-0.03em]">
          ASAKO Marketplace
        </h1>
        <p className="text-base text-[#475569] max-w-2xl font-body leading-relaxed">
          Production design systems, university career curriculums, institutional legal templates, and 1-on-1 portfolio strategy sessions curated for consumers and creators.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 font-body">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75777F]" />
          <input
            type="text"
            placeholder="Search resources, templates, toolkits, or consultants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] pl-11 pr-4 py-3.5 text-xs text-[#191C1E] focus:outline-none focus:border-[#173B70] rounded-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white border border-[#E2E8F0] p-4 text-xs">
          <span className="font-semibold text-[#0F2342] uppercase tracking-[0.12em] mr-2">
            Resource Type:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 transition-colors border cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#173B70] text-white border-[#173B70]'
                : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:border-[#173B70]'
            }`}
          >
            All Offerings
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 transition-colors border cursor-pointer ${
                selectedCategory === c
                  ? 'bg-[#173B70] text-white border-[#173B70]'
                  : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:border-[#173B70]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace Grid */}
      {errorMessage && !activeModalItem && (
        <div role="alert" className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading && (
          <p className="col-span-full py-8 text-center text-sm text-[#64748B]">Loading marketplace listings…</p>
        )}
        {!isLoading && filteredItems.length === 0 && !errorMessage && (
          <p className="col-span-full rounded-xl border border-dashed border-[#CBD5E1] bg-white p-8 text-sm text-[#64748B]">
            No offerings match your search and filters.
          </p>
        )}
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="asako-interactive-card bg-white border border-[#E2E8F0] hover:border-[#173B70] transition-all p-8 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C9A34E] uppercase tracking-[0.12em] font-body">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F5F7FA] border border-[#E2E8F0] text-[#0F2342]">
                  {item.deliverableType}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[#0F2342] font-heading">
                {item.title}
              </h3>

              <div className="text-xs font-semibold text-[#173B70] font-body">
                Created by {item.creator}
              </div>

              <p className="text-xs text-[#475569] leading-relaxed font-body">
                {item.description}
              </p>

              {/* Specs & Deliverables */}
              <div className="bg-[#F5F7FA] border border-[#E2E8F0] p-4 space-y-2 text-xs font-body">
                <div className="text-[10px] font-bold text-[#75777F] uppercase tracking-wider">
                  Included Package Assets:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#475569]">
                  {item.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#C9A34E] shrink-0"></span>
                      <span className="truncate">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between font-body">
              <div>
                <span className="text-[10px] text-[#75777F] uppercase tracking-wider block">
                  Price
                </span>
                <span className="text-2xl font-extrabold text-[#0F2342]">
                  {item.price}
                </span>
              </div>

              <button
                onClick={() => handleOrder(item)}
                className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2.5 px-6 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#C9A34E]" />
                <span>Ask about this</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Instant Order Confirmation Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2342]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-[#0F2342] shadow-asako-floating p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#C9A34E]"></span>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#0F2342] font-body">
                  RESOURCE ACCESS CONFIRMATION
                </span>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="text-[#75777F] hover:text-[#0F2342] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {enquirySent ? (
              <>
                <div role="status" className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <Check className="w-5 h-5 shrink-0" />
                  <span>Your enquiry was sent to {activeModalItem.creator}. The creator can follow up through your account contact details.</span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-5 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleEnquiry} className="space-y-4 font-body">
                <div className="space-y-1">
                  <label htmlFor="marketplace-enquiry" className="text-xs font-semibold text-[#0F2342]">
                    Message to {activeModalItem.creator}
                  </label>
                  <textarea
                    id="marketplace-enquiry"
                    rows={4}
                    maxLength={5000}
                    required
                    value={enquiryMessage}
                    onChange={(event) => setEnquiryMessage(event.target.value)}
                    className="w-full border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#202A38] focus:outline-none focus:border-[#173B70]"
                  />
                </div>
                {errorMessage && (
                  <div role="alert" className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                <div className="flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setActiveModalItem(null)} className="btn-asako-secondary text-xs uppercase tracking-[0.12em] py-2 px-4 cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2 px-5 cursor-pointer">
                    {isSubmitting ? 'Sending...' : 'Send enquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
