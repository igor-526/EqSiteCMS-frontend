import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GlobalError from "./global-error";

const { captureException } = vi.hoisted(() => ({ captureException: vi.fn() }));

vi.mock("@sentry/nextjs", () => ({ captureException }));

describe("GlobalError", () => {
  it("captures one event, renders a fallback and retries", () => {
    const error = new Error("controlled failure");
    const reset = vi.fn();
    const { rerender } = render(<GlobalError error={error} reset={reset} />);

    expect(screen.getByRole("heading", { name: "Что-то пошло не так" })).toBeInTheDocument();
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(error);

    rerender(<GlobalError error={error} reset={reset} />);
    expect(captureException).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
