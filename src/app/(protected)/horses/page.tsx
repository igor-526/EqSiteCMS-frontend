"use client";

import React from "react";
import { HorsesHeader } from "@/features/horses/ui/HorsesHeader";
import { HorsesTabsKeys } from "@/features/horses/ui/HorsesTabs";
import { HorsesDeveloperDocumentationView } from "@/features/horses/ui/HorsesDeveloperDocumentationView";
import { HorsesUserDocumentationView } from "@/features/horses/ui/HorsesUserDocumentationView";
import { HorseBreedCreateUpdateModal } from "@/features/horses/ui/HorseBreeds/HorseBreedsCreateUpdateModal";
import { HorseCoatColorsCreateUpdateModal } from "@/features/horses/ui/HorseCoatColors/HorseCoatColorsCreateUpdateModal";
import { HorseOwnersTable } from "@/features/horses/ui/HorseOwners/HorseOwnersTable";
import { HorseServicesCreateUpdateModal } from "@/features/horses/ui/HorseServices/HorseServicesCreateUpdateModal";
import {
  HorseServiceRelationsDrawer,
  HorseServiceRelationCreateUpdateModal,
} from "@/features/horses/ui/HorseServiceRelations";
import { HorseBreedsTable } from "@/features/horses/ui/HorseBreeds";
import { HorseServicesTable } from "@/features/horses/ui/HorseServices/HorseServicesTable";
import { HorseOwnersCreateUpdateModal } from "@/features/horses/ui/HorseOwners/HorseOwnersCreateUpdateModal";
import { HorseCoatColorsTable } from "@/features/horses/ui/HorseCoatColors";
import { PageEditorModal } from "@/features/pageEditor/ui/PageEditorModal";
import {
  HorsesTable,
  HorseCreateUpdateModal,
  HorsePedigreeModal,
} from "@/features/horses/ui/Horses";
import { PhotoSelectorModal } from "@/features/photoSelector/ui/PhotoSelectorModal";
import { useHorsesPage } from "@/features/horses/hooks/useHorsesPage";

export default function HorsesPage() {
  const {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Horses
    horses,
    horsesTotal,
    horsesLoading,
    horsesError,
    horsesFilters,
    setHorsesFilters,
    setHorsesPage,
    setHorsesLimit,
    resetHorsesFilters,
    horsesValidationErrors,
    resetHorsesValidation,
    
    // Horse modal
    horseModalOpen,
    setHorseModalOpen,
    selectedHorse,
    horsePhotosModalOpen,
    horsePedigreeModalOpen,
    selectedHorseWithPedigree,
    
    // Horse actions
    handleOpenHorseModal,
    handlePhotosClick,
    handlePedigreeClick,
    handleHorseModalClose,
    handleHorsePedigreeModalClose,
    handleHorsePedigreeChanged,
    handleHorsePhotosModalClose,
    handleEditFromPedigree,
    handleOpenPedigreeFromPedigree,
    handleCreateHorse,
    handleUpdateHorse,
    handleDeleteHorse,
    handleUpdateHorsePhotos,
    handleServicesClick,
    
    // Breeds
    horseBreeds,
    horseBreedSelectorOptions,
    horseBreedSelectorLoading,
    horseBreedsTotal,
    horseBreedsLoading,
    horseBreedsFilters,
    setHorseBreedsFilters,
    horseBreedsValidationErrors,
    resetHorseBreedsValidation,
    resetHorseBreedsFilters,
    horseBreedModalOpen,
    setHorseBreedModalOpen,
    horseBreedPageModalOpen,
    setHorseBreedPageModalOpen,
    selectedHorseBreed,
    handleOpenHorseBreedModal,
    handleOpenHorseBreedPageModal,
    handleCreateHorseBreed,
    handleUpdateHorseBreed,
    handleDeleteHorseBreed,
    
    // Coat colors
    horseCoatColors,
    horseCoatColorsTotal,
    horseCoatColorsLoading,
    horseCoatColorsFilters,
    setHorseCoatColorsFilters,
    horseCoatColorsValidationErrors,
    resetHorseCoatColorsValidation,
    resetHorseCoatColorsFilters,
    horseCoatColorModalOpen,
    setHorseCoatColorModalOpen,
    horseCoatColorPageModalOpen,
    setHorseCoatColorPageModalOpen,
    selectedHorseCoatColor,
    handleOpenHorseCoatColorModal,
    handleOpenHorseCoatColorPageModal,
    handleCreateHorseCoatColor,
    handleUpdateHorseCoatColor,
    handleDeleteHorseCoatColor,
    
    // Owners
    horseOwners,
    horseOwnersTotal,
    horseOwnersLoading,
    horseOwnersFilters,
    setHorseOwnersFilters,
    horseOwnersValidationErrors,
    resetHorseOwnersValidation,
    resetHorseOwnersFilters,
    horseOwnerModalOpen,
    setHorseOwnerModalOpen,
    selectedHorseOwner,
    handleOpenHorseOwnerModal,
    handleCreateHorseOwner,
    handleUpdateHorseOwner,
    handleDeleteHorseOwner,
    
    // Services
    horseServices,
    horseServicesTotal,
    horseServicesLoading,
    horseServicesFilters,
    setHorseServicesFilters,
    horseServicesValidationErrors,
    resetHorseServicesValidation,
    resetHorseServicesFilters,
    horseServiceModalOpen,
    setHorseServiceModalOpen,
    horseServicePageModalOpen,
    setHorseServicePageModalOpen,
    selectedHorseService,
    handleOpenHorseServiceModal,
    handleOpenHorseServicePageModal,
    handleCreateHorseService,
    handleUpdateHorseService,
    handleDeleteHorseService,
    
    // Service relations
    serviceRelationsDrawerOpen,
    selectedHorseForServicesName,
    serviceRelations,
    serviceRelationsLoading,
    serviceRelationModalOpen,
    selectedServiceRelation,
    serviceRelationValidationErrors,
    availableServices,
    availableServicesLoading,
    openServiceRelationCreateModal,
    openServiceRelationUpdateModal,
    closeServiceRelationModal,
    resetServiceRelationValidation,
    createServiceRelation,
    updateServiceRelation,
    deleteServiceRelation,
    handleSearchAvailableServices,
    serviceRelationSubmitting,
    closeServiceRelationsDrawer,
    
    // Photos
    horsePhotosList,
    horsePhotosLoading,
    horsePhotosTotal,
    loadMoreHorsePhotos,
    
    // Search
    coatColorSearch,
    setCoatColorSearch,
    breedSearch,
    setBreedSearch,
    ownerSearch,
    setOwnerSearch,
    serviceFilterSearch,
    setServiceFilterSearch,
    
    // Filter options
    breedFilterOptions,
    coatColorFilterOptions,
    ownerFilterOptions,
    serviceFilterOptions,
    
    // Modal options
    breedModalOptions,
    coatColorModalOptions,
    ownerModalOptions,
    
    // Permissions
    canCreateDictionary,
    canUpdateDictionary,
    canDeleteDictionary,
    canCreateHorseService,
    canUpdateHorseServiceName,
    canUpdateHorseService,
    canDeleteHorseService,
    canManageHorseServices,
    
    // Page data fetchers
    fetchBreedPageData,
    saveBreedPageData,
    fetchCoatColorPageData,
    saveCoatColorPageData,
    fetchHorseServicePageData,
    saveHorseServicePageData,
  } = useHorsesPage();

  const filtersElements = (
    <HorsesHeader
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onCreateHorse={() => handleOpenHorseModal(null)}
      horsesTotal={horsesTotal}
      horsesFilters={horsesFilters}
      setHorsesFilters={setHorsesFilters}
      setHorsesPage={setHorsesPage}
      setHorsesLimit={setHorsesLimit}
      resetHorsesFilters={resetHorsesFilters}
      serviceFilterOptions={serviceFilterOptions}
      onServiceFilterSearch={setServiceFilterSearch}
      onCreateHorseBreedModal={() => handleOpenHorseBreedModal(null)}
      onCreateHorseOwnerModal={() => handleOpenHorseOwnerModal(null)}
      onCreateHorseServiceModal={() => handleOpenHorseServiceModal(null)}
      onCreateHorseCoatColorModal={() => handleOpenHorseCoatColorModal(null)}
      resetHorseBreedsFilters={resetHorseBreedsFilters}
      resetHorseOwnersFilters={resetHorseOwnersFilters}
      resetHorseServicesFilters={resetHorseServicesFilters}
      resetHorseCoatColorsFilters={resetHorseCoatColorsFilters}
      horseBreedsTotal={horseBreedsTotal}
      horseOwnersTotal={horseOwnersTotal}
      horseServicesTotal={horseServicesTotal}
      horseCoatColorsTotal={horseCoatColorsTotal}
      horseBreedsFilters={horseBreedsFilters}
      horseOwnersFilters={horseOwnersFilters}
      horseServicesFilters={horseServicesFilters}
      horseCoatColorsFilters={horseCoatColorsFilters}
      setHorseBreedsFilters={setHorseBreedsFilters}
      setHorseOwnersFilters={setHorseOwnersFilters}
      setHorseServicesFilters={setHorseServicesFilters}
      setHorseCoatColorsFilters={setHorseCoatColorsFilters}
    />
  );

  return (
    <>
      {activeTab === HorsesTabsKeys.HORSES && (
        <>
          <HorsesTable
            horses={horses}
            loading={horsesLoading}
            error={horsesError}
            filters={horsesFilters}
            setFilters={setHorsesFilters}
            filtersElements={filtersElements}
            onOpenHorseModal={handleOpenHorseModal}
            onPhotosClick={handlePhotosClick}
            onPedigreeClick={handlePedigreeClick}
            onServicesClick={handleServicesClick}
            breedOptions={breedFilterOptions}
            coatColorOptions={coatColorFilterOptions}
            ownerOptions={ownerFilterOptions}
          />
          <HorseCreateUpdateModal
            open={horseModalOpen}
            onClose={() => {
              handleHorseModalClose();
              setCoatColorSearch("");
              setBreedSearch("");
              setOwnerSearch("");
            }}
            selectedHorse={selectedHorse}
            onCreate={handleCreateHorse}
            onUpdate={handleUpdateHorse}
            onDelete={handleDeleteHorse}
            validationErrors={horsesValidationErrors}
            onResetValidation={resetHorsesValidation}
            breedOptions={breedModalOptions}
            breedOptionsLoading={horseBreedSelectorLoading}
            coatColorOptions={coatColorModalOptions}
            coatColorOptionsLoading={horseCoatColorsLoading}
            ownerOptions={ownerModalOptions}
            ownerOptionsLoading={horseOwnersLoading}
            onCoatColorSearch={setCoatColorSearch}
            onBreedSearch={setBreedSearch}
            onOwnerSearch={setOwnerSearch}
          />
          <HorsePedigreeModal
            open={horsePedigreeModalOpen}
            selectedHorse={selectedHorseWithPedigree}
            onClose={handleHorsePedigreeModalClose}
            onChanged={handleHorsePedigreeChanged}
            onEditHorse={handleEditFromPedigree}
            onOpenHorsePedigree={handleOpenPedigreeFromPedigree}
          />
          <PhotoSelectorModal
            open={horsePhotosModalOpen}
            onClose={handleHorsePhotosModalClose}
            selectedPhotos={selectedHorse?.photos ?? []}
            allPhotos={horsePhotosList}
            allPhotosLoading={horsePhotosLoading}
            allPhotosTotal={horsePhotosTotal}
            onUpdate={handleUpdateHorsePhotos}
            onLoadMorePhotos={loadMoreHorsePhotos}
          />
          <HorseServiceRelationsDrawer
            open={serviceRelationsDrawerOpen}
            onClose={closeServiceRelationsDrawer}
            horseName={selectedHorseForServicesName}
            relations={serviceRelations}
            loading={serviceRelationsLoading}
            onAdd={openServiceRelationCreateModal}
            onRowClick={openServiceRelationUpdateModal}
            canMutate={canManageHorseServices}
          />
          <HorseServiceRelationCreateUpdateModal
            open={serviceRelationModalOpen}
            onClose={closeServiceRelationModal}
            selectedRelation={selectedServiceRelation}
            availableServices={availableServices}
            availableServicesLoading={availableServicesLoading}
            onSearchServices={handleSearchAvailableServices}
            onCreate={createServiceRelation}
            onUpdate={updateServiceRelation}
            onDelete={deleteServiceRelation}
            validationErrors={serviceRelationValidationErrors}
            onResetValidation={resetServiceRelationValidation}
            submitting={serviceRelationSubmitting}
          />
        </>
      )}
      {activeTab === HorsesTabsKeys.BREEDS && (
        <>
          <HorseBreedsTable
            horseBreeds={horseBreeds}
            loading={horseBreedsLoading}
            filters={horseBreedsFilters}
            setFilters={setHorseBreedsFilters}
            filtersElements={filtersElements}
            onOpenHorseBreedModal={handleOpenHorseBreedModal}
            onOpenHorseBreedPageModal={handleOpenHorseBreedPageModal}
          />
          <HorseBreedCreateUpdateModal
            open={horseBreedModalOpen}
            onClose={() => setHorseBreedModalOpen(false)}
            selectedHorseBreed={selectedHorseBreed}
            onCreate={handleCreateHorseBreed}
            onUpdate={handleUpdateHorseBreed}
            onDelete={handleDeleteHorseBreed}
            validationErrors={horseBreedsValidationErrors}
            onResetValidation={resetHorseBreedsValidation}
            canMutate={
              selectedHorseBreed ? canUpdateDictionary : canCreateDictionary
            }
            canDelete={canDeleteDictionary}
          />
          <PageEditorModal
            open={horseBreedPageModalOpen}
            onClose={() => setHorseBreedPageModalOpen(false)}
            title={`Страница: ${selectedHorseBreed?.name ?? ""}`}
            entityId={selectedHorseBreed?.id ?? null}
            fetchPageData={fetchBreedPageData}
            savePageData={saveBreedPageData}
          />
        </>
      )}
      {activeTab === HorsesTabsKeys.COAT_COLORS && (
        <>
          <HorseCoatColorsTable
            horseCoatColors={horseCoatColors}
            loading={horseCoatColorsLoading}
            filters={horseCoatColorsFilters}
            setFilters={setHorseCoatColorsFilters}
            filtersElements={filtersElements}
            onOpenHorseCoatColorModal={handleOpenHorseCoatColorModal}
            onOpenHorseCoatColorPageModal={handleOpenHorseCoatColorPageModal}
          />
          <HorseCoatColorsCreateUpdateModal
            open={horseCoatColorModalOpen}
            onClose={() => setHorseCoatColorModalOpen(false)}
            selectedHorseCoatColor={selectedHorseCoatColor}
            onCreate={handleCreateHorseCoatColor}
            onUpdate={handleUpdateHorseCoatColor}
            onDelete={handleDeleteHorseCoatColor}
            validationErrors={horseCoatColorsValidationErrors}
            onResetValidation={resetHorseCoatColorsValidation}
            canMutate={
              selectedHorseCoatColor ? canUpdateDictionary : canCreateDictionary
            }
            canDelete={canDeleteDictionary}
          />
          <PageEditorModal
            open={horseCoatColorPageModalOpen}
            onClose={() => setHorseCoatColorPageModalOpen(false)}
            title={`Страница: ${selectedHorseCoatColor?.name ?? ""}`}
            entityId={selectedHorseCoatColor?.id ?? null}
            fetchPageData={fetchCoatColorPageData}
            savePageData={saveCoatColorPageData}
          />
        </>
      )}
      {activeTab === HorsesTabsKeys.OWNERS && (
        <>
          <HorseOwnersTable
            horseOwners={horseOwners}
            loading={horseOwnersLoading}
            filters={horseOwnersFilters}
            setFilters={setHorseOwnersFilters}
            filtersElements={filtersElements}
            onOpenHorseOwnerModal={handleOpenHorseOwnerModal}
          />
          <HorseOwnersCreateUpdateModal
            open={horseOwnerModalOpen}
            onClose={() => setHorseOwnerModalOpen(false)}
            selectedHorseOwner={selectedHorseOwner}
            onCreate={handleCreateHorseOwner}
            onUpdate={handleUpdateHorseOwner}
            onDelete={handleDeleteHorseOwner}
            validationErrors={horseOwnersValidationErrors}
            onResetValidation={resetHorseOwnersValidation}
          />
        </>
      )}
      {activeTab === HorsesTabsKeys.SERVICES && (
        <>
          <HorseServicesTable
            horseServices={horseServices}
            loading={horseServicesLoading}
            filters={horseServicesFilters}
            setFilters={setHorseServicesFilters}
            filtersElements={filtersElements}
            onOpenHorseServiceModal={handleOpenHorseServiceModal}
            onOpenHorseServicePageModal={handleOpenHorseServicePageModal}
          />
          <HorseServicesCreateUpdateModal
            open={horseServiceModalOpen}
            onClose={() => setHorseServiceModalOpen(false)}
            selectedHorseService={selectedHorseService}
            onCreate={handleCreateHorseService}
            onUpdate={handleUpdateHorseService}
            onDelete={handleDeleteHorseService}
            validationErrors={horseServicesValidationErrors}
            onResetValidation={resetHorseServicesValidation}
            canMutate={
              selectedHorseService
                ? canUpdateHorseService
                : canCreateHorseService
            }
            canDelete={canDeleteHorseService}
            canUpdateName={canUpdateHorseServiceName}
          />
          <PageEditorModal
            open={horseServicePageModalOpen}
            onClose={() => setHorseServicePageModalOpen(false)}
            title={`Страница: ${selectedHorseService?.name ?? ""}`}
            entityId={selectedHorseService?.id ?? null}
            fetchPageData={fetchHorseServicePageData}
            savePageData={saveHorseServicePageData}
          />
        </>
      )}
      {activeTab === HorsesTabsKeys.DEVELOPER_DOCS && (
        <>
          <HorsesDeveloperDocumentationView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </>
      )}
      {activeTab === HorsesTabsKeys.USER_DOCS && (
        <>
          <HorsesUserDocumentationView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </>
      )}
    </>
  );
}
