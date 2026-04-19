import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/login');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar name={session.name} email={session.email} />
      <main className="flex-1 ml-60 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
