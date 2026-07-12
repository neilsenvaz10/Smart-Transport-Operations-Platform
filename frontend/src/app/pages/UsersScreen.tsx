import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { 
  Users, UserPlus, Mail, AlertCircle, CheckCircle, Loader2, 
  ShieldOff, ShieldCheck
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- Validation ---
const inviteUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  temporaryPassword: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['fleet_manager', 'driver', 'safety_officer', 'financial_analyst']),
});

type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
}

export default function UsersScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'invite' | 'pending'>('all');
  const {  } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: { users: UserData[] } }>({
    queryKey: ['users'],
    queryFn: () => apiFetch('/users'),
  });

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => apiFetch(`/users/${userId}/suspend`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const users = data?.data.users || [];
  const allUsers = users.filter(u => u.status !== 'pending_invite');
  const pendingUsers = users.filter(u => u.status === 'pending_invite');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage platform access, roles, and invitations.</p>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-500' 
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Active Users
          </div>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-500' 
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Pending Invitations
            {pendingUsers.length > 0 && (
              <span className="ml-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 py-0.5 px-2 rounded-full text-xs">
                {pendingUsers.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('invite')}
          className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'invite' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-500' 
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite User
          </div>
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'all' && (
          <UserTable users={allUsers} isLoading={isLoading} onToggleStatus={(id) => suspendMutation.mutate(id)} />
        )}
        {activeTab === 'pending' && (
          <UserTable users={pendingUsers} isLoading={isLoading} onToggleStatus={(id) => suspendMutation.mutate(id)} />
        )}
        {activeTab === 'invite' && (
          <InviteUserForm onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setActiveTab('pending');
          }} />
        )}
      </div>
    </div>
  );
}

function UserTable({ users, isLoading, onToggleStatus }: { users: UserData[], isLoading: boolean, onToggleStatus: (id: string) => void }) {
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-[#171A21] border border-slate-200 dark:border-white/5 rounded-xl p-12 text-center">
        <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No users found</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">There are no users in this category.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#171A21] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5">
              <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">Name</th>
              <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">Role</th>
              <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">Status</th>
              <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm">Last Login</th>
              <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center font-medium text-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{u.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                  <span className="capitalize">{u.role.replace('_', ' ')}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                    u.status === 'pending_invite' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                  }`}>
                    {u.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => onToggleStatus(u.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title={u.status === 'suspended' ? 'Reactivate User' : 'Suspend User'}
                  >
                    {u.status === 'suspended' ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InviteUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { role: 'driver' },
  });

  const onSubmit = async (data: InviteUserFormValues) => {
    setServerError(null);
    setSuccessMsg(null);
    try {
      const res = await apiFetch<{ message?: string }>('/users/invite', {
        method: 'POST',
        data,
      });
      setSuccessMsg(res.message || 'Invitation created.');
      reset();
      setTimeout(() => onSuccess(), 2000);
    } catch (err: any) {
      setServerError(err.message || 'Failed to invite user');
    }
  };

  return (
    <div className="bg-white dark:bg-[#171A21] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500">
          <UserPlus size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Send Invitation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Invite a new team member via email.</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {serverError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-md flex items-start text-sm">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 px-4 py-3 rounded-md flex items-start text-sm">
            <CheckCircle className="w-5 h-5 mr-2 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full text-sm rounded-lg py-2 px-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className="w-full text-sm rounded-lg py-2 px-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number (Optional)</label>
            <input
              type="text"
              {...register('phone')}
              className="w-full text-sm rounded-lg py-2 px-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">System Role</label>
            <select
              {...register('role')}
              className="w-full text-sm rounded-lg py-2 px-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="driver">Driver</option>
              <option value="safety_officer">Safety Officer</option>
              <option value="financial_analyst">Financial Analyst</option>
              <option value="fleet_manager">Fleet Manager</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temporary Password</label>
            <input
              type="text"
              {...register('temporaryPassword')}
              className="w-full text-sm rounded-lg py-2 px-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">The user will be required to change this upon their first login.</p>
            {errors.temporaryPassword && <p className="mt-1 text-xs text-red-500">{errors.temporaryPassword.message}</p>}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Send Invitation
          </button>
        </div>
      </form>
    </div>
  );
}
