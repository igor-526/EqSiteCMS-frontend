import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GalleryPhoto } from "./GalleryPhoto";
import type { PhotoOutDto } from "@/types/api/photos";

const photo = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "photo.jpg",
  description: null,
  path: "photos/photo.jpg",
  url: "/photo.jpg",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
} as PhotoOutDto;

describe("GalleryPhoto permissions", () => {
  it("shows remove and invokes it when mutation scope is present", async () => {
    const onDelete = vi.fn();
    render(
      <GalleryPhoto
        photo={photo}
        selected={false}
        onSelect={vi.fn()}
        onDelete={onDelete}
        onEdit={vi.fn()}
        canMutatePhotos
      />,
    );
    await userEvent.click(screen.getByRole("img", { name: "delete" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("hides remove when mutation scope is missing", () => {
    render(
      <GalleryPhoto
        photo={photo}
        selected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        canMutatePhotos={false}
      />,
    );
    expect(screen.queryByRole("img", { name: "delete" })).toBeNull();
  });
});
