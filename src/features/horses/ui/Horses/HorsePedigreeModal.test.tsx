import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorsePedigreeModal } from "./HorsePedigreeModal";

describe("HorsePedigreeModal", () => {
    it("renders modal with title 'Родословная' when open", () => {
        renderWithCmsProviders(
            <HorsePedigreeModal open={true} onClose={vi.fn()} />,
        );
        expect(screen.getByText("Родословная")).toBeInTheDocument();
        expect(screen.getByText("Функционал в разработке")).toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", async () => {
        const onClose = vi.fn();
        renderWithCmsProviders(
            <HorsePedigreeModal open={true} onClose={onClose} />,
        );
        const closeBtn = screen.getByRole("button", { name: /закрыть/i });
        await userEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalledOnce();
    });

    it("does not render modal content when closed", () => {
        renderWithCmsProviders(
            <HorsePedigreeModal open={false} onClose={vi.fn()} />,
        );
        expect(screen.queryByText("Функционал в разработке")).not.toBeInTheDocument();
    });
});
