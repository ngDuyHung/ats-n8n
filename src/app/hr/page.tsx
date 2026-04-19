import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import {
  Briefcase,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { ApplicationTable, type AppRow } from '@/components/shared/ApplicationTable';

export default async function HrDashboard() {
  const session = await getSession();
  await connectDB();

  const myJobs = await Job.find({ created_by: session!.userId })
    .select('_id title status deadline quota')
    .lean();
  const myJobIds = myJobs.map((j: any) => j._id.toString());
  const jobMap = Object.fromEntries(myJobs.map((j: any) => [j._id.toString(), j.title]));

  const now = new Date();
  const openJobs = myJobs.filter((j: any) => j.status === 'OPEN').length;
  const expiringJobs = myJobs.filter((j: any) => {
    const d = new Date(j.deadline);
    return j.status === 'OPEN' && d > now && (d.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const [totalApps, passedApps, recentAppsRaw] = await Promise.all([
    Application.countDocuments({ job_id: { $in: myJobIds } }),
    Application.countDocuments({ job_id: { $in: myJobIds }, ket_qua_cuoi: 'PASSED' }),
    Application.find({ job_id: { $in: myJobIds } }).sort({ created_at: -1 }).limit(10).lean(),
  ]);

  const passRate = totalApps > 0 ? Math.round((passedApps / totalApps) * 100) : 0;

  const recentRows: AppRow[] = recentAppsRaw.map((a: any) => ({
    id: a._id.toString(),
    candidate_email: a.candidate_email,
    candidate_name: a.candidate_name,
    job_id: a.job_id,
    job_title: jobMap[a.job_id],
    score: a.result?.score ?? null,
    feedback: a.result?.feedback,
    status: a.status,
    ket_qua_cuoi: a.ket_qua_cuoi ?? null,
    created_at: a.created_at ? new Date(a.created_at).toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          HR Dashboard
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          Xin chào, {session?.name} 👋
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Jobs đang mở', value: openJobs, icon: Briefcase, light: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Tổng tin đã đăng', value: myJobs.length, icon: ClipboardList, light: 'bg-violet-50', text: 'text-violet-600' },
          { label: 'Tổng ứng viên', value: totalApps, icon: ClipboardList, light: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Tỷ lệ pass', value: `${passRate}%`, icon: TrendingUp, light: 'bg-orange-50', text: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${s.light} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.text}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alert: expiring jobs */}
      {expiringJobs > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            Bạn có <strong>{expiringJobs}</strong> tin tuyển dụng sắp hết hạn trong 7 ngày.
          </p>
          <Link href="/hr/jobs" className="ml-auto text-xs font-semibold text-amber-700 hover:underline shrink-0">
            Xem ngay →
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/hr/jobs"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition group"
        >
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition">
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Tin tuyển dụng</p>
          <p className="text-xs text-gray-400 mt-1">{openJobs} tin đang mở · {myJobs.length} tổng</p>
        </Link>

        <Link
          href="/hr/applications"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-emerald-200 transition group"
        >
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Ứng viên</p>
          <p className="text-xs text-gray-400 mt-1">{totalApps} hồ sơ · {passedApps} đã pass</p>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-2">Tỷ lệ tuyển thành công</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${passRate}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" /> {passedApps} pass</span>
            <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3 h-3" /> {totalApps - passedApps} fail</span>
          </div>
        </div>
      </div>

      {/* Recent applicants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" /> Ứng viên gần đây
          </h2>
          <Link href="/hr/applications" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            Xem tất cả →
          </Link>
        </div>
        <ApplicationTable apps={recentRows} showJobColumn pageSize={10} />
      </div>
    </div>
  );
}
