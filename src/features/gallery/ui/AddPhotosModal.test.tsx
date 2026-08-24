import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UploadFile } from "antd";
import { describe, expect, it, vi } from "vitest";
import { AddPhotosModal } from "./AddPhotosModal";

const files: UploadFile[] = [
  { uid: "temp-uploading", name: "uploading.jpg", status: "uploading" },
  {
    uid: "00000000-0000-4000-8000-000000000001",
    name: "done.jpg",
    status: "done",
  },
  { uid: "temp-error", name: "error.jpg", status: "error" },
];

describe("AddPhotosModal", () => {
  it("does not render its dialog when closed", () => {
    render(
      <AddPhotosModal
        open={false}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        uploadPhotosList={[]}
      />,
    );
    expect(
      screen.queryByRole("dialog", { name: "Добавить фотографии" }),
    ).not.toBeInTheDocument();
  });

  it("renders uploading, done and error items", () => {
    render(
      <AddPhotosModal
        open
        onClose={vi.fn()}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        uploadPhotosList={files}
      />,
    );
    expect(screen.getByText("uploading.jpg")).toBeInTheDocument();
    expect(screen.getByText("done.jpg")).toBeInTheDocument();
    expect(screen.getByText("error.jpg")).toBeInTheDocument();
  });

  it("passes a selected file to the upload callback without browser upload", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(
      <AddPhotosModal
        open
        onClose={vi.fn()}
        onAdd={onAdd}
        onRemove={vi.fn()}
        uploadPhotosList={[]}
      />,
    );
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    const file = new File(["image"], "selected.jpg", { type: "image/jpeg" });

    await user.upload(input!, file);

    expect(onAdd).toHaveBeenCalledWith(file);
  });

  it("calls remove with the selected upload item", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <AddPhotosModal
        open
        onClose={vi.fn()}
        onAdd={vi.fn()}
        onRemove={onRemove}
        uploadPhotosList={[files[2]]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "delete" }));

    expect(onRemove).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "temp-error" }),
    );
  });

  it("closes from cancel and done controls", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <AddPhotosModal
        open
        onClose={onClose}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        uploadPhotosList={[]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Готово/ }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
