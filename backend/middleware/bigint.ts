import express from 'express'

export const bigintMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const originalJson = res.json
  res.json = function (data: any) {
    return originalJson.call(
      this,
      JSON.parse(
        JSON.stringify(data, (key, value) => {
          if (typeof value === 'bigint') {
            return value.toString()
          }
          return value
        }),
      ),
    )
  }
  next()
}
