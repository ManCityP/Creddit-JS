import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_FILE_MIME_TYPES = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "text/plain",
    "text/csv",
]);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `post-${crypto.randomUUID()}${ext}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const isMedia =
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/") ||
        file.mimetype.startsWith("audio/");
    const isAllowedDoc = ALLOWED_FILE_MIME_TYPES.has(file.mimetype);

    if (isMedia || isAllowedDoc) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type"), false);
    }
};

const Upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

export default Upload;