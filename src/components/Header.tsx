import React from 'react';
import { PublicTab, UserRole } from '../types/asako';
import { AsakoLogo } from './AsakoLogo';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  currentTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
  onOpenAuth: (role?: UserRole) => void;
  currentUser: {
    isLoggedIn: boolean;
    role: UserRole;
    name: string;
    organization?: string;
  };
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  currentUser,
  onLogout,
}) => {
  const navItems: { id: PublicTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'platform', label: 'Platform' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];
  const visibleNavItems = currentUser.isLoggedIn
    ? navItems.filter((item) => item.id !== 'home')
    : navItems;

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'student':
        return 'Student';
      case 'company':
        return 'Company';
      case 'institute':
        return 'Institute';
      case 'provider':
        return 'Provider';
      case 'consumer':
        return 'Consumer';
      case 'admin':
        return 'Governance';
    }
  };
  const roleDisplayName = getRoleDisplayName(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]">
      {currentUser.isLoggedIn && (
        <div className="bg-[#0F2342] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-2 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.12em]">
            <span>ASAKO Ecosystem</span>
            <span className="text-[#E7C777]">{roleDisplayName} Portal</span>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-3 sm:gap-8 h-20">
        {/* Zone 1: Single text brand wordmark */}
        <button
          onClick={() => onSelectTab(currentUser.isLoggedIn ? 'dashboard' : 'home')}
          className="cursor-pointer text-left focus:outline-none"
        >
          <AsakoLogo size="md" showTagline={true} />
        </button>

        <nav
          className="hidden xl:flex items-center gap-5 text-[13px] font-semibold text-[#475569] font-heading"
          aria-label="Main navigation"
        >
          {visibleNavItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#173B70] text-[#173B70]'
                    : 'border-transparent hover:text-[#173B70] hover:border-[#E2E8F0]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action or active authenticated state */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser.isLoggedIn ? (
            <div className="flex items-center gap-2 font-heading">
              <button
                onClick={() => onSelectTab('dashboard')}
                aria-label={`${roleDisplayName} Dashboard`}
                title={`${roleDisplayName} Dashboard`}
                className={`px-2 sm:px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors flex items-center gap-2 border cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-[#173B70] text-white border-[#173B70]'
                    : 'bg-[#F5F7FA] text-[#0F2342] border-[#E2E8F0] hover:border-[#173B70]'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#C9A34E]" />
                <span className="sr-only sm:not-sr-only truncate max-w-[120px] sm:max-w-[160px]">
                  {roleDisplayName} Dashboard
                </span>
              </button>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 border border-[#E2E8F0] text-[#475569] hover:text-[#ba1a1a] hover:border-[#ba1a1a] transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('student')}
                className="btn-asako-primary text-xs uppercase tracking-[0.12em] py-2.5 px-4 cursor-pointer"
              >
                Sign In / Join
              </button>
            </div>
          )}
        </div>
      </div>

      <nav
        className="xl:hidden flex flex-wrap justify-center border-t border-[#E2E8F0] px-3 py-2 bg-[#F5F7FA] gap-x-3 gap-y-1.5 text-xs font-medium text-[#475569]"
        aria-label="Main navigation"
      >
        {visibleNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            aria-current={currentTab === item.id ? 'page' : undefined}
            className={`whitespace-nowrap py-1 px-1.5 ${
              currentTab === item.id
                ? 'text-[#173B70] font-bold border-b border-[#173B70]'
                : ''
            }`}
          >
            {item.label}
          </button>
        ))}
        {currentUser.isLoggedIn && (
          <button
            onClick={() => onSelectTab('dashboard')}
            aria-current={currentTab === 'dashboard' ? 'page' : undefined}
            className={`whitespace-nowrap py-1 px-1.5 text-[#C9A34E] font-bold ${
              currentTab === 'dashboard' ? 'border-b border-[#C9A34E]' : ''
            }`}
          >
            {roleDisplayName} Dashboard
          </button>
        )}
      </nav>
    </header>
  );
};
