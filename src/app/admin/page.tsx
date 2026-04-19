import { connectDB } from "@/lib/db";
import { Application } from "@/models/Application";
import { FinalizeButton } from "@/components/admin/FinalizeButton";

export default async function AdminDashboard() {
  await connectDB();
  const apps = await Application.find().sort({ created_at: -1 }).lean();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Danh sách ứng viên</h1>
        <FinalizeButton />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-sm">Email</th>
              <th className="p-4 font-semibold text-sm">Job ID</th>
              <th className="p-4 font-semibold text-sm">Điểm AI</th>
              <th className="p-4 font-semibold text-sm">Trạng thái</th>
              <th className="p-4 font-semibold text-sm">Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app: any) => (
              <tr key={app._id.toString()} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="p-4 text-sm">{app.candidate_email}</td>
                <td className="p-4 text-sm font-medium">{app.job_id}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded-md font-bold ${app.result?.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    {app.result?.score || "N/A"}
                  </span>
                </td>
                <td className="p-4 text-xs font-semibold">{app.status}</td>
                <td className="p-4">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.ket_qua_cuoi === 'PASSED' ? 'bg-green-500 text-white' : app.ket_qua_cuoi === 'FAILED' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
                    {app.ket_qua_cuoi || "CHỜ DUYỆT"}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}