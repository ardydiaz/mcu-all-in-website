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
    throw new Error(payload?.message || "The request could not be completed.");
  }

  if (response.status === 204) return null;
  return response.json();
}

export const adminApi = {
  login: (credentials) => request("/api/login", { method: "POST", body: JSON.stringify(credentials) }),
  logout: () => request("/api/logout", { method: "POST" }),
  getServices: () => request("/api/services"),
  createService: (service) => request("/api/services", { method: "POST", body: JSON.stringify(service) }),
  updateService: (id, service) => request(`/api/services/${id}`, { method: "PUT", body: JSON.stringify(service) }),
  updateStatus: (id, status) => request(`/api/services/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteService: (id) => request(`/api/services/${id}`, { method: "DELETE" }),
};
