import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorseServiceRelationsDrawer } from "./HorseServiceRelationsDrawer";
import type { HorseServiceRelationOutDto } from "@/types/api/horseServiceRelations";
import { PriceFormatter } from "@/types/api/prices";
import type { UUID } from "crypto";

const relation: HorseServiceRelationOutDto = {
    id: "00000000-0000-4000-8000-000000000001" as UUID,
    horse_id: "00000000-0000-4000-8000-000000000002" as UUID,
    service_id: "00000000-0000-4000-8000-000000000003" as UUID,
    name: "Ковка",
    slug: "horseshoeing",
    description: null,
    price: 5000,
    price_formatter: PriceFormatter.equal,
};

const renderDrawer = (
    overrides: Partial<React.ComponentProps<typeof HorseServiceRelationsDrawer>> = {},
) => renderWithCmsProviders(
    <HorseServiceRelationsDrawer
        open
        onClose={vi.fn()}
        horseName="Буцефал"
        relations={[]}
        loading={false}
        onAdd={vi.fn()}
        onRowClick={vi.fn()}
        {...overrides}
    />,
);

describe("HorseServiceRelationsDrawer", () => {
    it("renders drawer title with horse name", () => {
        renderDrawer();
        expect(screen.getByText("Услуги: Буцефал")).toBeInTheDocument();
    });

    it("shows empty state with add button when no relations", () => {
        renderDrawer({ relations: [] });
        expect(screen.getByText("Нет привязанных услуг")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Добавить услугу/ })).toBeInTheDocument();
    });

    it("hides add button in empty state without canMutate", () => {
        renderDrawer({ relations: [], canMutate: false });
        expect(screen.getByText("Нет привязанных услуг")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Добавить услугу/ })).not.toBeInTheDocument();
    });

    it("renders table with relations", () => {
        renderDrawer({ relations: [relation] });
        expect(screen.getByText("Ковка")).toBeInTheDocument();
        expect(screen.getByText("5000 ₽")).toBeInTheDocument();
    });

    it("calls onAdd when add button clicked in header", async () => {
        const onAdd = vi.fn();
        renderDrawer({ relations: [relation], onAdd });
        const addButtons = screen.getAllByRole("button", { name: /Добавить/ });
        await userEvent.click(addButtons[0]);
        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it("calls onRowClick when table row clicked", async () => {
        const onRowClick = vi.fn();
        renderDrawer({ relations: [relation], onRowClick });
        await userEvent.click(screen.getByText("Ковка"));
        expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({
            id: relation.id,
            name: relation.name,
        }));
    });

    it("does not make rows clickable without canMutate", async () => {
        const onRowClick = vi.fn();
        renderDrawer({ relations: [relation], onRowClick, canMutate: false });
        await userEvent.click(screen.getByText("Ковка"));
        expect(onRowClick).not.toHaveBeenCalled();
    });
});
