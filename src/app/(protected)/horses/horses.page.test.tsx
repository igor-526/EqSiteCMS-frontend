import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HorsesPage from "./page";

vi.mock("@/features/horses/ui/HorsesHeader", () => ({ HorsesHeader: () => <div>authenticated horses header</div> }));
vi.mock("@/features/horses/ui/HorseBreedGroups", () => ({
  HorseBreedGroupsTable: () => <div>authenticated breed groups render</div>,
  HorseBreedGroupsCreateUpdateModal: () => null,
}));
vi.mock("@/features/pageEditor/ui/PageEditorModal", () => ({ PageEditorModal: () => <div>breed group page editor</div> }));
vi.mock("@/features/horses/hooks/useHorsesPage", () => ({
  useHorsesPage: () => ({
    activeTab: "breed-groups", setActiveTab: vi.fn(),
    horseBreedGroups: [], horseBreedGroupsTotal: 0, horseBreedGroupsLoading: false, horseBreedGroupsError: null,
    horseBreedGroupsFilters: { limit: 25, offset: 0, sort: ["-created_at"] }, setHorseBreedGroupsFilters: vi.fn(), resetHorseBreedGroupsFilters: vi.fn(),
    horseBreedGroupsValidationErrors: {}, resetHorseBreedGroupsValidation: vi.fn(), horseBreedGroupModalOpen: false, setHorseBreedGroupModalOpen: vi.fn(),
    horseBreedGroupPageModalOpen: false, setHorseBreedGroupPageModalOpen: vi.fn(), selectedHorseBreedGroup: null,
    handleOpenHorseBreedGroupModal: vi.fn(), handleOpenHorseBreedGroupPageModal: vi.fn(), handleCreateHorseBreedGroup: vi.fn(), handleUpdateHorseBreedGroup: vi.fn(), handleDeleteHorseBreedGroup: vi.fn(),
    canCreateDictionary: true, canUpdateDictionary: true, canDeleteDictionary: true,
    fetchBreedGroupPageData: vi.fn(), saveBreedGroupPageData: vi.fn(),
    horsesFilters: {}, horseBreedsFilters: {}, horseOwnersFilters: {}, horseServicesFilters: {}, horseCoatColorsFilters: {},
    serviceFilterOptions: [], horseBreedsTotal: 0, horseOwnersTotal: 0, horseServicesTotal: 0, horseCoatColorsTotal: 0,
  }),
}));

describe("protected /horses breed groups route", () => {
  it("renders the authenticated group feature through the real page orchestration", () => {
    render(<HorsesPage />);
    expect(screen.getByText("authenticated breed groups render")).toBeInTheDocument();
    expect(screen.getByText("breed group page editor")).toBeInTheDocument();
  });
});
