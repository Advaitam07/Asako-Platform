import React, { useEffect, useState } from 'react';
import { UserRole } from '../types/asako';
import { AsakoLogo } from './AsakoLogo';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building,
  Eye,
  EyeOff,
  GraduationCap,
  Key,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, userName: string, orgName?: string) => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'student',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setSelectedRole(initialRole);
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const roleMeta: Record<
    UserRole,
    { label: string; icon: React.ReactNode; subtitle: string; placeholderOrg: string }
  > = {
    student: {
      label: 'Student',
      icon: <GraduationCap className="h-4 w-4" />,
      subtitle: 'Build your career',
      placeholderOrg: 'University / Institute Name',
    },
    company: {
      label: 'Company',
      icon: <Briefcase className="h-4 w-4" />,
      subtitle: 'Find emerging talent',
      placeholderOrg: 'Company / Studio Name',
    },
    institute: {
      label: 'Institute',
      icon: <Building className="h-4 w-4" />,
      subtitle: 'Connect learning to work',
      placeholderOrg: 'Department / Faculty',
    },
    provider: {
      label: 'Workshop Provider',
      icon: <Sparkles className="h-4 w-4" />,
      subtitle: 'Share your expertise',
      placeholderOrg: 'Academy / Practice Name',
    },
    consumer: {
      label: 'Individual',
      icon: <User className="h-4 w-4" />,
      subtitle: 'Explore tools and services',
      placeholderOrg: 'City / Region',
    },
    admin: {
      label: 'Administrator',
      icon: <Key className="h-4 w-4" />,
      subtitle: 'Platform governance',
      placeholderOrg: 'ASAKO Global Authority',
    },
  };

  const handleModeChange = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMessage(null);
    if (nextMode === 'register' && selectedRole === 'admin') setSelectedRole('student');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        const response = await api.auth.login(email.trim(), password);
        onLoginSuccess(response.user.role as UserRole, response.user.name, response.user.organization);
      } else {
        if (!email.trim() || !password) {
          throw new Error('Email address and password are required.');
        }

        const response = await api.auth.register({
          email: email.trim(),
          password,
          role: selectedRole,
          fullName: fullName.trim() || undefined,
          organizationName: organization.trim() || undefined,
        });

        onLoginSuccess(response.user.role as UserRole, response.user.name, response.user.organization);
      }
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#071426]/70 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        className="auth-shell relative my-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_32px_100px_rgba(2,12,27,0.35)] lg:min-h-[650px] lg:grid-cols-[0.88fr_1.12fr]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-heading"
      >
        <aside className="auth-brand-panel relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-12">
          <div className="auth-brand-orb auth-brand-orb-one" aria-hidden="true" />
          <div className="auth-brand-orb auth-brand-orb-two" aria-hidden="true" />
          <div className="relative z-10">
            <AsakoLogo size="lg" variant="light" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E3B95F]" />
              One connected community
            </div>
            <h2 className="max-w-md text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] xl:text-5xl">
              Your next step deserves a <span className="auth-brand-accent italic">stronger start.</span>
            </h2>
            <p className="max-w-sm text-sm leading-7 text-white/70">
              Connect your ambition with the people, skills, and opportunities that move you forward.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3 border-t border-white/15 pt-6">
            {[
              ['01', 'Learn'],
              ['02', 'Connect'],
              ['03', 'Grow'],
            ].map(([number, label]) => (
              <div key={number} className="space-y-1">
                <div className="text-[10px] font-semibold tracking-[0.15em] text-[#E3B95F]">{number}</div>
                <div className="text-xs font-medium text-white/80">{label}</div>
              </div>
            ))}
          </div>
        </aside>

        <section className="relative flex min-h-[min(760px,94vh)] flex-col p-5 sm:p-8 lg:min-h-0 lg:p-10 xl:p-12">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="absolute right-4 top-4 z-10 rounded-full border border-[#E8EDF3] bg-white p-2 text-[#647184] transition hover:border-[#CCD7E4] hover:text-[#14243A] disabled:opacity-50 sm:right-6 sm:top-6"
            aria-label="Close sign in"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-6 flex items-center justify-between pr-12 lg:hidden">
            <AsakoLogo size="sm" />
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#718096]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2464B4]" />
              Secure access
            </span>
          </div>

          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-2">
            <div className="mb-7 space-y-2 sm:mb-8">
              <div className="mb-3 hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2464B4] lg:flex">
                <LockKeyhole className="h-3.5 w-3.5" />
                ASAKO ACCOUNT ACCESS
              </div>
              <h1 id="auth-heading" className="text-3xl font-extrabold tracking-[-0.04em] text-[#17263B] sm:text-4xl">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-sm leading-6 text-[#718096]">
                {mode === 'login'
                  ? 'Sign in to continue to your ASAKO workspace.'
                  : 'Join the community and choose the pathway that fits you.'}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#F2F5F9] p-1">
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                aria-pressed={mode === 'login'}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  mode === 'login'
                    ? 'bg-white text-[#17263B] shadow-[0_2px_8px_rgba(15,35,66,0.08)]'
                    : 'text-[#718096] hover:text-[#17263B]'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                aria-pressed={mode === 'register'}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  mode === 'register'
                    ? 'bg-white text-[#17263B] shadow-[0_2px_8px_rgba(15,35,66,0.08)]'
                    : 'text-[#718096] hover:text-[#17263B]'
                }`}
              >
                Create account
              </button>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-[#34445A]">Choose your account type</legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {(Object.keys(roleMeta) as UserRole[])
                        .filter((role) => role !== 'admin')
                        .map((role) => {
                          const meta = roleMeta[role];
                          const isSelected = selectedRole === role;
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setSelectedRole(role)}
                              aria-pressed={isSelected}
                              className={`flex min-h-[74px] items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
                                isSelected
                                  ? 'border-[#2464B4] bg-[#F1F6FC] ring-2 ring-[#2464B4]/10'
                                  : 'border-[#E4EAF1] bg-white hover:border-[#A9BCD3]'
                              }`}
                            >
                              <span className={`rounded-lg p-2 ${isSelected ? 'bg-[#2464B4] text-white' : 'bg-[#F1F4F8] text-[#51647D]'}`}>
                                {meta.icon}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-[11px] font-bold text-[#23344B]">{meta.label}</span>
                                <span className="mt-0.5 block truncate text-[9px] text-[#8290A2]">{meta.subtitle}</span>
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </fieldset>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-semibold text-[#34445A]">Full name</span>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Your name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        className="auth-input"
                      />
                    </label>
                    {selectedRole !== 'consumer' && (
                      <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-[#34445A]">{roleMeta[selectedRole].placeholderOrg}</span>
                        <input
                          type="text"
                          autoComplete="organization"
                          placeholder="Organization name"
                          value={organization}
                          onChange={(event) => setOrganization(event.target.value)}
                          className="auth-input"
                        />
                      </label>
                    )}
                  </div>
                </>
              )}

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#34445A]">Email address</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="auth-input"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#34445A]">Password</span>
                <span className="relative block">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={8}
                    maxLength={72}
                    placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="auth-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                    className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-[#7B899B] hover:text-[#2464B4]"
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isPasswordVisible}
                  >
                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              {mode === 'login' && (
                <div className="flex items-center gap-2 pt-0.5 text-xs text-[#647184]">
                  <ShieldCheck className="h-4 w-4 text-[#2464B4]" />
                  <span>Secure account access</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="auth-submit group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#173B70] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(23,59,112,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#102D57] hover:shadow-[0_12px_24px_rgba(23,59,112,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? mode === 'login' ? 'Signing you in…' : 'Creating your account…'
                  : mode === 'login' ? 'Sign in securely' : 'Create account'}
                {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#8A96A6]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2464B4]" />
              Your account is protected with secure authentication
            </div>
          </div>

          <div className="mt-4 hidden items-center justify-between border-t border-[#EEF1F5] pt-4 text-[10px] text-[#9AA5B3] lg:flex">
            <span>© {new Date().getFullYear()} ASAKO</span>
            <span>INNOVATE · BUILD · GROW</span>
          </div>
        </section>
      </div>
    </div>
  );
};
