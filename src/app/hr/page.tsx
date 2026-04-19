import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { Briefcase, ClipboardList, CheckCircle, TrendingUp, PlusCircle } from 'lucide-react';

export default async function HrDashboard() {
  const session = await getSession();
  await connectDB();

  const [openJobs, allJobs, totalApps, passedApps, recentApps] = await Promise.all([
    Job.countDocuments({ created_by: session!.userId, status: 'OPEN' }),
    Job.countDocuments({ created_by: session!.userId }),
    Application.countDocuments(),
    Application.countDocuments({ ket_qua_cuoi: 'PASSED' }),
    Application.find().sort({ created_at: -1 }).limit(5).lean(),
  ]);

  const passRate = totalApps > 0 ? Math.round((passedApps / totalApps) * 100) : 0;

  const stats = [
    { label: 'Jobs đang mở', value: openJobs, icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
    { label: 'Tổng tin đã đăng', value: allJobs, icon: ClipboardList, color: 'bg-purple-100 text-purple-600' },
    { label: 'Tổng ứng viên', value: totalApps, icon: ClipboardList, color: 'bg-green-100 text-green-600' },
    { label: 'Tỷ lệ pass', value: `${passRate}%`, icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Xin chào, {session?.name}</p>
        </div>
        <Link
          href="/hr/jobs/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
        >
          <PlusCircle className="w-4 h-4" /> Đăng tin mới
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/hr/jobs" className="bg-blue-50 border border-blue-200 rounded-2xl p-5 hover:bg-blue-100 transition">
          <Briefcase className="w-5 h-5 text-blue-600 mb-2" />
          <p className="font-semibold text-gray-900">Quản lý tin tuyển dụng</p>
          <p className="text-sm text-gray-500 mt-1">{openJobs} tin đang mở</p>
        </Link>
        <Link href="/hr/applications" className="bg-green-50 border border-green-200 rounded-2xl p-5 hover:bg-green-100 transition">
          <ClipboardList className="w-5 h-5 text-green-600 mb-2" />
          <p className="font-semibold text-gray-900">Danh sách ứng viên</p>
          <p className="text-sm text-gray-500 mt-1">{totalApps} hồ sơ</p>
        </Link>
      </div>

      {/* Recent applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Ứng viên gần đây</h2>
          <Link href="/hr/applications" className="text-sm text-blue-600 hover:underline">Xem tất cả →</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Job ID</th>
                <th className="p-4">Điểm AI</th>
                <th className="p-4">Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.map((app: any) => (
                <tr key={app._id.toString()} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="p-4 text-sm">{app.candidate_email}</td>
                  <td className="p-4 text-sm font-medium">{app.job_id}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${(app.result?.score ?? 0) >= 70 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {app.result?.score ?? 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.ket_qua_cuoi === 'PASSED' ? 'bg-green-500 text-white' : app.ket_qua_cuoi === 'FAILED' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {app.ket_qua_cuoi || 'CHỜ DUYỆT'}
                    </span>
                  </td>
                </tr>
              ))}
              {recentApps.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Chưa có ứng viên nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
