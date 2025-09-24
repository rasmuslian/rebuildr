"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalidates the Next.js cache for a given path.
 *
 * @param path - The route path to refresh (e.g. "/admin/article/edit/id").
 *
 * Usage:
 * ```tsx
 * await revalidate("/admin/article/edit/id");
 * ```
 */
export async function revalidate(path: string) {
  revalidatePath(path);
}
