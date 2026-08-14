import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-errors";
import { createSignedUploadParams } from "@/lib/cloudinary";

export async function POST() {
  const { response } = await requireSession();
  if (response) return response;

  try {
    const params = createSignedUploadParams();
    return NextResponse.json(params);
  } catch (error) {
    return handleApiError(error);
  }
}
