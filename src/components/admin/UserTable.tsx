'use client';

import { changeUserRole, deleteUser } from '@/actions/hr-request-actions';
import { Trash2, User, Shield, Briefcase } from 'lucide-react';
import { useState } from 'react';

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'client';
  company?: string;
  created_at: string;
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  hr: 'bg-blue-100 text-blue-700',
  client: 'bg-gray-100 text-gray-600',
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  admin: <Shield className="w-3.5 h-3.5" />,
  hr: <Briefcase className="w-3.5 h-3.5" />,
  client: <User className="w-3.5 h-3.5" />,
};

export function UserTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [list, setList] = useState(users);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: 'admin' | 'hr' | 'client') {
    setLoading(userId + '_role');
    await changeUserRole(userId, newRole);
    setList((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    setLoading(null);
  }

  async function handleDelete(userId: string) {
    if (!confirm('Bạn có chắc muốn xoá user này?')) return;
    setLoading(userId + '_del');
    await deleteUser(userId);
    setList((prev) => prev.filter((u) => u._id !== userId));
    setLoading(null);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-4">Người dùng</th>
            <th className="p-4">Role</th>
            <th className="p-4">Công ty</th>
            <th className="p-4">Ngày tạo</th>
            <th className="p-4">Đổi role</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((user) => (
            <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-sm text-gray-600 uppercase">
                    {user.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[user.role]}`}>
                  {ROLE_ICON[user.role]} {user.role}
                </span>
              </td>
              <td className="p-4 text-sm text-gray-500">{user.company || '—'}</td>
              <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                {new Date(user.created_at).toLocaleDateString('vi-VN')}
              </td>
              <td className="p-4">
                {user._id !== currentUserId ? (
                  <select
                    value={user.role}
                    disabled={loading === user._id + '_role'}
                    onChange={(e) =>
                      handleRoleChange(user._id, e.target.value as 'admin' | 'hr' | 'client')
                    }
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  >
                    <option value="client">client</option>
                    <option value="hr">hr</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  <span className="text-xs text-gray-400">Bạn</span>
                )}
              </td>
              <td className="p-4">
                {user._id !== currentUserId && (
                  <button
                    disabled={loading === user._id + '_del'}
                    onClick={() => handleDelete(user._id)}
                    className="text-red-400 hover:text-red-600 transition disabled:opacity-40"
                    title="Xoá user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
