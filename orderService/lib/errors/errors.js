module.exports = {
  DB_ERROR: {
    message: 'error processing order',
    status: 500,
    internalCode: 1,
  },
  ORDER_NOT_FOUND: {
    message: 'order not found',
    status: 404,
    internalCode: 2,
  },
  INVALID_ORDER_ID: {
    message: 'invalid order id',
    status: 400,
    internalCode: 3,
  },
  INVALID_ORDER: {
    message: 'invalid order',
    status: 400,
    internalCode: 4,
  },
  INVALID_JWT: {
    message: 'the provided jwt is invalid',
    status: 400,
    internalCode: 5,
  },
  PROVIDER_ERROR: {
    message: 'error communicating with restaurant',
    status: 500,
    internalCode: 6,
  },
};