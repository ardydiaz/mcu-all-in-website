import { AnnouncementModel } from "../models/AnnouncementModel.js";
export const AnnouncementService = { list: () => AnnouncementModel.all() };
