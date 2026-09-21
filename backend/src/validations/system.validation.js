import { isNonEmpty, isUrl } from "../utils/validator.js";
import { SYSTEM_LINK_ICONS } from "../utils/constants.js";

const categoriesOf = (body) => (Array.isArray(body.categories) ? body.categories : body.category ? [body.category] : []).filter(Boolean);

function linkErrors(body) {
  if (body.links === undefined || body.links === null) return [];
  if (!Array.isArray(body.links)) return [{ field: "links", message: "Quick links must be a list." }];
  for (const [index, link] of body.links.entries()) {
    if (!isNonEmpty(link?.label)) return [{ field: "links", message: `Link ${index + 1} needs a label.` }];
    if (!isNonEmpty(link?.url) || !isUrl(link.url)) return [{ field: "links", message: `Link ${index + 1} needs a valid URL (starting with http:// or https://).` }];
    if (!SYSTEM_LINK_ICONS.includes(link?.icon)) return [{ field: "links", message: `Link ${index + 1} has an unrecognized icon.` }];
  }
  return [];
}

export const systemValidation = (body) => [
  ...(!isNonEmpty(body.title) ? [{ field: "title", message: "Service name is required." }] : []),
  ...(!categoriesOf(body).length ? [{ field: "categories", message: "Select at least one category." }] : []),
  ...(!isNonEmpty(body.description) ? [{ field: "description", message: "Description is required." }] : []),
  ...(!isNonEmpty(body.url) ? [{ field: "url", message: "Website URL is required." }] : []),
  ...(isNonEmpty(body.url) && !isUrl(body.url) ? [{ field: "url", message: "URL must start with http:// or https://." }] : []),
  ...linkErrors(body),
];
