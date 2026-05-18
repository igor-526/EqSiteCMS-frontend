import { describe, expect, it } from "vitest";
import {
    API_STATUS,
    apiError,
    apiSuccess,
    isApiError,
    isApiSuccess,
} from "./apiStatus";

describe("apiStatus", () => {
    it("isApiSuccess narrows ok results", () => {
        const result = apiSuccess({ id: 1 });
        expect(isApiSuccess(result)).toBe(true);
        if (isApiSuccess(result)) {
            expect(result.data).toEqual({ id: 1 });
        }
    });

    it("isApiError narrows error results", () => {
        const result = apiError("failed");
        expect(isApiError(result)).toBe(true);
        if (isApiError(result)) {
            expect(result.data.detail).toBe("failed");
        }
    });

    it("guards reject the opposite status", () => {
        expect(isApiSuccess(apiError("x"))).toBe(false);
        expect(isApiError(apiSuccess(null))).toBe(false);
        expect(API_STATUS.OK).toBe("ok");
        expect(API_STATUS.ERROR).toBe("error");
    });
});
