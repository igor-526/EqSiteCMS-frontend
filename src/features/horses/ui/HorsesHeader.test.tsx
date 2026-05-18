import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorsesHeader } from "./HorsesHeader";
import { HorsesTabsKeys } from "./HorsesTabs";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import type { UUID } from "crypto";

vi.mock("@/contexts/UserContext", () => ({
    useUserContext: () => ({
        user: { username: "admin" },
        loading: false,
        error: null,
        scopes: [KNOWN_USER_SCOPES.ADMIN],
        refreshUser: vi.fn(),
        clearUser: vi.fn(),
    }),
}));

const renderHeader = (breedIds?: string[]) => renderWithCmsProviders(
    <HorsesHeader
        activeTab={HorsesTabsKeys.HORSES}
        setActiveTab={vi.fn()}
        onCreateHorse={vi.fn()}
        horsesTotal={0}
        horsesFilters={{
            limit: 25,
            offset: 0,
            this_stable: true,
            pedigree: 1,
            breed_ids: breedIds as UUID[] | undefined,
            kind: breedIds ? undefined : ["pony"],
        }}
        setHorsesFilters={vi.fn()}
        setHorsesPage={vi.fn()}
        setHorsesLimit={vi.fn()}
        resetHorsesFilters={vi.fn()}
        breedFilterOptions={[{ label: "Арабская", value: "b1" }]}
        breedFilterLoading={false}
        coatColorFilterOptions={[]}
        coatColorFilterLoading={false}
        ownerFilterOptions={[]}
        ownerFilterLoading={false}
        onCreateHorseBreedModal={vi.fn()}
        onCreateHorseOwnerModal={vi.fn()}
        onCreateHorseServiceModal={vi.fn()}
        onCreateHorseCoatColorModal={vi.fn()}
        resetHorseBreedsFilters={vi.fn()}
        resetHorseOwnersFilters={vi.fn()}
        resetHorseServicesFilters={vi.fn()}
        resetHorseCoatColorsFilters={vi.fn()}
        horseBreedsTotal={0}
        horseOwnersTotal={0}
        horseServicesTotal={0}
        horseCoatColorsTotal={0}
        horseBreedsFilters={{ limit: 25, offset: 0, sort: [] }}
        horseOwnersFilters={{ limit: 25, offset: 0, sort: [] }}
        horseServicesFilters={{ limit: 25, offset: 0, sort: [] }}
        horseCoatColorsFilters={{ limit: 25, offset: 0, sort: [] }}
        setHorseBreedsFilters={vi.fn()}
        setHorseOwnersFilters={vi.fn()}
        setHorseServicesFilters={vi.fn()}
        setHorseCoatColorsFilters={vi.fn()}
    />,
);

describe("HorsesHeader", () => {
    it("disables type filter when breed filter is active", () => {
        const { container } = renderHeader(["b1"]);

        const selects = container.querySelectorAll(".ant-select");
        expect(selects[4]).toHaveClass("ant-select-disabled");
    });

    it("keeps type filter enabled when breed filter is empty", () => {
        const { container } = renderHeader();

        const selects = container.querySelectorAll(".ant-select");
        expect(selects[4]).not.toHaveClass("ant-select-disabled");
    });
});
