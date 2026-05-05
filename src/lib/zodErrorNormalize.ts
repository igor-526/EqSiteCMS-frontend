import { ZodError } from "zod";

export const zodErrorNormalize = (error: ZodError) => {
    const errorsForm: Record<string, string[]> = {};
    error.issues.forEach((err) => {
        if (!errorsForm[err.path.join(".")]) {
            errorsForm[err.path.join(".")] = [];
        }
        errorsForm[err.path.join(".")].push(err.message);
    });
    return errorsForm;
};