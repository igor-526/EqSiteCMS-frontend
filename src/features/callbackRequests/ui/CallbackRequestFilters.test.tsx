import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { renderWithCmsProviders } from "@/test/render";
import { CallbackRequestRegexFilter } from "./CallbackRequestFilters";

describe("CallbackRequestFilters", () => {
  it("uses user-facing labels without regex and preserves debounce semantics", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onChange = vi.fn();
    renderWithCmsProviders(<CallbackRequestRegexFilter field="name" label="Имя" onChange={onChange} />);
    onChange.mockClear();
    expect(screen.queryByText(/regex/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Имя"), { target: { value: "Анна" } });
    expect(onChange).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(onChange).toHaveBeenCalledWith({ name: "Анна" });
    vi.useRealTimers();
  });

  it("rejects letters in the phone column search", () => {
    renderWithCmsProviders(<CallbackRequestRegexFilter field="phone" label="Телефон" onChange={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Телефон"), { target: { value: "abc" } });
    expect(screen.getByLabelText("Телефон")).toHaveValue("");
  });
});
