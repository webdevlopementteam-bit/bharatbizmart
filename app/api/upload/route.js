import { v2 as cloudinary } from "cloudinary";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function isConfigured() {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

/**
 * Generic authenticated upload endpoint used by logo/cover/product-image/
 * document/gallery/chat-attachment uploads across the app. Files are pushed
 * to Cloudinary (cloud object storage) — never written to local disk, which
 * would not survive a serverless deploy.
 */
export async function POST(request) {
  try {
    await requireUser();

    if (!isConfigured()) {
      throw new ApiError(
        503,
        "File storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment."
      );
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "bharatbizmart/misc";

    if (!file || typeof file === "string") throw new ApiError(400, "No file provided");
    if (!ALLOWED_TYPES.has(file.type)) throw new ApiError(400, "Unsupported file type");
    if (file.size > MAX_FILE_SIZE) throw new ApiError(400, "File exceeds the 8MB limit");

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: file.type === "application/pdf" ? "raw" : "image",
      transformation: file.type.startsWith("image/") ? [{ quality: "auto:good", fetch_format: "auto" }] : undefined,
    });

    return ok({ url: result.secure_url, publicId: result.public_id }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
