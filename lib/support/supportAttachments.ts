import { getMediaBaseUrl } from "@/lib/config";
import type { SupportMessageAttachment } from "@/types/support";

function guessAttachmentType(file: File): "image" | "file" {
  return file.type.startsWith("image/") ? "image" : "file";
}

export async function uploadSupportAttachment(
  file: File,
  accessToken: string
): Promise<SupportMessageAttachment> {
  const mediaBase = getMediaBaseUrl().replace(/\/$/, "");

  const createRes = await fetch(`${mediaBase}/media/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      size: file.size,
      metadata: { type: "support-attachment" },
    }),
  });

  if (!createRes.ok) throw new Error("Failed to prepare upload");

  const { mediaId, url, uploadUrl } = await createRes.json();

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!uploadRes.ok) throw new Error("Failed to upload file");

  await fetch(`${mediaBase}/media/${mediaId}/loading-end`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return { url, type: guessAttachmentType(file), name: file.name };
}

export async function uploadSupportAttachments(
  files: File[],
  accessToken: string
): Promise<SupportMessageAttachment[]> {
  const results: SupportMessageAttachment[] = [];
  for (const file of files) {
    results.push(await uploadSupportAttachment(file, accessToken));
  }
  return results;
}
