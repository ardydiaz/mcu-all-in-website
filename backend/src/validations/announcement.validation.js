import { isNonEmpty, isUrl } from "../utils/validator.js";

export const announcementValidation = (body) => [
  ...(!isNonEmpty(body.title) ? [{ field: "title", message: "Announcement title is required." }] : []),
  ...(!isNonEmpty(body.content) ? [{ field: "content", message: "Announcement content is required." }] : []),
  ...(body.linkUrl && !isUrl(body.linkUrl) ? [{ field: "linkUrl", message: "Link URL must start with http:// or https://." }] : []),
  ...(body.startsAt && body.endsAt && new Date(body.endsAt) < new Date(body.startsAt) ? [{ field: "endsAt", message: "End date must be after the start date." }] : []),
];
