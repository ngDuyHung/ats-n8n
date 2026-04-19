import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { getSession } from '@/lib/session';
import { ApplicationTable, type AppRow } from '@/components/shared/ApplicationTable';

export default async function HrApplicationsPage() {
  const session = await getSession();
  await connectDB();

  const myJobs = await Job.find({ created_by: session!.userId }).select('_id title').lean();
  const jobIds = myJobs.map((j: any) => j._id.toString());
  const jobMap = Object.fromEntries(myJobs.map((j: any) => [j._id.toString(), j.title]));

  const applications = await Application.find({ job_id: { $in: jobIds } })
    .sort({ 'result.score': -1 })
    .lean();

  const total = applications.length;
  const passed = applications.filter((a: any) => a.ket_qua_cuoi === 'PASSED').length;
  const failed = applications.filter((a: any) => a.ket_qua_cuoi === 'FAILED').length;
  const pending = applications.filter((a: any) => !a.ket_qua_cuoi).length;

  const rows: AppRow[] = applications.map((a: any) => ({
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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Danh sach ung vien</h1>
        <p className="text-gray-500 text-sm mt-1">Tat ca ung vien cho cac tin cua ban</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tong ho so', value: total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Cho duyet', value: pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          { label: 'PASSED', value: passed, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'FAILED', value: failed, color: 'bg-red-50 text-red-700 border-red-200' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>
      <ApplicationTable apps={rows} showJobColumn />
    </div>
  );
}
