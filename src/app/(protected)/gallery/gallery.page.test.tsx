import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import BaseLayout from "../layout";
import GalleryPage from "./page";

const state = vi.hoisted(() => ({
  user: { username: "admin" } as null | { username: string },
  scopes: ["ADMIN"],
  canMutate: true,
}));
const routerPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  usePathname: () => "/gallery",
}));

vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({
    user: state.user,
    loading: false,
    error: null,
    scopes: state.scopes,
    clearUser: vi.fn(),
  }),
}));

vi.mock("@/ui/Sidebar/Sidebar", () => ({ Sidebar: () => <nav>Sidebar</nav> }));
vi.mock("@/api/auth", () => ({ authApiLogout: vi.fn() }));

vi.mock("@/features/gallery/hooks/useGallery", () => ({
  useGallery: () => ({
    loadPhotos: vi.fn(),
    loadMorePhotos: vi.fn(),
    photosList: [],
    photosLoading: false,
    photosTotal: 0,
    photosFilters: { limit: 50, offset: 0 },
    resetFilters: vi.fn(),
    setNewFilters: vi.fn(),
    deletePhoto: vi.fn(),
    deletePhotoBatch: vi.fn(),
    uploadPhotosList: [],
    uploadPhotos: vi.fn(),
    removeUploadedPhoto: vi.fn(),
    resetPhotosUploadList: vi.fn(),
    pricesFilterOptions: [],
    setPricesFilterSearchValue: vi.fn(),
    pricesFilterLoading: false,
    pricesFilterValues: [],
    setPricesFilterValues: vi.fn(),
    horsesFilterOptions: [],
    setHorsesFilterSearchValue: vi.fn(),
    horsesFilterLoading: false,
    horsesFilterValues: [],
    setHorsesFilterValues: vi.fn(),
    selectedPhotosBatch: [],
    setSelectedPhotosBatch: vi.fn(),
    selectedPhoto: null,
    setSelectedPhoto: vi.fn(),
    handleSelectAllAction: vi.fn(),
    canMutatePhotos: state.canMutate,
  }),
}));

vi.mock("@/features/gallery/hooks/useGalleryPageUi", () => ({
  useGalleryPageUi: () => ({
    handleEditPhotosModalClose: vi.fn(),
    handleSetHorsesBatchModalClose: vi.fn(),
    handleSetPricesBatchModalClose: vi.fn(),
    handleDeletePhotosBatchModalClose: vi.fn(),
    handleDeletePhotosModalClose: vi.fn(),
    handleSelectPhoto: vi.fn(),
  }),
}));

vi.mock("@/features/gallery/ui/GalleryFilters", () => ({
  GalleryFilters: ({
    onOpenAddPhotosModal,
    canMutatePhotos,
  }: {
    onOpenAddPhotosModal: () => void;
    canMutatePhotos: boolean;
  }) => (
    <button disabled={!canMutatePhotos} onClick={onOpenAddPhotosModal}>
      Добавить
    </button>
  ),
}));
vi.mock("@/features/gallery/ui/AddPhotosModal", () => ({
  AddPhotosModal: ({ open }: { open: boolean }) =>
    open ? <div role="dialog">Добавить фотографии</div> : null,
}));
vi.mock("@/features/gallery/ui/PhotosList", () => ({ PhotosList: () => null }));
vi.mock("@/features/gallery/ui/ChangePhotoModal", () => ({ ChangePhotoModal: () => null }));
vi.mock("@/features/gallery/ui/SetHorsesBatchPhotosModal", () => ({ SetHorsesBatchPhotosModal: () => null }));
vi.mock("@/features/gallery/ui/SetPricesBatchPhotosModal.ts", () => ({ SetPricesBatchPhotosModal: () => null }));
vi.mock("@/features/gallery/ui/DeletePhotoBatchModal", () => ({ DeletePhotoBatchModal: () => null }));
vi.mock("@/features/gallery/ui/DeletePhotoModal", () => ({ DeletePhotoModal: () => null }));

describe("protected gallery page", () => {
  beforeEach(() => {
    state.user = { username: "admin" };
    state.scopes = ["ADMIN"];
    state.canMutate = true;
    routerPush.mockClear();
  });

  it("blocks anonymous gallery content and redirects to login", async () => {
    state.user = null;
    renderWithCmsProviders(
      <BaseLayout>
        <GalleryPage />
      </BaseLayout>,
    );
    expect(screen.queryByRole("button", { name: "Добавить" })).toBeNull();
    await vi.waitFor(() => expect(routerPush).toHaveBeenCalledWith("/login"));
  });

  it("allows a permitted authenticated user to open upload", async () => {
    const user = userEvent.setup();
    render(<GalleryPage />);
    const add = screen.getByRole("button", { name: "Добавить" });
    expect(add).toBeEnabled();
    await user.click(add);
    expect(screen.getByRole("dialog")).toHaveTextContent("Добавить фотографии");
  });

  it("disables upload without a mutation scope", () => {
    state.canMutate = false;
    render(<GalleryPage />);
    expect(screen.getByRole("button", { name: "Добавить" })).toBeDisabled();
  });
});
