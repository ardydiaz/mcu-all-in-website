import { validateUpload } from "../config/multer.js";
export function uploadMiddleware(request, response, next) {
  const error = validateUpload(request.file);
  if (error) return response.status(400).json({ message: error });
  next();
}
