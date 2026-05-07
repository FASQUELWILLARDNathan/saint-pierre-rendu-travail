import express from 'express'

// Middleware Express qui convertit automatiquement les valeurs BigInt en chaînes de caractères avant l'envoi de la réponse JSON.
// Cela évite l'erreur "Do not know how to serialize a BigInt" de JSON.stringify.
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
