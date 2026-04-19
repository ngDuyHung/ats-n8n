import { connectDB } from "@/lib/db";
import { Application } from "@/models/Application";
import { Job } from "@/models/Job";
import { FinalizeButton } from "@/components/admin/FinalizeButton";
import { ApplicationTable, type AppRow } from "@/components/shared/ApplicationTable";

export default async function AdminApplicationsPage() {
  await connectDB();

  const [apps, jobs] = await Promise.all([
    Application.find().sort({ created_at: -1 }).lean(),
    Job.find().select('_id title').lean(),
  ]);

  const jobMap = Object.fromEntries(jobs.map((j: any) => [j._id.toString(), j.title]));

  const rows: AppRow[] = apps.map((a: any) => ({
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tất cả ứng viên</h1>
          <p className="text-gray-500 text-sm mt-0.5">{apps.length} hồ sơ</p>
        </div>
        <FinalizeButton />
      </div>
      <ApplicationTable apps={rows} showJobColumn />
    </div>
  );
}
