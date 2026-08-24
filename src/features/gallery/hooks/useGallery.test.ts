import { act, renderHook, waitFor } from "@testing-library/react";
import type { UploadFile } from "antd";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGallery } from "./useGallery";
import type { PhotoListQueryParams } from "@/types/api/photos";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  batchDelete: vi.fn(),
  priceList: vi.fn(),
  notification: { error: vi.fn() },
  permitted: true,
}));

vi.mock("../services/galleryService", () => ({
  fetchCreatePhoto: mocks.create,
  fetchDeletePhoto: mocks.delete,
  fetchListPhotos: mocks.list,
  fetchBatchDeletePhotos: mocks.batchDelete,
}));

vi.mock("@/features/prices/services/priceService", () => ({
  fetchPriceList: mocks.priceList,
}));

vi.mock("@/hooks/useNotification", () => ({
  useNotification: () => mocks.notification,
}));

vi.mock("./useGalleryScopes", () => ({
  GALLERY_ACTIONS: { UPLOAD: "upload", REMOVE: "remove" },
  useGalleryScopes: () => ({ hasPermission: () => mocks.permitted }),
}));

const photoId = "00000000-0000-4000-8000-000000000001";

function uploadFile(uid: string, status: UploadFile["status"]): UploadFile {
  return { uid, name: "photo.jpg", status };
}

async function renderGallery() {
  const hook = renderHook(() => useGallery());
  await waitFor(() => expect(mocks.list).toHaveBeenCalled());
  return hook;
}

async function uploadWithResult(
  hook: Awaited<ReturnType<typeof renderGallery>>,
  response: unknown,
  name = "photo.jpg",
) {
  mocks.create.mockResolvedValueOnce(response);
  await act(async () => {
    await hook.result.current.uploadPhotos(
      new File(["image"], name, { type: "image/jpeg" }),
    );
  });
}

describe("useGallery upload removal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.permitted = true;
    mocks.list.mockResolvedValue({
      status: "ok",
      data: { items: [], total: 0 },
    });
    mocks.priceList.mockResolvedValue({
      status: "ok",
      data: { items: [], total: 0 },
    });
  });

  it("removes a failed temporary upload locally without DELETE", async () => {
    const hook = await renderGallery();
    await uploadWithResult(hook, {
      status: "error",
      data: { detail: "Validation failed" },
    });
    const failed = hook.result.current.uploadPhotosList[0];

    await act(async () => hook.result.current.removeUploadedPhoto(failed));

    expect(hook.result.current.uploadPhotosList).toEqual([]);
    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it("removes an uploading temporary item locally without DELETE", async () => {
    const hook = await renderGallery();
    const pending = new Promise(() => {});
    mocks.create.mockReturnValueOnce(pending);
    act(() => {
      void hook.result.current.uploadPhotos(
        new File(["image"], "pending.jpg", { type: "image/jpeg" }),
      );
    });
    await waitFor(() =>
      expect(hook.result.current.uploadPhotosList[0]?.status).toBe("uploading"),
    );

    await act(async () =>
      hook.result.current.removeUploadedPhoto(
        hook.result.current.uploadPhotosList[0],
      ),
    );

    expect(hook.result.current.uploadPhotosList).toEqual([]);
    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it.each(["temp-123", "not-a-uuid", "00000000-0000-0000-0000-000000000000"])(
    "does not send malformed done uid %s to DELETE",
    async (uid) => {
      const hook = await renderGallery();
      await act(async () =>
        hook.result.current.removeUploadedPhoto(uploadFile(uid, "done")),
      );
      expect(mocks.delete).not.toHaveBeenCalled();
    },
  );

  it("passes a long filename unchanged and accepts a successful upload", async () => {
    const hook = await renderGallery();
    const longName = `${"ф".repeat(100)}.jpg`;
    await uploadWithResult(
      hook,
      {
        status: "ok",
        data: { id: photoId, url: "/photos/bounded.jpg" },
      },
      longName,
    );

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: longName }),
    );
    expect(hook.result.current.uploadPhotosList[0]).toMatchObject({
      uid: photoId,
      status: "done",
      percent: 100,
    });
  });

  it("deletes a done server item exactly once and removes it after success", async () => {
    const hook = await renderGallery();
    await uploadWithResult(hook, {
      status: "ok",
      data: { id: photoId, url: "/photos/photo.jpg" },
    });
    mocks.delete.mockResolvedValueOnce({ status: "ok", data: null });

    await act(async () =>
      hook.result.current.removeUploadedPhoto(
        hook.result.current.uploadPhotosList[0],
      ),
    );

    expect(mocks.delete).toHaveBeenCalledTimes(1);
    expect(mocks.delete).toHaveBeenCalledWith(photoId);
    expect(hook.result.current.uploadPhotosList).toEqual([]);
  });

  it.each([
    ["401", "Пользователь не авторизован"],
    ["403", "Недостаточно прав"],
    ["network", "Ошибка сети"],
  ])("retains a server item after %s DELETE error", async (_case, detail) => {
    const hook = await renderGallery();
    await uploadWithResult(hook, {
      status: "ok",
      data: { id: photoId, url: "/photos/photo.jpg" },
    });
    mocks.delete.mockResolvedValueOnce({
      status: "error",
      data: { detail },
    });

    await act(async () =>
      hook.result.current.removeUploadedPhoto(
        hook.result.current.uploadPhotosList[0],
      ),
    );

    expect(hook.result.current.uploadPhotosList).toHaveLength(1);
    expect(mocks.notification.error).toHaveBeenCalledWith({
      title: "Ошибка",
      description: detail,
    });
  });

  it("guards a server item against concurrent duplicate DELETE", async () => {
    const hook = await renderGallery();
    await uploadWithResult(hook, {
      status: "ok",
      data: { id: photoId, url: "/photos/photo.jpg" },
    });
    let resolveDelete!: (value: unknown) => void;
    mocks.delete.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDelete = resolve;
      }),
    );
    const item = hook.result.current.uploadPhotosList[0];

    let first!: Promise<void>;
    await act(async () => {
      first = hook.result.current.removeUploadedPhoto(item);
      await hook.result.current.removeUploadedPhoto(item);
    });
    expect(mocks.delete).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveDelete({ status: "ok", data: null });
      await first;
    });
    expect(hook.result.current.uploadPhotosList).toEqual([]);
  });

  it("guards upload and server removal when mutation scope is missing", async () => {
    mocks.permitted = false;
    const hook = await renderGallery();

    await act(async () => {
      await hook.result.current.uploadPhotos(
        new File(["image"], "forbidden.jpg", { type: "image/jpeg" }),
      );
      await hook.result.current.removeUploadedPhoto(uploadFile(photoId, "done"));
    });

    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.delete).not.toHaveBeenCalled();
    expect(mocks.notification.error).toHaveBeenCalledTimes(2);
  });
});

describe("useGallery pagination regression", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.permitted = true;
    mocks.priceList.mockResolvedValue({
      status: "ok",
      data: { items: [], total: 0 },
    });
  });

  it("loads initially with limit/offset and load-more uses current item count", async () => {
    mocks.list
      .mockResolvedValueOnce({
        status: "ok",
        data: { items: [{ id: photoId, name: "one", url: "/one" }], total: 3 },
      })
      .mockResolvedValueOnce({
        status: "ok",
        data: {
          items: [
            {
              id: "00000000-0000-4000-8000-000000000002",
              name: "two",
              url: "/two",
            },
          ],
          total: 3,
        },
      });
    const hook = await renderGallery();
    await waitFor(() => expect(hook.result.current.photosList).toHaveLength(1));
    expect(mocks.list).toHaveBeenNthCalledWith(1, { limit: 50, offset: 0 });

    await act(async () => hook.result.current.loadMorePhotos());

    expect(mocks.list).toHaveBeenLastCalledWith({ limit: 50, offset: 1 });
    expect(hook.result.current.photosList).toHaveLength(2);
  });

  it.each([
    [{ name: "horse" }, { name: "horse", limit: 50, offset: 0 }],
    [{ sort: ["-name"] }, { sort: ["-name"], limit: 50, offset: 0 }],
    [{ name: undefined }, { limit: 50, offset: 0 }],
  ])("resets offset when filters/search/sort change", async (filter, expected) => {
    mocks.list.mockResolvedValue({
      status: "ok",
      data: { items: [], total: 0 },
    });
    const hook = await renderGallery();

    act(() =>
      hook.result.current.setNewFilters(
        filter as Partial<PhotoListQueryParams>,
      ),
    );
    await waitFor(() => expect(mocks.list).toHaveBeenCalledWith(expected));
  });

  it("keeps upload items unique and removes only the successful target", async () => {
    mocks.list.mockResolvedValue({
      status: "ok",
      data: { items: [], total: 0 },
    });
    mocks.create
      .mockResolvedValueOnce({ status: "ok", data: { id: photoId, url: "/one" } })
      .mockResolvedValueOnce({
        status: "ok",
        data: {
          id: "00000000-0000-4000-8000-000000000002",
          url: "/two",
        },
      });
    mocks.delete.mockResolvedValue({ status: "ok", data: null });
    const hook = await renderGallery();

    await act(async () => {
      await hook.result.current.uploadPhotos(new File(["one"], "one.jpg"));
      await hook.result.current.uploadPhotos(new File(["two"], "two.jpg"));
    });
    expect(hook.result.current.uploadPhotosList.map((item) => item.uid)).toEqual([
      photoId,
      "00000000-0000-4000-8000-000000000002",
    ]);

    await act(async () =>
      hook.result.current.removeUploadedPhoto(
        hook.result.current.uploadPhotosList[0],
      ),
    );
    expect(hook.result.current.uploadPhotosList.map((item) => item.uid)).toEqual([
      "00000000-0000-4000-8000-000000000002",
    ]);
  });
});
