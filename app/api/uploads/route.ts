import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage, UploadValidationError } from "@/lib/storage/upload";

const ADMIN_ONLY_FOLDERS = new Set(["products", "team", "banners"]);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
  }
  if (!["products", "sell-requests", "team", "banners"].includes(folder)) {
    return NextResponse.json({ success: false, error: "Invalid upload target." }, { status: 400 });
  }

  if (ADMIN_ONLY_FOLDERS.has(folder)) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }
  }

  try {
    const url = await uploadImage(file, folder as "products" | "sell-requests" | "team" | "banners");
    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Upload failed." }, { status: 500 });
  }
}
