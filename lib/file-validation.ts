/**
 * Server-Side File Validation
 * Validates files by checking magic bytes, MIME types, and sizes
 */

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/png": [[0x89, 0x50, 0x4E, 0x47]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP starts with RIFF)
};

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".com", ".msi", ".scr", ".pif",
  ".js", ".vbs", ".wsf", ".ps1", ".sh", ".html", ".htm",
  ".php", ".asp", ".aspx", ".jsp", ".svg",
]);

export function validateFileType(buffer: ArrayBuffer, declaredMime: string): {
  valid: boolean;
  detectedMime: string | null;
  error?: string;
} {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4) {
    return { valid: false, detectedMime: null, error: "File is too small to validate." };
  }

  // Check magic bytes
  let detectedMime: string | null = null;
  for (const [mime, patterns] of Object.entries(MAGIC_BYTES)) {
    for (const pattern of patterns) {
      if (pattern.every((byte, idx) => bytes[idx] === byte)) {
        detectedMime = mime;
        break;
      }
    }
    if (detectedMime) break;
  }

  // If magic bytes don't match any known type
  if (!detectedMime) {
    return {
      valid: false,
      detectedMime: null,
      error: "File type could not be verified. Only JPEG, PNG, WebP, and PDF files are allowed.",
    };
  }

  // Verify the detected type is in our allowed list
  if (!ALLOWED_MIME_TYPES.has(detectedMime)) {
    return {
      valid: false,
      detectedMime,
      error: `File type "${detectedMime}" is not allowed.`,
    };
  }

  return { valid: true, detectedMime };
}

export function sanitizeFileName(name: string): string {
  // Remove path traversal sequences
  let clean = name.replace(/\.\.\//g, "").replace(/\.\.\\/g, "");
  // Keep only safe characters
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Remove leading dots (hidden files)
  clean = clean.replace(/^\.+/, "");
  // Ensure non-empty
  if (!clean || clean === "_") clean = "upload";
  return clean;
}

export function validateFileSize(
  size: number,
  maxMb: number
): { valid: boolean; error?: string } {
  const maxBytes = maxMb * 1024 * 1024;
  if (size > maxBytes) {
    return {
      valid: false,
      error: `File exceeds maximum size of ${maxMb}MB (${(size / 1024 / 1024).toFixed(1)}MB uploaded).`,
    };
  }
  if (size === 0) {
    return { valid: false, error: "File is empty." };
  }
  return { valid: true };
}

export function checkDangerousExtension(fileName: string): {
  safe: boolean;
  error?: string;
} {
  const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return {
      safe: false,
      error: `File type "${ext}" is not permitted for security reasons.`,
    };
  }
  return { safe: true };
}
