class OrderError extends Error {
  constructor(err) {
    super(err.message);
    Error.captureStackTrace(this, this.constructor);
    this.status = err.status;
    this.internalCode = err.internalCode;
    Object.defineProperty(this, 'message', { configurable: true, enumerable: true });
  }
}

module.exports = OrderError;