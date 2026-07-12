import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiFetch, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { AlertCircle, KeyRound, Loader2, Bus, LogOut } from 'lucide-react';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Must be at least 6 characters'),
  newPassword: z.string().min(6, 'Must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePassword() {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setServerError(null);
    try {
      const res = await apiFetch<{ data: { isFirstLogin: boolean, status: string } }>('/users/change-password', {
        method: 'PATCH',
        data: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      });

      // Update user in context/localStorage so they can access the dashboard
      if (user) {
        const token = localStorage.getItem('transitops_token') || '';
        login(token, { ...user, isFirstLogin: res.data.isFirstLogin, status: res.data.status as any });
      }

      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message || 'Failed to change password');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Bus size={28} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Change Your Password
        </h2>
        {user?.isFirstLogin ? (
          <p className="mt-2 text-center text-sm text-slate-600">
            For security reasons, you must change your temporary password before accessing TransitOps.
          </p>
        ) : (
          <p className="mt-2 text-center text-sm text-slate-600">
            Update your account password.
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start text-sm">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current (or Temporary) Password
              </label>
              <input
                type="password"
                {...register('currentPassword')}
                className={`block w-full rounded-lg border ${
                  errors.currentPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                } py-2.5 px-3 text-sm shadow-sm outline-none transition-colors`}
              />
              {errors.currentPassword && <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                {...register('newPassword')}
                className={`block w-full rounded-lg border ${
                  errors.newPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                } py-2.5 px-3 text-sm shadow-sm outline-none transition-colors`}
              />
              {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                className={`block w-full rounded-lg border ${
                  errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                } py-2.5 px-3 text-sm shadow-sm outline-none transition-colors`}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center items-center gap-2 rounded-lg bg-blue-600 py-2.5 px-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Change Password & Continue
              </button>
              
              <button
                type="button"
                onClick={() => logout()}
                className="mt-4 flex w-full justify-center items-center gap-2 rounded-lg bg-slate-100 py-2.5 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
