"use server";

import { revalidatePath } from "next/cache";
import {
  updateCmsStat,
  createCmsCourse,
  updateCmsCourse,
  deleteCmsCourse,
  createCmsFaq,
  updateCmsFaq,
  deleteCmsFaq,
  updateCmsSiteSettings,
} from "@/lib/cms-repo";
import { CmsCourse, CmsFaq, CmsSiteSettings, CmsStat } from "@/types";

export async function updateStatMetricAction(id: string, updates: Partial<CmsStat>) {
  try {
    await updateCmsStat(id, updates);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update stat metric" };
  }
}

export async function createCourseAction(course: Omit<CmsCourse, "id" | "clicks_count">) {
  try {
    const created = await createCmsCourse(course);
    revalidatePath("/");
    revalidatePath("/apply");
    revalidatePath("/admin/dashboard");
    return { success: true, course: created };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create course" };
  }
}

export async function updateCourseAction(id: string, updates: Partial<CmsCourse>) {
  try {
    await updateCmsCourse(id, updates);
    revalidatePath("/");
    revalidatePath("/apply");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update course" };
  }
}

export async function deleteCourseAction(id: string) {
  try {
    await deleteCmsCourse(id);
    revalidatePath("/");
    revalidatePath("/apply");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete course" };
  }
}

export async function createFaqAction(faq: Omit<CmsFaq, "id">) {
  try {
    const created = await createCmsFaq(faq);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true, faq: created };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create FAQ" };
  }
}

export async function updateFaqAction(id: string, updates: Partial<CmsFaq>) {
  try {
    await updateCmsFaq(id, updates);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update FAQ" };
  }
}

export async function deleteFaqAction(id: string) {
  try {
    await deleteCmsFaq(id);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete FAQ" };
  }
}

export async function updateSiteSettingsAction(settings: Partial<CmsSiteSettings>) {
  try {
    await updateCmsSiteSettings(settings);
    revalidatePath("/");
    revalidatePath("/apply");
    revalidatePath("/payment-instructions");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update site settings" };
  }
}
