import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    schema
      .parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      .then((parsed) => {
        req.body = parsed.body;
        req.query = parsed.query;
        req.params = parsed.params;
        next();
      })
      .catch((error) => {
        if (error instanceof ZodError) {
          const formattedErrors = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));

          res.status(400).json({
            success: false,
            message: "Помилка валідації вхідних даних",
            errors: formattedErrors,
          });
          return;
        }

        next(error);
      });
  };
};
