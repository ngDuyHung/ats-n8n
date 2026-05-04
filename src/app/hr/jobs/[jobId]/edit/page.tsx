import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { getSession } from '@/lib/session';
import { updateJob } from '@/actions/job-actions';
import { JobForm } from '@/components/hr/JobForm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const session = await getSession();
  await connectDB();

  const job = await Job.findById(jobId).lean();
  if (!job) notFound();

  const jobAny = job as any;
  if (
    session?.role !== 'admin' &&
    jobAny.created_by.toString() !== session?.userId
  ) {
    notFound();
  }

  const deadline = new Date(jobAny.deadline).toISOString().split('T')[0];

  // Bind jobId vào action
  const updateWithId = updateJob.bind(null, jobId);

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/hr/jobs/${jobId}`} className="text-gray-400 hover:text-gray-700 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa tin tuyển dụng</h1>
          <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{jobAny.title}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <JobForm
          action={updateWithId}
          submitLabel="Lưu thay đổi"
          defaultValues={{
            title: jobAny.title,
            description: jobAny.description,
            department: jobAny.department,
            location: jobAny.location,
            salary_range: jobAny.salary_range,
            deadline,
            quota: jobAny.quota,
            cover_image: jobAny.cover_image,
          }}
        />
      </div>
    </div>
  );
}
