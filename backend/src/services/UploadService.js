import { createUploadName } from "../helpers/upload.js";
export const UploadService = {
  describe(file, type = "systems") {
    return { filename: createUploadName(file?.originalname), type, originalName: file?.originalname, size: file?.size };
  },
};
