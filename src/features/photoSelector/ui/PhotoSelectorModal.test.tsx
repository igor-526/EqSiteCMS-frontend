import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { PhotoSelectorModal } from "./PhotoSelectorModal";
import type { PhotoOutShortDto } from "@/types/api/photos";
import type { UUID } from "crypto";

const photoA: PhotoOutShortDto = {
  id: "00000000-0000-4000-8000-000000000001" as UUID,
  url: "http://example.test/a.jpg",
  is_main: false,
};

const photoB: PhotoOutShortDto = {
  id: "00000000-0000-4000-8000-000000000002" as UUID,
  url: "http://example.test/b.jpg",
  is_main: false,
};

const renderModal = (
  props: Partial<React.ComponentProps<typeof PhotoSelectorModal>> = {},
) => {
  const onUpdate = props.onUpdate ?? vi.fn();
  renderWithCmsProviders(
    <PhotoSelectorModal
      open
      onClose={vi.fn()}
      selectedPhotos={[photoA]}
      allPhotos={[photoB]}
      allPhotosLoading={false}
      allPhotosTotal={1}
      onUpdate={onUpdate}
      onLoadMorePhotos={vi.fn()}
      {...props}
    />,
  );
  return { onUpdate };
};

describe("PhotoSelectorModal", () => {
  it("adds an unselected photo with the complete photo_ids list", async () => {
    const { onUpdate } = renderModal();
    const addIcon = document.querySelector(".anticon-plus");
    expect(addIcon).toBeInTheDocument();

    await userEvent.click(addIcon as Element);

    expect(onUpdate).toHaveBeenCalledWith({
      photo_ids: [photoA.id, photoB.id],
    });
  });

  it("sets main photo with photo_ids and main id for endpoints that support main photos", async () => {
    const { onUpdate } = renderModal({
      selectedPhotos: [photoA, photoB],
      allPhotos: [],
    });
    const starIcon = document.querySelector(".anticon-star");
    expect(starIcon).toBeInTheDocument();

    await userEvent.click(starIcon as Element);

    expect(onUpdate).toHaveBeenCalledWith({
      photo_ids: [photoA.id, photoB.id],
      main: photoA.id,
    });
  });

  it("hides main photo action when the entity contract does not support it", () => {
    renderModal({ supportsMainPhoto: false });

    expect(document.querySelector(".anticon-star")).not.toBeInTheDocument();
  });

  it("does not expose photo id as image alt text", () => {
    renderModal();

    expect(screen.getAllByAltText("Фотография")).toHaveLength(2);
    expect(screen.queryByAltText(photoA.id)).not.toBeInTheDocument();
  });
});
