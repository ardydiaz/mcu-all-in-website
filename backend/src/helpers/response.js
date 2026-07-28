export const success = (response, data, message = "Request successful.", status = 200) =>
  response.status(status).json({ success: true, message, data });

export const failure = (response, message, status = 400, errors) =>
  response.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
