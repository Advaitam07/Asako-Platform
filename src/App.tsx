import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeScreen } from './components/screens/HomeScreen';
import { PlatformScreen } from './components/screens/PlatformScreen';
import { OpportunitiesScreen } from './components/screens/OpportunitiesScreen';
import { WorkshopsScreen } from './components/screens/WorkshopsScreen';
import { MarketplaceScreen } from './components/screens/MarketplaceScreen';
import { AboutScreen } from './components/screens/AboutScreen';
import { ContactScreen } from './components/screens/ContactScreen';
import { StudentDashboard } from './components/screens/StudentDashboard';
import { CompanyDashboard } from './components/screens/CompanyDashboard';
import { InstituteDashboard } from './components/screens/InstituteDashboard';
import { WorkshopProviderDashboard } from './components/screens/WorkshopProviderDashboard';
import { ConsumerDashboard } from './components/screens/ConsumerDashboard';
import { AdminDashboard } from './components/screens/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { OpportunityModal } from './components/OpportunityModal';
import { WorkshopModal } from './components/WorkshopModal';
import { Opportunity, PublicTab, UserRole, Workshop } from './types/asako';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<PublicTab>('home');

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<{
    isLoggedIn: boolean;
    role: UserRole;
    name: string;
    organization?: string;
  }>({
    isLoggedIn: false,
    role: 'student',
    name: '',
    organization: undefined,
  });

  // Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('student');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  // User interactions: Applied & Enrolled IDs
  const [appliedOppIds, setAppliedOppIds] = useState<string[]>([]);
  const [enrolledWsIds, setEnrolledWsIds] = useState<string[]>([]);

  // Check existing session on load
  useEffect(() => {
    const checkSession = async () => {
      if (!api.getToken()) return;
      try {
        const res = await api.auth.getMe();
        if (res && res.user) {
          setCurrentUser({
            isLoggedIn: true,
            role: res.user.role as UserRole,
            name: res.user.name,
            organization: res.user.organization,
          });
        }
      } catch (err) {
        api.setToken(null);
      }
    };
    checkSession();
  }, []);

  const handleOpenAuth = (role: UserRole = 'student') => {
    setAuthInitialRole(role);
    setIsAuthOpen(true);
  };

  const handleSelectTab = (tab: PublicTab) => {
    if (!currentUser.isLoggedIn && tab !== 'home') {
      handleOpenAuth();
      return;
    }
    setCurrentTab(tab);
  };

  const handleLoginSuccess = (role: UserRole, userName: string, orgName?: string) => {
    setCurrentUser({
      isLoggedIn: true,
      role,
      name: userName,
      organization: orgName,
    });
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Ignore
    }
    setCurrentUser({
      isLoggedIn: false,
      role: 'student',
      name: '',
      organization: undefined,
    });
    setCurrentTab('home');
  };

  const handleApplySuccess = async (
    opp: Opportunity,
    details: { coverNote: string; portfolioLinks: string[] },
  ) => {
    await api.opportunities.apply(opp.id, details);
    if (!appliedOppIds.includes(opp.id)) {
      setAppliedOppIds([...appliedOppIds, opp.id]);
    }
  };

  const handleEnrollSuccess = async (ws: Workshop) => {
    await api.workshops.register(ws.id);
    if (!enrolledWsIds.includes(ws.id)) {
      setEnrolledWsIds([...enrolledWsIds, ws.id]);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#202A38] flex flex-col font-body selection:bg-[#173B70] selection:text-white">
      {/* 1. Header following the 3-zone contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAuth={handleOpenAuth}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Dynamic Content View */}
      <main key={currentTab} className="flex-1 screen-enter">
        {/* PUBLIC SCREENS */}
        {currentTab === 'home' && (
          <HomeScreen
            isLoggedIn={currentUser.isLoggedIn}
            onSelectTab={handleSelectTab}
            onOpenAuth={handleOpenAuth}
            onSelectOpportunity={setSelectedOpportunity}
            onSelectWorkshop={setSelectedWorkshop}
          />
        )}

        {currentTab === 'platform' && (
          <PlatformScreen onOpenAuth={handleOpenAuth} />
        )}

        {currentTab === 'opportunities' && (
          <OpportunitiesScreen
            onSelectOpportunity={setSelectedOpportunity}
          />
        )}

        {currentTab === 'workshops' && (
          <WorkshopsScreen
            onSelectWorkshop={setSelectedWorkshop}
            enrolledWorkshopIds={enrolledWsIds}
          />
        )}

        {currentTab === 'marketplace' && (
          <MarketplaceScreen />
        )}

        {currentTab === 'about' && (
          <AboutScreen />
        )}

        {currentTab === 'contact' && (
          <ContactScreen />
        )}

        {/* ROLE-SPECIFIC DASHBOARD SCREENS */}
        {currentTab === 'dashboard' && (
          <>
            {currentUser.role === 'student' && (
              <StudentDashboard
                userName={currentUser.name}
                userOrg={currentUser.organization}
                onExploreOpportunities={() => handleSelectTab('opportunities')}
                onExploreWorkshops={() => handleSelectTab('workshops')}
              />
            )}

            {currentUser.role === 'company' && (
              <CompanyDashboard
                userName={currentUser.name}
                companyName={currentUser.organization || 'Your company'}
              />
            )}

            {currentUser.role === 'institute' && (
              <InstituteDashboard
                userName={currentUser.name}
                instituteName={currentUser.organization || 'Your institute'}
              />
            )}

            {currentUser.role === 'provider' && (
              <WorkshopProviderDashboard
                userName={currentUser.name}
                providerName={currentUser.organization || 'Your workshop provider'}
              />
            )}

            {currentUser.role === 'consumer' && (
              <ConsumerDashboard
                userName={currentUser.name}
                onExploreMarketplace={() => handleSelectTab('marketplace')}
              />
            )}

            {currentUser.role === 'admin' && (
              <AdminDashboard />
            )}
          </>
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        onSelectTab={handleSelectTab}
        onOpenAuth={handleOpenAuth}
      />

      {/* 5. Unified Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={authInitialRole}
      />

      {/* 6. Opportunity Detail & Application Modal */}
      <OpportunityModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onApplySuccess={handleApplySuccess}
        isApplied={selectedOpportunity ? appliedOppIds.includes(selectedOpportunity.id) : false}
      />

      {/* 7. Workshop Detail & Enrollment Modal */}
      <WorkshopModal
        workshop={selectedWorkshop}
        onClose={() => setSelectedWorkshop(null)}
        onEnrollSuccess={handleEnrollSuccess}
        isEnrolled={selectedWorkshop ? enrolledWsIds.includes(selectedWorkshop.id) : false}
      />
    </div>
  );
}
