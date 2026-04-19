import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { getSession } from '@/lib/session';

export default async function HrApplicationsPage() {
  const session = await getSession();
  await connectDB();

  // Lấy tất cả job của HR này
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Danh sách ứng viên</h1>
        <p className="text-gray-500 text-sm mt-1">Tất cả ứng viên cho các tin của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng hồ sơ', value: total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Chờ duyệt', value: pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          { label: 'PASSED', value: passed, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'FAILED', value: failed, color: 'bg-red-50 text-red-700 border-red-200' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Vị trí</th>
              <th className="p-4">Điểm AI</th>
              <th className="p-4">Nhận xét</th>
              <th className="p-4">Kết quả</th>
              <th className="p-4">Ngày nộp</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app: any) => (
              <tr key={app._id.toString()} className="border-t border-gray-50 hover:bg-gray-50 transition">
                <td className="p-4 text-sm">{app.candidate_email}</td>
                <td className="p-4 text-sm text-blue-600 font-medium">
                  {jobMap[app.job_id] || app.job_id}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      (app.result?.score ?? 0) >= 80
                        ? 'bg-green-100 text-green-700'
                        : (app.result?.score ?? 0) >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {app.result?.score ?? 'N/A'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                  {app.result?.feedback ?? '—'}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      app.ket_qua_cuoi === 'PASSED'
                        ? 'bg-green-500 text-white'
                        : app.ket_qua_cuoi === 'FAILED'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {app.ket_qua_cuoi || 'CHỜ DUYỆT'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {new Date(app.created_at).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400 text-sm">
                  Chưa có hồ sơ nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
