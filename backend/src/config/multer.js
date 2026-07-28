export const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
};

export function validateUpload(file) {
  if (!file) return "A file is required.";
  if (file.size > uploadConfig.maxFileSize) return "File exceeds the 5 MB limit.";
  if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) return "Unsupported file type.";
  return null;
}
