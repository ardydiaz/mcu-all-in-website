export const validate = (validator) => (request, response, next) => {
  const errors = validator(request.body);
  if (errors.length) return response.status(422).json({ message: "Validation failed.", errors });
  next();
};
