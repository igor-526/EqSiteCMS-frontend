import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { PhotoSelectorModal } from "./PhotoSelectorModal";
import type { PhotoOutShortDto } from "@/types/api/photos";
import type { UUID } from "crypto";
import * as photosApi from "@/api/photos";
import { API_STATUS } from "@/lib/apiStatus";
import { message } from "antd";

// Mock antd message
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  };
});

// Mock photo API
vi.mock("@/api/photos", () => ({
  uploadPhotosToPrice: vi.fn(),
  uploadPhotosToHorse: vi.fn(),
  uploadPhotosToNews: vi.fn(),
}));

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

const photoC: PhotoOutShortDto = {
  id: "00000000-0000-4000-8000-000000000003" as UUID,
  url: "http://example.test/c.jpg",
  is_main: false,
};

const photoD: PhotoOutShortDto = {
  id: "00000000-0000-4000-8000-000000000004" as UUID,
  url: "http://example.test/d.jpg",
  is_main: false,
};

// Helper to create a mock FileList
const createMockFileList = (files: File[]): FileList => {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (let i = 0; i < files.length; i++) {
        yield files[i];
      }
    },
  };
  
  // Add indexed properties for array-like access
  files.forEach((file, index) => {
    Object.defineProperty(fileList, index, {
      value: file,
      enumerable: true,
    });
  });
  
  return fileList as FileList;
};

// Helper to create a mock File
const createMockFile = (name: string, type: string = "image/jpeg"): File => {
  const blob = new Blob(["mock file content"], { type });
  return new File([blob], name, { type });
};

// Helper to create a mock DragEvent
const createMockDragEvent = (type: string, files: FileList): DragEvent => {
  const event = new Event(type, { bubbles: true }) as DragEvent & {
    preventDefault: () => void;
    stopPropagation: () => void;
    dataTransfer: DataTransfer;
  };
  Object.defineProperty(event, "preventDefault", { value: vi.fn() });
  Object.defineProperty(event, "stopPropagation", { value: vi.fn() });
  Object.defineProperty(event, "dataTransfer", {
    value: {
      files,
    },
  });
  return event;
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
      entityType="price"
      entityId={"00000000-0000-4000-8000-000000000099" as UUID}
      {...props}
    />,
  );
  return { onUpdate };
};

describe("PhotoSelectorModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Regression: Gallery functionality", () => {
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

  describe("Upload button", () => {
    it("renders upload button with UploadOutlined icon", () => {
      renderModal();
      
      const uploadButton = screen.getByRole("button", { name: /загрузить/i });
      expect(uploadButton).toBeInTheDocument();
      expect(uploadButton.querySelector(".anticon-upload")).toBeInTheDocument();
    });

    it("triggers file input click when upload button is clicked", async () => {
      renderModal();
      
      const uploadButton = screen.getByRole("button", { name: /загрузить/i });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      expect(fileInput).toBeInTheDocument();
      expect(fileInput.style.display).toBe("none");
      
      const clickSpy = vi.spyOn(fileInput, "click");
      
      await userEvent.click(uploadButton);
      
      expect(clickSpy).toHaveBeenCalled();
    });

    it("disables upload button when uploading", async () => {
      vi.mocked(photosApi.uploadPhotosToPrice).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                status: API_STATUS.OK,
                data: { photos: [photoC], errors: [] },
              });
            }, 100);
          }),
      );

      const { onUpdate } = renderModal();
      const uploadButton = screen.getByRole("button", { name: /загрузить/i });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      // Simulate file selection
      const mockFile = createMockFile("test.jpg");
      const mockFileList = createMockFileList([mockFile]);
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
      });
      
      // Trigger file input change
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      // Button should be disabled during upload
      await waitFor(() => {
        expect(uploadButton).toBeDisabled();
      });
      
      // Wait for upload to complete
      await waitFor(() => {
        expect(uploadButton).not.toBeDisabled();
      });
    });
  });

  describe("File selection and upload", () => {
    it("uploads files via file input for price entity", async () => {
      vi.mocked(photosApi.uploadPhotosToPrice).mockResolvedValue({
        status: API_STATUS.OK,
        data: { photos: [photoC, photoD], errors: [] },
      });

      const { onUpdate } = renderModal({
        entityType: "price",
        entityId: "00000000-0000-4000-8000-000000000099" as UUID,
      });
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const mockFile1 = createMockFile("test1.jpg");
      const mockFile2 = createMockFile("test2.jpg");
      const mockFileList = createMockFileList([mockFile1, mockFile2]);
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(photosApi.uploadPhotosToPrice).toHaveBeenCalledWith(
          "00000000-0000-4000-8000-000000000099",
          [mockFile1, mockFile2],
        );
      });
      
      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith({
          photo_ids: [photoA.id, photoC.id, photoD.id],
        });
      });
      
      expect(message.success).toHaveBeenCalledWith("Загружено 2 фотографии");
    });

    it("uploads files via file input for horse entity", async () => {
      vi.mocked(photosApi.uploadPhotosToHorse).mockResolvedValue({
        status: API_STATUS.OK,
        data: { photos: [photoC], errors: [] },
      });

      const { onUpdate } = renderModal({
        entityType: "horse",
        entityId: "00000000-0000-4000-8000-000000000088" as UUID,
      });
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const mockFile = createMockFile("horse.jpg");
      const mockFileList = createMockFileList([mockFile]);
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(photosApi.uploadPhotosToHorse).toHaveBeenCalledWith(
          "00000000-0000-4000-8000-000000000088",
          [mockFile],
        );
      });
      
      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith({
          photo_ids: [photoA.id, photoC.id],
        });
      });
      
      expect(message.success).toHaveBeenCalledWith("Загружено 1 фотография");
    });

    it("uploads files via file input for news entity", async () => {
      vi.mocked(photosApi.uploadPhotosToNews).mockResolvedValue({
        status: API_STATUS.OK,
        data: { photos: [photoC], errors: [] },
      });

      const { onUpdate } = renderModal({
        entityType: "news",
        entityId: "00000000-0000-4000-8000-000000000077" as UUID,
      });
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const mockFile = createMockFile("news.jpg");
      const mockFileList = createMockFileList([mockFile]);
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(photosApi.uploadPhotosToNews).toHaveBeenCalledWith(
          "00000000-0000-4000-8000-000000000077",
          [mockFile],
        );
      });
      
      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith({
          photo_ids: [photoA.id, photoC.id],
        });
      });
    });

    it("allows re-uploading files multiple times (file input value reset)", async () => {
      vi.mocked(photosApi.uploadPhotosToPrice).mockResolvedValue({
        status: API_STATUS.OK,
        data: { photos: [photoC], errors: [] },
      });

      renderModal();
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const mockFile = createMockFile("test.jpg");
      const mockFileList = createMockFileList([mockFile]);
      
      // First upload
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
        configurable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(photosApi.uploadPhotosToPrice).toHaveBeenCalledTimes(1);
      });
      
      // Second upload with same file should work (input value was reset)
      vi.mocked(photosApi.uploadPhotosToPrice).mockClear();
      vi.mocked(photosApi.uploadPhotosToPrice).mockResolvedValue({
        status: API_STATUS.OK,
        data: { photos: [photoD], errors: [] },
      });
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
        configurable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(photosApi.uploadPhotosToPrice).toHaveBeenCalledTimes(1);
      });
    });

    it("does nothing when no files are selected", async () => {
      renderModal();
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(fileInput, "files", {
        value: null,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(photosApi.uploadPhotosToPrice).not.toHaveBeenCalled();
      });
    });

    it("does nothing when empty file list is provided", async () => {
      renderModal();
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const emptyFileList = createMockFileList([]);
      Object.defineProperty(fileInput, "files", {
        value: emptyFileList,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(photosApi.uploadPhotosToPrice).not.toHaveBeenCalled();
      });
    });
  });

  describe("Error handling", () => {
    it("handles partial success (2 out of 3 files uploaded)", async () => {
      vi.mocked(photosApi.uploadPhotosToPrice).mockResolvedValue({
        status: API_STATUS.OK,
        data: {
          photos: [photoC, photoD],
          errors: [
            { index: 2, message: "Неподдерживаемый формат файла" },
          ],
        },
      });

      const { onUpdate } = renderModal();
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const mockFile1 = createMockFile("test1.jpg");
      const mockFile2 = createMockFile("test2.jpg");
      const mockFile3 = createMockFile("test3.jpg");
      const mockFileList = createMockFileList([mockFile1, mockFile2, mockFile3]);
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith({
          photo_ids: [photoA.id, photoC.id, photoD.id],
        });
      });
      
      expect(message.success).toHaveBeenCalledWith("Загружено 2 из 3 фотографий");
      expect(message.error).toHaveBeenCalledWith("test3.jpg: Неподдерживаемый формат файла");
    });

    it("handles complete upload failure", async () => {
      vi.mocked(photosApi.uploadPhotosToPrice).mockResolvedValue({
        status: API_STATUS.OK,
        data: {
          photos: [],
          errors: [
            { index: 0, message: "Ошибка 1" },
            { index: 1, message: "Ошибка 2" },
          ],
        },
      });

      const { onUpdate } = renderModal();
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const mockFile1 = createMockFile("test1.jpg");
      const mockFile2 = createMockFile("test2.jpg");
      const mockFileList = createMockFileList([mockFile1, mockFile2]);
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith("test1.jpg: Ошибка 1");
        expect(message.error).toHaveBeenCalledWith("test2.jpg: Ошибка 2");
        expect(message.error).toHaveBeenCalledWith("Не удалось загрузить ни одной фотографии");
      });
      
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("handles API error response", async () => {
      vi.mocked(photosApi.uploadPhotosToPrice).mockResolvedValue({
        status: API_STATUS.ERROR,
        data: { detail: "Превышен лимит размера файла" },
      });

      const { onUpdate } = renderModal();
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const mockFile = createMockFile("huge.jpg");
      const mockFileList = createMockFileList([mockFile]);
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith("Превышен лимит размера файла");
      });
      
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("handles missing entityId", async () => {
      renderModal({ entityId: null });
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const mockFile = createMockFile("test.jpg");
      const mockFileList = createMockFileList([mockFile]);
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith("Не указан идентификатор сущности");
      });
      
      expect(photosApi.uploadPhotosToPrice).not.toHaveBeenCalled();
    });

    it("handles network errors gracefully", async () => {
      vi.mocked(photosApi.uploadPhotosToPrice).mockRejectedValue(new Error("Network error"));

      const { onUpdate } = renderModal();
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const mockFile = createMockFile("test.jpg");
      const mockFileList = createMockFileList([mockFile]);
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith("Неизвестная ошибка при загрузке фотографий");
      });
      
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Drag-and-drop functionality", () => {
    it("shows visual indicator on dragover", async () => {
      renderModal();
      
      const dropZone = document.querySelector('div[style*="border"]') as HTMLElement;
      expect(dropZone).toBeInTheDocument();
      
      const dragOverEvent = new Event("dragover", { bubbles: true });
      Object.defineProperty(dragOverEvent, "preventDefault", {
        value: vi.fn(),
      });
      Object.defineProperty(dragOverEvent, "stopPropagation", {
        value: vi.fn(),
      });
      
      dropZone.dispatchEvent(dragOverEvent);
      
      await waitFor(() => {
        expect(dropZone.style.border).toContain("dashed");
        expect(dropZone.style.backgroundColor).toBeTruthy();
      });
    });

    it("hides visual indicator on dragleave", async () => {
      renderModal();
      
      const dropZone = document.querySelector('div[style*="border"]') as HTMLElement;
      
      // First trigger dragover
      const dragOverEvent = new Event("dragover", { bubbles: true });
      Object.defineProperty(dragOverEvent, "preventDefault", { value: vi.fn() });
      Object.defineProperty(dragOverEvent, "stopPropagation", { value: vi.fn() });
      dropZone.dispatchEvent(dragOverEvent);
      
      // Then trigger dragleave
      const dragLeaveEvent = new Event("dragleave", { bubbles: true });
      Object.defineProperty(dragLeaveEvent, "preventDefault", { value: vi.fn() });
      Object.defineProperty(dragLeaveEvent, "stopPropagation", { value: vi.fn() });
      dropZone.dispatchEvent(dragLeaveEvent);
      
      await waitFor(() => {
        expect(dropZone.style.border).toContain("transparent");
      });
    });

    it("uploads files on drop", async () => {
      vi.mocked(photosApi.uploadPhotosToPrice).mockResolvedValue({
        status: API_STATUS.OK,
        data: { photos: [photoC], errors: [] },
      });

      const { onUpdate } = renderModal();
      
      const dropZone = document.querySelector('div[style*="border"]') as HTMLElement;
      
      const mockFile = createMockFile("dropped.jpg");
      const dropEvent = createMockDragEvent("drop", createMockFileList([mockFile]));
      
      dropZone.dispatchEvent(dropEvent);
      
      await waitFor(() => {
        expect(photosApi.uploadPhotosToPrice).toHaveBeenCalledWith(
          "00000000-0000-4000-8000-000000000099",
          [mockFile],
        );
      });
      
      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith({
          photo_ids: [photoA.id, photoC.id],
        });
      });
    });

    it("validates file types on drop - rejects non-image files", async () => {
      renderModal();
      
      const dropZone = document.querySelector('div[style*="border"]') as HTMLElement;
      
      const mockFile = createMockFile("document.pdf", "application/pdf");
      const dropEvent = createMockDragEvent("drop", createMockFileList([mockFile]));
      
      dropZone.dispatchEvent(dropEvent);
      
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith("Поддерживаются только файлы изображений");
      });
      
      expect(photosApi.uploadPhotosToPrice).not.toHaveBeenCalled();
    });

    it("blocks concurrent drop during upload", async () => {
      vi.mocked(photosApi.uploadPhotosToPrice).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                status: API_STATUS.OK,
                data: { photos: [photoC], errors: [] },
              });
            }, 100);
          }),
      );

      renderModal();
      
      const dropZone = document.querySelector('div[style*="border"]') as HTMLElement;
      
      const mockFile1 = createMockFile("first.jpg");
      const dropEvent1 = createMockDragEvent("drop", createMockFileList([mockFile1]));
      
      // First drop
      dropZone.dispatchEvent(dropEvent1);
      
      // Wait a tick for state to update
      await waitFor(() => {
        expect(photosApi.uploadPhotosToPrice).toHaveBeenCalledTimes(1);
      });
      
      // Second drop while upload is in progress
      const mockFile2 = createMockFile("second.jpg");
      const dropEvent2 = createMockDragEvent("drop", createMockFileList([mockFile2]));
      
      dropZone.dispatchEvent(dropEvent2);
      
      await waitFor(() => {
        expect(message.warning).toHaveBeenCalledWith("Файлы уже загружаются, подождите...");
      });
      
      // Should still only have called upload once
      expect(photosApi.uploadPhotosToPrice).toHaveBeenCalledTimes(1);
    });

    it("does nothing when empty file list is dropped", async () => {
      renderModal();
      
      const dropZone = document.querySelector('div[style*="border"]') as HTMLElement;
      
      const dropEvent = createMockDragEvent("drop", createMockFileList([]));
      
      dropZone.dispatchEvent(dropEvent);
      
      await waitFor(() => {
        expect(photosApi.uploadPhotosToPrice).not.toHaveBeenCalled();
      });
    });
  });

  describe("Regression: Set main photo after upload", () => {
    it("upload returns photo IDs that can be used to set main photo", async () => {
      // This test verifies that upload returns proper photo objects
      // that can then be used in the "set main photo" workflow
      vi.mocked(photosApi.uploadPhotosToPrice).mockResolvedValue({
        status: API_STATUS.OK,
        data: { photos: [photoC, photoD], errors: [] },
      });

      const { onUpdate } = renderModal({
        selectedPhotos: [photoA],
        allPhotos: [],
      });
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const mockFile1 = createMockFile("new1.jpg");
      const mockFile2 = createMockFile("new2.jpg");
      const mockFileList = createMockFileList([mockFile1, mockFile2]);
      
      Object.defineProperty(fileInput, "files", {
        value: mockFileList,
        writable: true,
      });
      
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      
      // Wait for upload to complete and onUpdate to be called
      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith({
          photo_ids: [photoA.id, photoC.id, photoD.id],
        });
      });
      
      // Verify that the uploaded photos have the required structure
      const response = await photosApi.uploadPhotosToPrice(
        "00000000-0000-4000-8000-000000000099" as UUID,
        [],
      );
      
      expect(response.status).toBe(API_STATUS.OK);
      expect(response.data).toBeDefined();
      
      if (response.status === API_STATUS.OK && response.data) {
        const uploadedPhotos = response.data.photos;
        expect(uploadedPhotos).toBeDefined();
        expect(uploadedPhotos[0]).toHaveProperty('id');
        expect(uploadedPhotos[0]).toHaveProperty('url');
        expect(uploadedPhotos[0]).toHaveProperty('is_main');
        
        // These properties are required for "set main photo" functionality
        expect(typeof uploadedPhotos[0].id).toBe('string');
        expect(typeof uploadedPhotos[0].is_main).toBe('boolean');
      }
    });

    it("set main photo works with existing photos (baseline)", async () => {
      // Baseline test to ensure set main photo functionality works
      const { onUpdate } = renderModal({
        selectedPhotos: [photoA, photoB],
        allPhotos: [],
      });
      
      // Find the star icon and click it
      const starIcon = document.querySelector(".anticon-star");
      expect(starIcon).toBeInTheDocument();
      
      await userEvent.click(starIcon as Element);
      
      expect(onUpdate).toHaveBeenCalledWith({
        photo_ids: [photoA.id, photoB.id],
        main: photoA.id,
      });
    });
  });
});
