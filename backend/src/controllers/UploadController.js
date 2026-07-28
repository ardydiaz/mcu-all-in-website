import { UploadService } from "../services/UploadService.js";
export const UploadController = { store(request, response) { response.status(201).json(UploadService.describe(request.file, request.body.type)); } };
