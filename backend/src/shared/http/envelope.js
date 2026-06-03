export function sendSuccess(res, data = {}, message = 'Operation successful', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res,
  statusCode,
  message,
  code = 'APP_ERROR',
  errors = [],
) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Error-Code', code);
  return res.status(statusCode).json({
    success: false,
    message,
    data: {
      code,
      errors,
    },
  });
}
