import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { getSession } from '@/lib/session';
import { UserTable } from '@/components/admin/UserTable';

export default async function UsersPage() {
  await connectDB();
  const session = await getSession();

  const raw = await User.find().sort({ created_at: -1 }).lean();

  const users = raw.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role as 'admin' | 'hr' | 'client',
    company: u.company ?? '',
    created_at: u.created_at.toISOString(),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Tổng {users.length} tài khoản · {users.filter((u) => u.role === 'hr').length} HR ·{' '}
          {users.filter((u) => u.role === 'client').length} ứng viên
        </p>
      </div>

      <UserTable users={users} currentUserId={session?.userId ?? ''} />
    </div>
  );
}
