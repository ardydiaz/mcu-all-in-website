async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    const error = new Error("Authentication required.");
    error.status = 401;
    throw error;
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : null;
    const error = new Error(payload?.message || "The request could not be completed.");
    error.status = response.status;
    error.errors = payload?.errors || [];
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export const adminApi = {
  logout: () => request("/api/logout", { method: "POST" }),
  getCurrentUser: () => request("/api/me"),
  getUsers: () => request("/api/users"),
  getRoles: () => request("/api/roles"),
  updateUserRole: (id, roleId) => request(`/api/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ roleId }) }),
  getCategories: () => request("/api/categories"),
  createCategory: (category) => request("/api/categories", { method: "POST", body: JSON.stringify(category) }),
  deleteCategory: (id) => request(`/api/categories/${id}`, { method: "DELETE" }),
  getCategoryGroups: () => request("/api/category-groups"),
  createCategoryGroup: (group) => request("/api/category-groups", { method: "POST", body: JSON.stringify(group) }),
  deleteCategoryGroup: (id) => request(`/api/category-groups/${id}`, { method: "DELETE" }),
  getAnalytics: () => request("/api/analytics"),
  getDashboard: () => request("/api/dashboard"),
  getServices: () => request("/api/services"),
  createService: (service) => request("/api/services", { method: "POST", body: JSON.stringify(service) }),
  updateService: (id, service) => request(`/api/services/${id}`, { method: "PUT", body: JSON.stringify(service) }),
  updateStatus: (id, status) => request(`/api/services/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteService: (id) => request(`/api/services/${id}`, { method: "DELETE" }),
  getAnnouncements: () => request("/api/announcements"),
  createAnnouncement: (announcement) => request("/api/announcements", { method: "POST", body: JSON.stringify(announcement) }),
  deleteAnnouncement: (id) => request(`/api/announcements/${id}`, { method: "DELETE" }),
};
