import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const EXTENSION_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg", // non-standard, but some browsers/OS cameras send this instead of image/jpeg
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

// Files are saved straight onto this server's disk, under public/, so
// Next.js serves them back at /uploads/... with no separate route needed —
// only the file's path is stored in MongoDB, never the file's bytes.
// Note: this assumes a single persistent server process (the app's actual
// deployment). A serverless/multi-instance/container-redeploy setup would
// need shared object storage instead, since each instance's local disk is
// independent and typically wiped on redeploy.
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

// The client picks a folder name (e.g. "products", "logos") purely for
// organizing files — never trust it as a literal filesystem path, or a
// crafted value like "../../../etc" could write outside the uploads dir.
function sanitizeFolder(input) {
  const segments = String(input || "misc")
    .split("/")
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter(Boolean);
  return segments.length ? segments.slice(0, 3).join("/") : "misc";
}

/**
 * Generic authenticated upload endpoint used by logo/cover/product-image/
 * document/gallery/chat-attachment uploads across the app. Next.js's App
 * Router already parses multipart form data natively via request.formData()
 * (the Web Fetch API) — no separate multer middleware is needed to get the
 * same "upload straight to this server, then save the path" behavior.
 */
export async function POST(request) {
  try {
    await requireUser();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = sanitizeFolder(formData.get("folder"));

    if (!file || typeof file === "string") throw new ApiError(400, "No file provided");
    const extension = EXTENSION_BY_TYPE[file.type];
    if (!extension) throw new ApiError(400, `Unsupported file type: "${file.type || "unknown"}". Allowed: JPG, PNG, WEBP, GIF, PDF.`);
    if (file.size > MAX_FILE_SIZE) throw new ApiError(400, "File exceeds the 8MB limit");

    const dir = path.join(UPLOAD_ROOT, folder);
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), buffer);
    } catch (fsErr) {
      console.error("[upload] failed to write file to disk:", fsErr);
      throw new ApiError(500, "Could not save the file on the server (storage is not writable). Check that public/uploads is writable by the app process.");
    }

    return ok({ url: `/uploads/${folder}/${filename}` }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
