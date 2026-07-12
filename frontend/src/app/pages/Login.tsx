import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { apiFetch, ApiError } from '../../lib/api';
import {
 Truck, Lock, Mail, AlertCircle, Loader2, Eye, EyeOff
} from 'lucide-react';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
 email: z.string().email('Please enter a valid email address'),
 password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Shared UI ────────────────────────────────────────────────────────────────

const ic = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
 return (
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-slate-700">{label}</label>
 {children}
 {error && (
 <p className="text-xs text-red-500 flex items-center gap-1">
 <AlertCircle size={10} />{error}
 </p>
 )}
 </div>
 );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm() {
 const { login } = useAuth();
 const navigate = useNavigate();
 const [serverError, setServerError] = useState<string | null>(null);
 const [showPassword, setShowPassword] = useState(false);

 const {
 register,
 handleSubmit,
 formState: { errors, isSubmitting },
 } = useForm<LoginFormValues>({
 resolver: zodResolver(loginSchema),
 });

 const onSubmit = async (data: LoginFormValues) => {
 setServerError(null);
 try {
 const res = await apiFetch<{ data: { user: any; token: string } }>('/auth/login', {
 method: 'POST',
 data,
 });
 login(res.data.token, res.data.user);
 navigate('/dashboard', { replace: true });
 } catch (err) {
 if (err instanceof ApiError) {
 setServerError(err.message || 'Invalid email or password');
 } else {
 setServerError('Something went wrong. Please try again.');
 }
 }
 };

 return (
 <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
 {serverError && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start text-sm">
 <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
 <span>{serverError}</span>
 </div>
 )}

 <Field label="Email address" error={errors.email?.message}>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 <input
 type="email"
 {...register('email')}
 className={`${ic} pl-10`}
 placeholder="you@company.com"
 />
 </div>
 </Field>

 <Field label="Password" error={errors.password?.message}>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 <input
 type={showPassword ? "text" : "password"}
 {...register('password')}
 className={`${ic} pl-10 pr-10`}
 placeholder="Enter your password"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
 >
 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 </div>
 </Field>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-[14px] transition-all shadow-sm shadow-blue-600/25 hover:shadow-md hover:shadow-blue-600/25 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {isSubmitting ? (
 <Loader2 className="w-5 h-5 animate-spin" />
 ) : (
 'Sign In to TransitOps'
 )}
 </button>
 </form>
 );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────

export default function Login() {
 return (
 <div className="flex h-screen bg-white font-[Inter,sans-serif]">
 {/* ─── Left Branding Panel ─────────────────────────────────────── */}
 <div className="hidden lg:flex w-[58%] flex-col relative overflow-hidden bg-slate-900">
 {/* Gradient */}
 <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900" />
 {/* Dot grid */}
 <svg className="absolute inset-0 w-full h-full opacity-[0.15]">
 <defs>
 <pattern id="grid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
 <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill="url(#grid)" />
 </svg>
 {/* Glow orbs */}
 <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
 <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

 <div className="relative z-10 flex flex-col h-full px-16 py-12 max-w-2xl mx-auto w-full">
 {/* Logo */}
 <div className="flex items-center gap-3">
 <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/40">
 <Truck size={20} className="text-white" />
 </div>
 <div>
 <p className="text-[17px] font-bold text-white tracking-tight">TransitOps</p>
 <p className="text-[11px] text-blue-300 leading-none">Smart Transport Platform</p>
 </div>
 </div>

 {/* Hero text */}
 <div className="flex-1 flex flex-col justify-center max-w-xl mt-8">
 <h2 className="text-[42px] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
 Smarter fleet<br />operations,<br />at scale.
 </h2>
 <p className="text-blue-200 text-[15px] leading-relaxed mb-10">
 Real-time tracking, driver compliance, and operational intelligence — unified in one enterprise platform.
 </p>

 {/* Fleet illustration */}
 <svg viewBox="0 0 420 210" className="w-full mb-10">
 {/* Road surface */}
 <path d="M-10 175 Q210 145 430 175" stroke="rgba(255,255,255,0.07)" strokeWidth="54" fill="none" />
 <path d="M-10 175 Q210 145 430 175" stroke="rgba(255,255,255,0.04)" strokeWidth="60" fill="none" />
 {/* Road dashes */}
 {[0,55,110,165,220,275,330,385].map(x => (
 <line key={x} x1={x} y1={174} x2={x + 35} y2={172} stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="28 12" />
 ))}

 {/* Truck 1 */}
 <rect x="48" y="147" width="80" height="30" rx="5" fill="rgba(59,130,246,0.3)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
 <rect x="48" y="153" width="26" height="24" rx="4" fill="rgba(59,130,246,0.45)" />
 <rect x="77" y="150" width="51" height="20" rx="2" fill="rgba(255,255,255,0.07)" />
 <circle cx="66" cy="180" r="9" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
 <circle cx="66" cy="180" r="4" fill="rgba(255,255,255,0.08)" />
 <circle cx="112" cy="180" r="9" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
 <circle cx="112" cy="180" r="4" fill="rgba(255,255,255,0.08)" />

 {/* Truck 2 */}
 <rect x="268" y="143" width="92" height="34" rx="5" fill="rgba(99,102,241,0.25)" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
 <rect x="268" y="151" width="30" height="26" rx="4" fill="rgba(99,102,241,0.35)" />
 <rect x="302" y="146" width="58" height="24" rx="2" fill="rgba(255,255,255,0.05)" />
 <circle cx="287" cy="180" r="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
 <circle cx="287" cy="180" r="4.5" fill="rgba(255,255,255,0.07)" />
 <circle cx="338" cy="180" r="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
 <circle cx="338" cy="180" r="4.5" fill="rgba(255,255,255,0.07)" />

 {/* Pin A */}
 <circle cx="88" cy="85" r="20" fill="rgba(59,130,246,0.2)" />
 <circle cx="88" cy="85" r="11" fill="rgba(59,130,246,0.45)" />
 <circle cx="88" cy="85" r="5" fill="rgba(255,255,255,0.85)" />
 <line x1="88" y1="105" x2="88" y2="147" stroke="rgba(59,130,246,0.35)" strokeWidth="1.5" strokeDasharray="5 4" />

 {/* Pin B */}
 <circle cx="310" cy="62" r="20" fill="rgba(96,165,250,0.18)" />
 <circle cx="310" cy="62" r="11" fill="rgba(96,165,250,0.38)" />
 <circle cx="310" cy="62" r="5" fill="rgba(255,255,255,0.75)" />
 <line x1="310" y1="82" x2="310" y2="143" stroke="rgba(96,165,250,0.28)" strokeWidth="1.5" strokeDasharray="5 4" />

 {/* Route path */}
 <path d="M108 85 Q200 45 290 62" stroke="rgba(148,197,253,0.45)" strokeWidth="1.5" strokeDasharray="7 5" fill="none" />

 {/* Labels */}
 <rect x="112" y="75" width="56" height="18" rx="4" fill="rgba(255,255,255,0.08)" />
 <text x="140" y="87" fontSize="9" fill="rgba(255,255,255,0.7)" textAnchor="middle" fontFamily="Inter,sans-serif">Chicago, IL</text>
 <rect x="272" y="50" width="62" height="18" rx="4" fill="rgba(255,255,255,0.08)" />
 <text x="303" y="62" fontSize="9" fill="rgba(255,255,255,0.7)" textAnchor="middle" fontFamily="Inter,sans-serif">Detroit, MI</text>

 {/* Speed dots */}
 <circle cx="30" cy="25" r="3" fill="rgba(96,165,250,0.4)" />
 <circle cx="200" cy="18" r="3" fill="rgba(96,165,250,0.3)" />
 <circle cx="390" cy="30" r="3" fill="rgba(96,165,250,0.35)" />
 </svg>

 {/* Stats */}
 <div className="flex gap-8">
 {[
 { v: '500+', l: 'Enterprise Clients' },
 { v: '12K+', l: 'Vehicles Tracked' },
 { v: '99.9%', l: 'Platform Uptime' },
 ].map(({ v, l }) => (
 <div key={l}>
 <p className="text-[22px] font-extrabold text-white tabular-nums">{v}</p>
 <p className="text-[11px] text-blue-300 mt-0.5">{l}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Role pills */}
 <div className="flex gap-3">
 {[
 { r: 'Dispatcher', d: 'Assign & track trips' },
 { r: 'Fleet Manager', d: 'Full fleet oversight' },
 { r: 'Administrator', d: 'System-wide control' },
 ].map(({ r, d }) => (
 <div key={r} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-3">
 <p className="text-[11px] font-semibold text-white">{r}</p>
 <p className="text-[10px] text-blue-300 mt-0.5">{d}</p>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* ─── Right Form Panel ────────────────────────────────────────── */}
 <div className="flex-1 flex items-center justify-center bg-slate-50 px-8">
 <div className="w-full max-w-[380px]">
 {/* Mobile logo */}
 <div className="flex items-center gap-2 mb-8 lg:hidden">
 <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center">
 <Truck size={15} className="text-white" />
 </div>
 <span className="font-bold text-slate-900">TransitOps</span>
 </div>

 <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8">
 {/* Header */}
 <div className="mb-6">
 <h2 className="text-[22px] font-bold text-slate-900">Welcome back</h2>
 <p className="text-[13px] text-slate-500 mt-1">Sign in to your TransitOps account</p>
 </div>

 {/* Form */}
 <LoginForm />
 </div>

 <p className="text-center text-[11px] text-slate-400 mt-5">
 SOC 2 Type II certified · Enterprise-grade security
 </p>
 </div>
 </div>
 </div>
 );
}
