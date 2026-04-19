import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { HrSidebar } from '@/components/hr/HrSidebar';

export default async function HrLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== 'hr') redirect('/login');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <HrSidebar name={session.name} />
      <main className="flex-1 ml-60 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
