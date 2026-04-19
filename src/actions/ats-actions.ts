"use server";

import { connectDB } from "@/lib/db";
import { Application } from "@/models/Application";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function submitCV(formData: FormData) {
  try {
    const response = await fetch(process.env.N8N_ANALYZE_WEBHOOK!, {
      method: 'POST',
      body: formData, // Gửi trực tiếp multipart/form-data
    });

    if (!response.ok) throw new Error("Lỗi gửi Webhook n8n");
    
    return { success: true };
  } catch (error) {
    console.error("Submit Error:", error);
    return { success: false, error: "Không thể nộp hồ sơ." };
  }
}

export async function finalizeSelection(jobId: string, quota: number) {
  try {
    const response = await fetch(process.env.N8N_CHOT_SO_WEBHOOK!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, so_luong_tuyen: quota }),
    });

    if (!response.ok) throw new Error("Lỗi chốt sổ");
    
    // Refresh lại data trang admin sau khi chốt sổ
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Lỗi thực thi chốt sổ." };
  }
}

// Server action dùng cho trang /jobs/[jobId]/apply
export type ApplyFormState =
  | { message?: string; success?: boolean }
  | undefined;

export async function applyForJob(
  state: ApplyFormState,
  formData: FormData
): Promise<ApplyFormState> {
  const session = await getSession();
  if (!session) return { message: 'Vui lòng đăng nhập để nộp hồ sơ.' };
  if (session.role !== 'client') return { message: 'Chỉ ứng viên mới có thể nộp hồ sơ.' };

  const cvFile = formData.get('cv_file') as File | null;
  if (!cvFile || cvFile.size === 0) return { message: 'Vui lòng chọn file CV (PDF).' };
  if (!cvFile.name.toLowerCase().endsWith('.pdf')) return { message: 'Chỉ chấp nhận file PDF.' };

  const jobId = formData.get('job_id') as string;
  if (!jobId) return { message: 'Dữ liệu không hợp lệ.' };

  const webhookUrl = process.env.N8N_ANALYZE_WEBHOOK;
  if (!webhookUrl) return { message: 'Hệ thống chưa cấu hình webhook.' };

  // Gán email và name từ session để đảm bảo đúng
  formData.set('candidate_email', session.email);
  formData.set('candidate_name', session.name);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('n8n error');
  } catch {
    return { message: 'Không thể gửi hồ sơ. Vui lòng thử lại sau.' };
  }

  revalidatePath('/my-applications');
  redirect('/my-applications');
}