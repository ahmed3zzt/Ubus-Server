export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;
    const status = res.statusCode;
    // eslint-disable-next-line no-console
    console.log(`${method} ${originalUrl} -> ${status} ${ms.toFixed(1)}ms`);
  });

  next();
}


