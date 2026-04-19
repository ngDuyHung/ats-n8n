import { createJob } from '@/actions/job-actions';
import { JobForm } from '@/components/hr/JobForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewJobPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/hr/jobs" className="text-gray-400 hover:text-gray-700 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đăng tin tuyển dụng mới</h1>
          <p className="text-gray-500 text-sm mt-0.5">Điền thông tin vị trí cần tuyển</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <JobForm action={createJob} submitLabel="Đăng tin" />
      </div>
    </div>
  );
}
