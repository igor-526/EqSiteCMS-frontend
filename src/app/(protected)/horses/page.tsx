"use client";

import React, { useEffect, useState } from "react";
import { HorseServiceCreateInDto, HorseServiceOutDto, HorseServiceUpdateInDto } from "@/types/api/horseServices";
import { HorseOwnerCreateInDto, HorseOwnerOutDto, HorseOwnerUpdateInDto } from "@/types/api/horseOwners";
import { HorseCoatColorCreateInDto, HorseCoatColorOutDto, HorseCoatColorUpdateInDto } from "@/types/api/horseCoatColor";
import { HorseBreedCreateInDto, HorseBreedOutDto, HorseBreedUpdateInDto } from "@/types/api/horseBreeds";
import { HorseOutDto, HorseWithPedigreeOutDto } from "@/types/api/horses";
import { HorsesHeader } from "@/features/horses/ui/HorsesHeader";
import { HorsesTabsKeys } from "@/features/horses/ui/HorsesTabs";
import { HorsesDeveloperDocumentationView } from "@/features/horses/ui/HorsesDeveloperDocumentationView";
import { HorsesUserDocumentationView } from "@/features/horses/ui/HorsesUserDocumentationView";
import { HorseBreedCreateUpdateModal } from "@/features/horses/ui/HorseBreeds/HorseBreedsCreateUpdateModal";
import { HorseCoatColorsCreateUpdateModal } from "@/features/horses/ui/HorseCoatColors/HorseCoatColorsCreateUpdateModal";
import { HorseOwnersTable } from "@/features/horses/ui/HorseOwners/HorseOwnersTable";
import { HorseServicesCreateUpdateModal } from "@/features/horses/ui/HorseServices/HorseServicesCreateUpdateModal";
import { useHorseBreeds } from "@/features/horses/hooks/useHorseBreeds";
import { useHorseCoatColors } from "@/features/horses/hooks/useHorseCoatColors";
import { useHorseOwners } from "@/features/horses/hooks/useHorseOwners";
import { useHorseServices } from "@/features/horses/hooks/useHorseServices";
import { useHorses } from "@/features/horses/hooks/useHorses";
import { HorseBreedsTable } from "@/features/horses/ui/HorseBreeds";
import { HorseServicesTable } from "@/features/horses/ui/HorseServices/HorseServicesTable";
import { HorseOwnersCreateUpdateModal } from "@/features/horses/ui/HorseOwners/HorseOwnersCreateUpdateModal";
import { UUID } from "crypto";
import { useNotification } from "@/hooks/useNotification";
import { HorseCoatColorsTable } from "@/features/horses/ui/HorseCoatColors";
import { PageEditorModal } from "@/features/pageEditor/ui/PageEditorModal";
import { fetchBreedPageData, saveBreedPageData } from "@/features/pageEditor/services/breedPageDataService";
import { fetchCoatColorPageData, saveCoatColorPageData } from "@/features/pageEditor/services/coatColorPageDataService";
import { fetchHorseServicePageData, saveHorseServicePageData } from "@/features/pageEditor/services/horseServicePageDataService";
import { HorsesTable, HorseCreateUpdateModal, HorsePedigreeModal } from "@/features/horses/ui/Horses";
import { PhotoSelectorModal } from "@/features/photoSelector/ui/PhotoSelectorModal";
import { usePhotoSelector } from "@/features/photoSelector/hooks/usePhotoSelector";
import { PhotoUpdateEntityInDto } from "@/types/api/photos";

export default function HorsesPage() {
    const [activeTab, setActiveTab] = useState<HorsesTabsKeys>(HorsesTabsKeys.HORSES);

    // Horses tab state
    const [horseModalOpen, setHorseModalOpen] = useState<boolean>(false);
    const [selectedHorse, setSelectedHorse] = useState<HorseOutDto | HorseWithPedigreeOutDto | null>(null);
    const [horsePhotosModalOpen, setHorsePhotosModalOpen] = useState<boolean>(false);
    const [horsePedigreeModalOpen, setHorsePedigreeModalOpen] = useState<boolean>(false);

    // Other tab state
    const [horseBreedModalOpen, setHorseBreedModalOpen] = useState<boolean>(false);
    const [horseCoatColorModalOpen, setHorseCoatColorModalOpen] = useState<boolean>(false);
    const [horseOwnerModalOpen, setHorseOwnerModalOpen] = useState<boolean>(false);
    const [horseServiceModalOpen, setHorseServiceModalOpen] = useState<boolean>(false);
    const [horseBreedPageModalOpen, setHorseBreedPageModalOpen] = useState<boolean>(false);
    const [horseCoatColorPageModalOpen, setHorseCoatColorPageModalOpen] = useState<boolean>(false);
    const [horseServicePageModalOpen, setHorseServicePageModalOpen] = useState<boolean>(false);
    const [selectedHorseBreed, setSelectedHorseBreed] = useState<HorseBreedOutDto | null>(null);
    const [selectedHorseCoatColor, setSelectedHorseCoatColor] = useState<HorseCoatColorOutDto | null>(null);
    const [selectedHorseOwner, setSelectedHorseOwner] = useState<HorseOwnerOutDto | null>(null);
    const [selectedHorseService, setSelectedHorseService] = useState<HorseServiceOutDto | null>(null);

    const toast = useNotification();

    const {
        horses,
        horsesTotal,
        horsesLoading,
        horsesFilters,
        setHorsesFilters,
        setHorsesPage,
        setHorsesLimit,
        resetHorsesFilters,
        horsesValidationErrors,
        resetHorsesValidation,
        createHorse,
        updateHorse,
        deleteHorse,
        updateHorsePhotos,
        getHorseDetail,
        loadHorses,
    } = useHorses();

    const {
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
        createHorseBreed,
        updateHorseBreed,
        deleteHorseBreed,
        loadHorseBreedSelectorOptions,
    } = useHorseBreeds();

    const {
        horseCoatColors,
        horseCoatColorsTotal,
        horseCoatColorsLoading,
        horseCoatColorsFilters,
        setHorseCoatColorsFilters,
        horseCoatColorsValidationErrors,
        resetHorseCoatColorsValidation,
        resetHorseCoatColorsFilters,
        createHorseCoatColor,
        updateHorseCoatColor,
        deleteHorseCoatColor,
    } = useHorseCoatColors();

    const {
        horseOwners,
        horseOwnersTotal,
        horseOwnersLoading,
        horseOwnersFilters,
        setHorseOwnersFilters,
        horseOwnersValidationErrors,
        resetHorseOwnersValidation,
        resetHorseOwnersFilters,
        createHorseOwner,
        updateHorseOwner,
        deleteHorseOwner,
    } = useHorseOwners();

    const {
        horseServices,
        horseServicesTotal,
        horseServicesLoading,
        horseServicesFilters,
        setHorseServicesFilters,
        horseServicesValidationErrors,
        resetHorseServicesValidation,
        resetHorseServicesFilters,
        createHorseService,
        updateHorseService,
        deleteHorseService,
    } = useHorseServices();

    // Photo selector for horses
    const selectedHorsePhotos = selectedHorse?.photos ?? [];
    const {
        loadPhotos: loadHorsePhotos,
        loadMorePhotos: loadMoreHorsePhotos,
        photosList: horsePhotosList,
        photosLoading: horsePhotosLoading,
        photosTotal: horsePhotosTotal,
    } = usePhotoSelector(selectedHorsePhotos);

    useEffect(() => {
        if (horsePhotosModalOpen && selectedHorse?.id) {
            loadHorsePhotos();
        }
    }, [horsePhotosModalOpen, selectedHorse?.id, loadHorsePhotos]);

    useEffect(() => {
        loadHorseBreedSelectorOptions(horsesFilters.kind);
    }, [horsesFilters.kind, loadHorseBreedSelectorOptions]);

    // Filter options for horses header
    const breedFilterOptions = horseBreedSelectorOptions.map((b) => ({
        label: b.name,
        value: b.id.toString(),
    }));
    const coatColorFilterOptions = horseCoatColors.map((c) => ({
        label: c.name,
        value: c.id.toString(),
    }));
    const ownerFilterOptions = horseOwners.map((o) => ({
        label: o.name,
        value: o.id.toString(),
    }));

    // ---- Horses tab handlers ----
    const handleOpenHorseModal = (horseId: UUID | null) => {
        if (horseId) {
            const horse = horses.find((h) => h.id === horseId);
            if (horse) {
                setSelectedHorse(horse as HorseOutDto);
            } else {
                toast.error({ title: "Лошадь не найдена. Попробуйте обновить страницу." });
                setSelectedHorse(null);
                return;
            }
        } else {
            setSelectedHorse(null);
        }
        setHorseModalOpen(true);
    };

    const handlePhotosClick = (horseId: UUID) => {
        const horse = horses.find((h) => h.id === horseId);
        if (horse) {
            setSelectedHorse(horse as HorseOutDto);
            setHorsePhotosModalOpen(true);
        }
    };

    const handlePedigreeClick = (horseId: UUID) => {
        const horse = horses.find((h) => h.id === horseId);
        if (!horse) {
            toast.error({ title: "Лошадь не найдена. Попробуйте обновить страницу." });
            return;
        }
        setSelectedHorse(horse);
        setHorsePedigreeModalOpen(true);
    };

    const resolveHorseFromPedigreeRelation = async (
        horse: HorseOutDto,
        requirePedigree = false,
    ) => {
        const tableHorse = horses.find((item) => item.id === horse.id);
        if (tableHorse && (!requirePedigree || "pedigree" in tableHorse)) {
            return tableHorse;
        }
        return await getHorseDetail(horse.slug || horse.id.toString(), { pedigree: 1 });
    };

    const handleEditFromPedigree = async (horse: HorseOutDto) => {
        const resolvedHorse = await resolveHorseFromPedigreeRelation(horse);
        if (!resolvedHorse) {
            return;
        }
        setHorsePedigreeModalOpen(false);
        setSelectedHorse(resolvedHorse);
        setHorseModalOpen(true);
    };

    const handleOpenPedigreeFromPedigree = async (horse: HorseOutDto) => {
        const resolvedHorse = await resolveHorseFromPedigreeRelation(horse, true);
        if (!resolvedHorse || !("pedigree" in resolvedHorse)) {
            if (resolvedHorse) {
                toast.error({ title: "Ошибка", description: "Не удалось загрузить родословную лошади" });
            }
            return;
        }
        setSelectedHorse(resolvedHorse);
        setHorsePedigreeModalOpen(true);
    };

    const handleCreateHorse = async (createData: Parameters<typeof createHorse>[0]): Promise<boolean> => {
        const result = await createHorse(createData);
        if (result) {
            setHorseModalOpen(false);
            setSelectedHorse(null);
        }
        return result;
    };

    const handleUpdateHorse = async (
        horseId: UUID,
        updateData: Parameters<typeof updateHorse>[1],
    ): Promise<boolean> => {
        const result = await updateHorse(horseId, updateData);
        if (result) {
            setHorseModalOpen(false);
            setSelectedHorse(null);
        }
        return result;
    };

    const handleDeleteHorse = async (horseId: UUID): Promise<boolean> => {
        const result = await deleteHorse(horseId);
        if (result) {
            setHorseModalOpen(false);
            setSelectedHorse(null);
        }
        return result;
    };

    const handleUpdateHorsePhotos = async (updateData: PhotoUpdateEntityInDto) => {
        if (!selectedHorse?.id) return;
        const updatedHorse = await updateHorsePhotos(selectedHorse.id, updateData);
        if (updatedHorse) {
            setSelectedHorse((prev) => (
                prev && "pedigree" in prev
                    ? { ...prev, ...updatedHorse }
                    : updatedHorse
            ));
        }
    };

    // ---- Breed handlers ----
    const handleOpenHorseBreedModal = (horseBreedId: UUID | null) => {
        if (horseBreedId) {
            const horseBreed = horseBreeds.find((horseBreed) => horseBreed.id === horseBreedId);
            if (horseBreed) {
                setSelectedHorseBreed(horseBreed);
            } else {
                toast.error({ title: "Порода не найдена. Попобуйте обновить страницу и повторить попытку." });
                setSelectedHorseBreed(null);
                return;
            }
        } else {
            setSelectedHorseBreed(null);
        }
        setHorseBreedModalOpen(true);
    };

    const handleOpenHorseBreedPhotosModal = (horseBreedId: UUID | null) => {
        if (horseBreedId) {
            const horseBreed = horseBreeds.find((horseBreed) => horseBreed.id === horseBreedId);
            if (horseBreed) {
                setSelectedHorseBreed(horseBreed);
            } else {
                toast.error({ title: "Порода не найдена. Попобуйте обновить страницу и повторить попытку." });
                setSelectedHorseBreed(null);
                return;
            }
        } else {
            setSelectedHorseBreed(null);
        }
        // Photos modal for breeds - not shown in UI currently
    };

    const handleOpenHorseBreedPageModal = (horseBreedId: UUID | null) => {
        if (horseBreedId) {
            const horseBreed = horseBreeds.find((horseBreed) => horseBreed.id === horseBreedId);
            if (horseBreed) {
                setSelectedHorseBreed(horseBreed);
            } else {
                toast.error({ title: "Порода не найдена. Попобуйте обновить страницу и повторить попытку." });
                setSelectedHorseBreed(null);
                return;
            }
        } else {
            setSelectedHorseBreed(null);
        }
        setHorseBreedPageModalOpen(true);
    };

    const handleOpenHorseCoatColorModal = (horseCoatColorId: UUID | null) => {
        if (horseCoatColorId) {
            const horseCoatColor = horseCoatColors.find((horseCoatColor) => horseCoatColor.id === horseCoatColorId);
            if (horseCoatColor) {
                setSelectedHorseCoatColor(horseCoatColor);
            } else {
                toast.error({ title: "Масть не найдена. Попобуйте обновить страницу и повторить попытку." });
                setSelectedHorseCoatColor(null);
                return;
            }
        } else {
            setSelectedHorseCoatColor(null);
        }
        setHorseCoatColorModalOpen(true);
    };

    const handleOpenHorseCoatColorPhotosModal = (horseCoatColorId: UUID | null) => {
        if (horseCoatColorId) {
            const horseCoatColor = horseCoatColors.find((horseCoatColor) => horseCoatColor.id === horseCoatColorId);
            if (horseCoatColor) {
                setSelectedHorseCoatColor(horseCoatColor);
            } else {
                toast.error({ title: "Масть не найдена. Попобуйте обновить страницу и повторить попытку." });
                setSelectedHorseCoatColor(null);
                return;
            }
        } else {
            setSelectedHorseCoatColor(null);
        }
        // Photos modal for coat colors - not shown in UI currently
    };

    const handleOpenHorseCoatColorPageModal = (horseCoatColorId: UUID | null) => {
        if (horseCoatColorId) {
            const horseCoatColor = horseCoatColors.find((horseCoatColor) => horseCoatColor.id === horseCoatColorId);
            if (horseCoatColor) {
                setSelectedHorseCoatColor(horseCoatColor);
            } else {
                toast.error({ title: "Масть не найдена. Попобуйте обновить страницу и повторить попытку." });
                setSelectedHorseCoatColor(null);
                return;
            }
        } else {
            setSelectedHorseCoatColor(null);
        }
        setHorseCoatColorPageModalOpen(true);
    };

    const handleOpenHorseOwnerModal = (horseOwnerId: UUID | null) => {
        if (horseOwnerId) {
            const horseOwner = horseOwners.find((horseOwner) => horseOwner.id === horseOwnerId);
            if (horseOwner) {
                setSelectedHorseOwner(horseOwner);
            } else {
                toast.error({ title: "Владелец не найден. Попобуйте обновить страницу и повторить попытку." });
                setSelectedHorseOwner(null);
                return;
            }
        } else {
            setSelectedHorseOwner(null);
        }
        setHorseOwnerModalOpen(true);
    };

    const handleOpenHorseServiceModal = (horseServiceId: UUID | null) => {
        if (horseServiceId) {
            const horseService = horseServices.find((horseService) => horseService.id === horseServiceId);
            if (horseService) {
                setSelectedHorseService(horseService);
            } else {
                toast.error({ title: "Услуга не найдена. Попобуйте обновить страницу и повторить попытку." });
                setSelectedHorseService(null);
                return;
            }
        } else {
            setSelectedHorseService(null);
        }
        setHorseServiceModalOpen(true);
    };

    const handleOpenHorseServicePageModal = (horseServiceId: UUID | null) => {
        if (horseServiceId) {
            const horseService = horseServices.find((horseService) => horseService.id === horseServiceId);
            if (horseService) {
                setSelectedHorseService(horseService);
            } else {
                toast.error({ title: "Услуга не найдена. Попобуйте обновить страницу и повторить попытку." });
                setSelectedHorseService(null);
                return;
            }
        } else {
            setSelectedHorseService(null);
        }
        setHorseServicePageModalOpen(true);
    };

    const handleCreateHorseBreed = async (createData: HorseBreedCreateInDto) => {
        const result = await createHorseBreed(createData);
        if (result) {
            setHorseBreedModalOpen(false);
            setSelectedHorseBreed(null);
        }
    };

    const handleCreateHorseCoatColor = async (createData: HorseCoatColorCreateInDto) => {
        const result = await createHorseCoatColor(createData);
        if (result) {
            setHorseCoatColorModalOpen(false);
            setSelectedHorseCoatColor(null);
        }
    };

    const handleCreateHorseOwner = async (createData: HorseOwnerCreateInDto) => {
        const result = await createHorseOwner(createData);
        if (result) {
            setHorseOwnerModalOpen(false);
            setSelectedHorseOwner(null);
        }
    };

    const handleCreateHorseService = async (createData: HorseServiceCreateInDto) => {
        const result = await createHorseService(createData);
        if (result) {
            setHorseServiceModalOpen(false);
            setSelectedHorseService(null);
        }
    };

    const handleUpdateHorseBreed = async (horseBreedId: UUID, updateData: HorseBreedUpdateInDto) => {
        const result = await updateHorseBreed(horseBreedId, updateData);
        if (result) {
            setHorseBreedModalOpen(false);
            setSelectedHorseBreed(null);
        }
    };

    const handleUpdateHorseCoatColor = async (horseCoatColorId: UUID, updateData: HorseCoatColorUpdateInDto) => {
        const result = await updateHorseCoatColor(horseCoatColorId, updateData);
        if (result) {
            setHorseCoatColorModalOpen(false);
            setSelectedHorseCoatColor(null);
        }
    };

    const handleUpdateHorseOwner = async (horseOwnerId: UUID, updateData: HorseOwnerUpdateInDto) => {
        const result = await updateHorseOwner(horseOwnerId, updateData);
        if (result) {
            setHorseOwnerModalOpen(false);
            setSelectedHorseOwner(null);
        }
    };

    const handleUpdateHorseService = async (horseServiceId: UUID, updateData: HorseServiceUpdateInDto) => {
        const result = await updateHorseService(horseServiceId, updateData);
        if (result) {
            setHorseServiceModalOpen(false);
            setSelectedHorseService(null);
        }
    };

    const handleDeleteHorseBreed = async (horseBreedId: UUID) => {
        const result = await deleteHorseBreed(horseBreedId);
        if (result) {
            setHorseBreedModalOpen(false);
            setSelectedHorseBreed(null);
        }
    };

    const handleDeleteHorseCoatColor = async (horseCoatColorId: UUID) => {
        const result = await deleteHorseCoatColor(horseCoatColorId);
        if (result) {
            setHorseCoatColorModalOpen(false);
            setSelectedHorseCoatColor(null);
        }
    };

    const handleDeleteHorseOwner = async (horseOwnerId: UUID) => {
        const result = await deleteHorseOwner(horseOwnerId);
        if (result) {
            setHorseOwnerModalOpen(false);
            setSelectedHorseOwner(null);
        }
    };

    const handleDeleteHorseService = async (horseServiceId: UUID) => {
        const result = await deleteHorseService(horseServiceId);
        if (result) {
            setHorseServiceModalOpen(false);
            setSelectedHorseService(null);
        }
    };

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
            breedFilterOptions={breedFilterOptions}
            breedFilterLoading={horseBreedSelectorLoading}
            coatColorFilterOptions={coatColorFilterOptions}
            coatColorFilterLoading={horseCoatColorsLoading}
            ownerFilterOptions={ownerFilterOptions}
            ownerFilterLoading={horseOwnersLoading}
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

    const breedModalOptions = horseBreedSelectorOptions.map((b) => ({
        label: b.name,
        value: b.id.toString(),
    }));
    const coatColorModalOptions = horseCoatColors.map((c) => ({
        label: c.name,
        value: c.id.toString(),
    }));
    const ownerModalOptions = horseOwners.map((o) => ({
        label: o.name,
        value: o.id.toString(),
    }));

    return (
        <>
            {activeTab === HorsesTabsKeys.HORSES && (
                <>
                    <HorsesTable
                        horses={horses}
                        loading={horsesLoading}
                        filters={horsesFilters}
                        setFilters={setHorsesFilters}
                        filtersElements={filtersElements}
                        onOpenHorseModal={handleOpenHorseModal}
                        onPhotosClick={handlePhotosClick}
                        onPedigreeClick={handlePedigreeClick}
                        breedOptions={breedFilterOptions}
                        coatColorOptions={coatColorFilterOptions}
                    />
                    <HorseCreateUpdateModal
                        open={horseModalOpen}
                        onClose={() => {
                            setHorseModalOpen(false);
                            setSelectedHorse(null);
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
                    />
                    <HorsePedigreeModal
                        open={horsePedigreeModalOpen}
                        selectedHorse={
                            selectedHorse && "pedigree" in selectedHorse
                                ? selectedHorse
                                : null
                        }
                        onClose={() => {
                            setHorsePedigreeModalOpen(false);
                            setSelectedHorse(null);
                        }}
                        onChanged={() => {
                            loadHorses();
                        }}
                        onEditHorse={handleEditFromPedigree}
                        onOpenHorsePedigree={handleOpenPedigreeFromPedigree}
                    />
                    <PhotoSelectorModal
                        open={horsePhotosModalOpen}
                        onClose={() => setHorsePhotosModalOpen(false)}
                        selectedPhotos={selectedHorse?.photos ?? []}
                        allPhotos={horsePhotosList}
                        allPhotosLoading={horsePhotosLoading}
                        allPhotosTotal={horsePhotosTotal}
                        onUpdate={handleUpdateHorsePhotos}
                        onLoadMorePhotos={loadMoreHorsePhotos}
                        supportsMainPhoto={false}
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
                        onOpenHorseBreedPhotosModal={handleOpenHorseBreedPhotosModal}
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
                        onOpenHorseCoatColorPhotosModal={handleOpenHorseCoatColorPhotosModal}
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
