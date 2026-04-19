"use server";

import { connectDB } from "@/lib/db";
import { Application } from "@/models/Application";
import { revalidatePath } from "next/cache";

export async function submitCV(formData: FormData) {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_N8N_ANALYZE_WEBHOOK!, {
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
    const response = await fetch(process.env.NEXT_PUBLIC_N8N_CHOT_SO_WEBHOOK!, {
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