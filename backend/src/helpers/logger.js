export const logger = {
  info: (...values) => console.log(new Date().toISOString(), "INFO", ...values),
  error: (...values) => console.error(new Date().toISOString(), "ERROR", ...values),
};
