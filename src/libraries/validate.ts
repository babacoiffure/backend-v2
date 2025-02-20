// middlewares/validate.ts

import { z } from "zod";
import { handleAsyncHttp } from "../middleware/controller";

export const validate = (
    schema: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>
) =>
    handleAsyncHttp(async (req, res, resFn, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            let err = error;
            if (err instanceof z.ZodError) {
                err = err.issues.map((e) => ({
                    path: e.path[0],
                    message: e.message,
                }));
            }
            console.log(err);
            return res.error("Validation failed");
        }
    });
