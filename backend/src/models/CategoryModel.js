import { readCollection, writeCollection } from "../config/database.js";

const defaults = ["University", "Students", "Academics", "Healthcare", "Corporate", "Community"]
  .map((name, index) => ({ id: `category-${index + 1}`, name, status: "active" }));

export const CategoryModel = {
  all: () => readCollection("categories", defaults),
  saveAll: (items) => writeCollection("categories", items),
};
