"use client";

import React, { useState, useMemo } from "react";
import { PricesHeader } from "@/features/prices/ui/PricesHeader";
import { usePrices } from "@/features/prices/hooks/usePrices";
import { usePricesPageActions } from "@/features/prices/hooks/usePricesPageActions";
import { PricesGroupsTable } from "@/features/prices/ui/PriceGroup/PricesGroupsTable";
import { PriceGroupModal } from "@/features/prices/ui/PriceGroup/PriceGroupModal";
import { PriceGroupReorderModal } from "@/features/prices/ui/PriceGroup/PriceGroupReorderModal";
import {
  PriceGroupCreateInDto,
  PriceGroupOutDto,
  PriceGroupReorderItemInDto,
  PriceGroupUpdateInDto,
} from "@/types/api/priceGroups";
import {
  PriceCreateInDto,
  PriceOutDto,
  PriceUpdateInDto,
} from "@/types/api/prices";
import { UUID } from "crypto";
import { PricesTable } from "@/features/prices/ui/Price/PricesTable";
import {
  PriceEditModal,
  PriceEditModalMode,
} from "@/features/prices/ui/Price/PriceEditModal";
import { PricesDeveloperDocumentationView } from "@/features/prices/ui/PricesDeveloperDocumentationView";
import { PricesUserDocumentationView } from "@/features/prices/ui/PricesUserDocumentationView";
import { PricesTabsEnum } from "@/features/prices/ui/PricesTabs";
import {
  PRICE_PAGE_SCOPES_ACTIONS,
  usePricePageActionScopes,
} from "@/features/prices/hooks/usePriceScopes";
import { PhotoSelectorModal } from "@/features/photoSelector/ui/PhotoSelectorModal";
import { usePhotoSelector } from "@/features/photoSelector/hooks/usePhotoSelector";
import { PhotoUpdateEntityInDto } from "@/types/api/photos";
import { PageEditorModal } from "@/features/pageEditor/ui/PageEditorModal";
import {
  fetchPricePageData,
  savePricePageData,
} from "@/features/pageEditor/services/pricePageDataService";

export default function PricesPage() {
  const [activeTab, setActiveTab] = useState<PricesTabsEnum>(
    PricesTabsEnum.PRICES,
  );
  const [priceGroupModalOpen, setPriceGroupModalOpen] =
    useState<boolean>(false);
  const [selectedPriceGroup, setSelectedPriceGroup] =
    useState<PriceGroupOutDto | null>(null);
  const [priceModalOpen, setPriceModalOpen] = useState<boolean>(false);
  const [priceEditModalMode, setPriceEditModalMode] =
    useState<PriceEditModalMode>("create");
  const [selectedPrice, setSelectedPrice] = useState<PriceOutDto | null>(null);
  const [templatePrice, setTemplatePrice] = useState<PriceOutDto | null>(null);
  const [pricePhotosModalOpen, setPricePhotosModalOpen] =
    useState<boolean>(false);
  const [pricePageModalOpen, setPricePageModalOpen] = useState<boolean>(false);
  const [priceGroupReorderModalOpen, setPriceGroupReorderModalOpen] =
    useState<boolean>(false);
  const [selectedGroupForReorder, setSelectedGroupForReorder] =
    useState<PriceGroupOutDto | null>(null);
  const [reorderPricesForGroup, setReorderPricesForGroup] = useState<
    PriceOutDto[]
  >([]);
  const [reorderLoading, setReorderLoading] = useState<boolean>(false);

  const {
    priceGroups,
    priceGroupsTotal,
    priceGroupsLoading,
    priceGroupsFilters,
    setPriceGroupsFilters,
    priceGroupsValidationErrors,
    resetPriceGroupsValidation,
    resetPriceGroupsFilters,
    createPriceGroup,
    updatePriceGroup,
    deletePriceGroup,
    prices,
    pricesTotal,
    pricesLoading,
    pricesFilters,
    setPricesFilters,
    pricesValidationErrors,
    resetPricesValidation,
    resetPricesFilters,
    priceGroupsOptions,
    createPrice,
    updatePrice,
    updatePricePhotos,
    deletePrice,
    priceDetail,
    priceDetailLoading,
    loadPriceDetail,
    loadPricesForGroup,
    reorderPricesInGroup,
  } = usePrices();

  const { hasPermission } = usePricePageActionScopes();
  const canReorder = hasPermission(
    PRICE_PAGE_SCOPES_ACTIONS.PRICE_GROUP_REORDER,
  );

  const selectedPhotos = useMemo(
    () => priceDetail?.photos || [],
    [priceDetail?.photos],
  );

  const { loadPhotos, loadMorePhotos, photosList, photosLoading, photosTotal } =
    usePhotoSelector(selectedPhotos);

  const {
    handlePriceModalClose,
    handlePricePhotosModalClose,
    handlePricePageModalClose,
    handlePriceGroupModalClose,
    handlePriceGroupReorderModalClose,
    handleOpenPricePageModal,
    handleOpenReorderModal: openReorderModal,
  } = usePricesPageActions({
    prices,
    priceGroups,
    setSelectedPrice,
    setSelectedGroupForReorder,
    setPriceModalOpen,
    setPricePhotosModalOpen,
    setPricePageModalOpen,
    setPriceGroupModalOpen,
    setPriceGroupReorderModalOpen,
  });

  const filtersElements = (
    <PricesHeader
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onCreatePriceGroup={() => handleOpenPriceGroupModal(null)}
      onCreatePrice={() => handleOpenPriceEditModal(null)}
      resetPriceGroupsFilters={resetPriceGroupsFilters}
      resetPricesFilters={resetPricesFilters}
      priceGroupsTotal={priceGroupsTotal}
      priceGroupsFilters={priceGroupsFilters}
      setPriceGroupsFilters={setPriceGroupsFilters}
      priceTotal={pricesTotal}
      priceFilters={pricesFilters}
      setPriceFilters={setPricesFilters}
    />
  );

  const handleOpenPriceGroupModal = (priceGroupId: UUID | null) => {
    if (priceGroupId) {
      setSelectedPriceGroup(
        priceGroups.find((priceGroup) => priceGroup.id === priceGroupId) ||
          null,
      );
    } else {
      setSelectedPriceGroup(null);
    }
    setPriceGroupModalOpen(true);
  };

  const handleOpenPriceEditModal = (priceId: UUID | null) => {
    if (priceId) {
      const found = prices.find((price) => price.id === priceId) || null;
      setSelectedPrice(found);
      setTemplatePrice(null);
      loadPriceDetail(priceId);
      setPriceEditModalMode("update");
    } else {
      setSelectedPrice(null);
      setTemplatePrice(null);
      setPriceEditModalMode("create");
    }
    setPriceModalOpen(true);
  };

  const handleDuplicatePrice = (priceId: UUID) => {
    const found = prices.find((price) => price.id === priceId) || null;
    setTemplatePrice(found);
    setSelectedPrice(null);
    loadPriceDetail(priceId);
    setPriceEditModalMode("duplicate");
    setPriceModalOpen(true);
  };

  const handleCreatePriceGroup = async (createData: PriceGroupCreateInDto) => {
    const result = await createPriceGroup(createData);
    if (result) {
      setPriceGroupModalOpen(false);
    }
  };

  const handleUpdatePriceGroup = async (
    priceGroupId: UUID,
    updateData: PriceGroupUpdateInDto,
  ) => {
    const result = await updatePriceGroup(priceGroupId, updateData);
    if (result) {
      setPriceGroupModalOpen(false);
    }
  };

  const handleDeletePriceGroup = async (priceGroupId: UUID) => {
    const result = await deletePriceGroup(priceGroupId);
    if (result) {
      setPriceGroupModalOpen(false);
    }
  };

  const handleCreatePrice = async (
    createData: PriceCreateInDto,
  ): Promise<boolean> => {
    return await createPrice(createData);
  };

  const handleUpdatePrice = async (
    priceId: UUID,
    updateData: PriceUpdateInDto,
  ): Promise<boolean> => {
    return await updatePrice(priceId, updateData);
  };

  const handleDeletePrice = async (priceId: UUID): Promise<boolean> => {
    return await deletePrice(priceId);
  };

  const handleOpenPricePhotosModal = (priceId: UUID) => {
    loadPriceDetail(priceId);
    setPricePhotosModalOpen(true);
    loadPhotos();
  };

  const handleUpdatePricePhotos = (updateData: PhotoUpdateEntityInDto) => {
    if (!priceDetail?.id) {
      return;
    }
    updatePricePhotos(priceDetail.id, updateData);
  };

  const handleOpenReorderModal = async (priceGroupId: string) => {
    const group = openReorderModal(priceGroupId);
    if (group) {
      const groupPrices = await loadPricesForGroup(group.name);
      setReorderPricesForGroup(groupPrices);
    }
  };

  const handleSaveReorder = async (changes: PriceGroupReorderItemInDto[]) => {
    if (!selectedGroupForReorder) return;
    setReorderLoading(true);
    await reorderPricesInGroup(selectedGroupForReorder.id, changes);
    setReorderLoading(false);
    setPriceGroupReorderModalOpen(false);
  };

  return (
    <>
      {activeTab === PricesTabsEnum.PRICES && (
        <>
          <PricesTable
            prices={prices}
            loading={pricesLoading}
            filters={pricesFilters}
            setFilters={setPricesFilters}
            filtersElements={filtersElements}
            onOpenPriceModal={handleOpenPriceEditModal}
            priceGroupsOptions={priceGroupsOptions}
            onDuplicatePrice={handleDuplicatePrice}
            onOpenPricePhotosModal={handleOpenPricePhotosModal}
            onOpenPricePageModal={handleOpenPricePageModal}
          />
          <PriceEditModal
            open={priceModalOpen}
            onClose={handlePriceModalClose}
            mode={priceEditModalMode}
            selectedPrice={selectedPrice}
            templatePrice={templatePrice}
            priceDetail={priceDetail}
            priceDetailLoading={priceDetailLoading}
            onCreate={handleCreatePrice}
            onUpdate={handleUpdatePrice}
            onDelete={handleDeletePrice}
            validationErrors={pricesValidationErrors}
            onResetValidation={resetPricesValidation}
            priceGroupsOptions={priceGroupsOptions}
          />
          <PhotoSelectorModal
            open={pricePhotosModalOpen}
            onClose={handlePricePhotosModalClose}
            selectedPhotos={priceDetail?.photos || []}
            allPhotos={photosList}
            allPhotosLoading={photosLoading}
            allPhotosTotal={photosTotal}
            onUpdate={handleUpdatePricePhotos}
            onLoadMorePhotos={loadMorePhotos}
          />
          <PageEditorModal
            open={pricePageModalOpen}
            onClose={handlePricePageModalClose}
            title={`Страница: ${selectedPrice?.name ?? ""}`}
            entityId={selectedPrice?.id ?? null}
            fetchPageData={fetchPricePageData}
            savePageData={savePricePageData}
          />
        </>
      )}
      {activeTab === PricesTabsEnum.GROUPS && (
        <>
          <PricesGroupsTable
            priceGroups={priceGroups}
            loading={priceGroupsLoading}
            filters={priceGroupsFilters}
            setFilters={setPriceGroupsFilters}
            filtersElements={filtersElements}
            onOpenPriceGroupModal={handleOpenPriceGroupModal}
            onOpenReorderModal={handleOpenReorderModal}
            canReorder={canReorder}
          />
          <PriceGroupModal
            open={priceGroupModalOpen}
            onClose={handlePriceGroupModalClose}
            selectedPriceGroup={selectedPriceGroup}
            onCreate={handleCreatePriceGroup}
            onUpdate={handleUpdatePriceGroup}
            onDelete={handleDeletePriceGroup}
            validationErrors={priceGroupsValidationErrors}
            onResetValidation={resetPriceGroupsValidation}
          />
          <PriceGroupReorderModal
            open={priceGroupReorderModalOpen}
            onClose={handlePriceGroupReorderModalClose}
            onSave={handleSaveReorder}
            loading={reorderLoading}
            prices={reorderPricesForGroup}
          />
        </>
      )}
      {activeTab === PricesTabsEnum.DEVELOPER_DOCS && (
        <>
          <PricesDeveloperDocumentationView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </>
      )}
      {activeTab === PricesTabsEnum.USER_DOCS && (
        <>
          <PricesUserDocumentationView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </>
      )}
    </>
  );
}
