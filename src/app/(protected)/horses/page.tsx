"use client";

import React, { useState } from "react";
import { HorseServiceCreateInDto, HorseServiceOutDto, HorseServiceUpdateInDto } from "@/types/api/horseServices";
import { HorseOwnerCreateInDto, HorseOwnerOutDto, HorseOwnerUpdateInDto } from "@/types/api/horseOwners";
import { HorseCoatColorCreateInDto, HorseCoatColorOutDto, HorseCoatColorUpdateInDto } from "@/types/api/horseCoatColor";
import { HorseBreedCreateInDto, HorseBreedOutDto, HorseBreedUpdateInDto } from "@/types/api/horseBreeds";
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
import { HorseBreedsTable } from "@/features/horses/ui/HorseBreeds";
import { HorseServicesTable } from "@/features/horses/ui/HorseServices/HorseServicesTable";
import { HorseOwnersCreateUpdateModal } from "@/features/horses/ui/HorseOwners/HorseOwnersCreateUpdateModal";
import { UUID } from "crypto";
import { useNotification } from "@/hooks/useNotification";
import { HorseCoatColorsTable } from "@/features/horses/ui/HorseCoatColors";


export default function HorsesPage() {
    const [activeTab, setActiveTab] = useState<HorsesTabsKeys>(HorsesTabsKeys.BREEDS);
    const [horseBreedModalOpen, setHorseBreedModalOpen] = useState<boolean>(false);
    const [horseCoatColorModalOpen, setHorseCoatColorModalOpen] = useState<boolean>(false);
    const [horseOwnerModalOpen, setHorseOwnerModalOpen] = useState<boolean>(false);
    const [horseServiceModalOpen, setHorseServiceModalOpen] = useState<boolean>(false);
    const [horseBreedPhotosModalOpen, setHorseBreedPhotosModalOpen] = useState<boolean>(false);
    const [horseBreedPageModalOpen, setHorseBreedPageModalOpen] = useState<boolean>(false);
    const [horseCoatColorPhotosModalOpen, setHorseCoatColorPhotosModalOpen] = useState<boolean>(false);
    const [horseCoatColorPageModalOpen, setHorseCoatColorPageModalOpen] = useState<boolean>(false);
    const [horseServicePageModalOpen, setHorseServicePageModalOpen] = useState<boolean>(false);
    const [selectedHorseBreed, setSelectedHorseBreed] = useState<HorseBreedOutDto | null>(null);
    const [selectedHorseCoatColor, setSelectedHorseCoatColor] = useState<HorseCoatColorOutDto | null>(null);
    const [selectedHorseOwner, setSelectedHorseOwner] = useState<HorseOwnerOutDto | null>(null);
    const [selectedHorseService, setSelectedHorseService] = useState<HorseServiceOutDto | null>(null);

    const toast = useNotification();
    const {
        horseBreeds,
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

    const handleOpenHorseBreedModal = (horseBreedId: UUID | null) => {
        if (horseBreedId) {
            const horseBreed = horseBreeds.find((horseBreed) => horseBreed.id === horseBreedId);
            if (horseBreed) {
                setSelectedHorseBreed(horseBreed);
            } else {
                toast.error("Порода не найдена. Попобуйте обновить страницу и повторить попытку.");
                setSelectedHorseBreed(null);
                return;
            }
        } else {
            setSelectedHorseBreed(null);
        }
        setHorseBreedModalOpen(true);
    }

    const handleOpenHorseBreedPhotosModal = (horseBreedId: UUID | null) => {
        if (horseBreedId) {
            const horseBreed = horseBreeds.find((horseBreed) => horseBreed.id === horseBreedId);
            if (horseBreed) {
                setSelectedHorseBreed(horseBreed);
            } else {
                toast.error("Порода не найдена. Попобуйте обновить страницу и повторить попытку.");
                setSelectedHorseBreed(null);
                return;
            }
        } else {
            setSelectedHorseBreed(null);
        }
        setHorseBreedPhotosModalOpen(true);
    }

    const handleOpenHorseBreedPageModal = (horseBreedId: UUID | null) => {
        if (horseBreedId) {
            const horseBreed = horseBreeds.find((horseBreed) => horseBreed.id === horseBreedId);
            if (horseBreed) {
                setSelectedHorseBreed(horseBreed);
            } else {
                toast.error("Порода не найдена. Попобуйте обновить страницу и повторить попытку.");
                setSelectedHorseBreed(null);
                return;
            }
        } else {
            setSelectedHorseBreed(null);
        }
        setHorseBreedPageModalOpen(true);
    }

    const handleOpenHorseCoatColorModal = (horseCoatColorId: UUID | null) => {
        if (horseCoatColorId) {
            const horseCoatColor = horseCoatColors.find((horseCoatColor) => horseCoatColor.id === horseCoatColorId);
            if (horseCoatColor) {
                setSelectedHorseCoatColor(horseCoatColor);
            } else {
                toast.error("Масть не найдена. Попобуйте обновить страницу и повторить попытку.");
                setSelectedHorseCoatColor(null);
                return;
            }
        } else {
            setSelectedHorseCoatColor(null);
        }
        setHorseCoatColorModalOpen(true);
    }

    const handleOpenHorseCoatColorPhotosModal = (horseCoatColorId: UUID | null) => {
        if (horseCoatColorId) {
            const horseCoatColor = horseCoatColors.find((horseCoatColor) => horseCoatColor.id === horseCoatColorId);
            if (horseCoatColor) {
                setSelectedHorseCoatColor(horseCoatColor);
            } else {
                toast.error("Масть не найдена. Попобуйте обновить страницу и повторить попытку.");
                setSelectedHorseCoatColor(null);
                return;
            }
        } else {
            setSelectedHorseCoatColor(null);
        }
        setHorseCoatColorPhotosModalOpen(true);
    }

    const handleOpenHorseCoatColorPageModal = (horseCoatColorId: UUID | null) => {
        if (horseCoatColorId) {
            const horseCoatColor = horseCoatColors.find((horseCoatColor) => horseCoatColor.id === horseCoatColorId);
            if (horseCoatColor) {
                setSelectedHorseCoatColor(horseCoatColor);
            } else {
                toast.error("Масть не найдена. Попобуйте обновить страницу и повторить попытку.");
                setSelectedHorseCoatColor(null);
                return;
            }
        } else {
            setSelectedHorseCoatColor(null);
        }
        setHorseCoatColorPageModalOpen(true);
    }

    const handleOpenHorseOwnerModal = (horseOwnerId: UUID | null) => {
        if (horseOwnerId) {
            const horseOwner = horseOwners.find((horseOwner) => horseOwner.id === horseOwnerId);
            if (horseOwner) {
                setSelectedHorseOwner(horseOwner);
            } else {
                toast.error("Владелец не найден. Попобуйте обновить страницу и повторить попытку.");
                setSelectedHorseOwner(null);
                return;
            }
        } else {
            setSelectedHorseOwner(null);
        }
        setHorseOwnerModalOpen(true);
    }

    const handleOpenHorseServiceModal = (horseServiceId: UUID | null) => {
        if (horseServiceId) {
            const horseService = horseServices.find((horseService) => horseService.id === horseServiceId);
            if (horseService) {
                setSelectedHorseService(horseService);
            } else {
                toast.error("Услуга не найдена. Попобуйте обновить страницу и повторить попытку.");
                setSelectedHorseService(null);
                return;
            }
        } else {
            setSelectedHorseService(null);
        }
        setHorseServiceModalOpen(true);
    }

    const handleOpenHorseServicePageModal = (horseServiceId: UUID | null) => {
        if (horseServiceId) {
            const horseService = horseServices.find((horseService) => horseService.id === horseServiceId);
            if (horseService) {
                setSelectedHorseService(horseService);
            } else {
                toast.error("Услуга не найдена. Попобуйте обновить страницу и повторить попытку.");
                setSelectedHorseService(null);
                return;
            }
        } else {
            setSelectedHorseService(null);
        }
        setHorseServicePageModalOpen(true);
    }

    const handleCreateHorseBreed = async (createData: HorseBreedCreateInDto) => {
        const result = await createHorseBreed(createData);
        if (result) {
            setHorseBreedModalOpen(false);
            setSelectedHorseBreed(null);
        }
    }

    const handleCreateHorseCoatColor = async (createData: HorseCoatColorCreateInDto) => {
        const result = await createHorseCoatColor(createData);
        if (result) {
            setHorseCoatColorModalOpen(false);
            setSelectedHorseCoatColor(null);
        }
    }

    const handleCreateHorseOwner = async (createData: HorseOwnerCreateInDto) => {
        const result = await createHorseOwner(createData);
        if (result) {
            setHorseOwnerModalOpen(false);
            setSelectedHorseOwner(null);
        }
    }

    const handleCreateHorseService = async (createData: HorseServiceCreateInDto) => {
        const result = await createHorseService(createData);
        if (result) {
            setHorseServiceModalOpen(false);
            setSelectedHorseService(null);
        }
    }

    const handleUpdateHorseBreed = async (horseBreedId: UUID, updateData: HorseBreedUpdateInDto) => {
        const result = await updateHorseBreed(horseBreedId, updateData);
        if (result) {
            setHorseBreedModalOpen(false);
            setSelectedHorseBreed(null);
        }
    }

    const handleUpdateHorseCoatColor = async (horseCoatColorId: UUID, updateData: HorseCoatColorUpdateInDto) => {
        const result = await updateHorseCoatColor(horseCoatColorId, updateData);
        if (result) {
            setHorseCoatColorModalOpen(false);
            setSelectedHorseCoatColor(null);
        }
    }

    const handleUpdateHorseOwner = async (horseOwnerId: UUID, updateData: HorseOwnerUpdateInDto) => {
        const result = await updateHorseOwner(horseOwnerId, updateData);
        if (result) {
            setHorseOwnerModalOpen(false);
            setSelectedHorseOwner(null);
        }
    }

    const handleUpdateHorseService = async (horseServiceId: UUID, updateData: HorseServiceUpdateInDto) => {
        const result = await updateHorseService(horseServiceId, updateData);
        if (result) {
            setHorseServiceModalOpen(false);
            setSelectedHorseService(null);
        }
    }

    const handleDeleteHorseBreed = async (horseBreedId: UUID) => {
        const result = await deleteHorseBreed(horseBreedId);
        if (result) {
            setHorseBreedModalOpen(false);
            setSelectedHorseBreed(null);
        }
    }

    const handleDeleteHorseCoatColor = async (horseCoatColorId: UUID) => {
        const result = await deleteHorseCoatColor(horseCoatColorId);
        if (result) {
            setHorseCoatColorModalOpen(false);
            setSelectedHorseCoatColor(null);
        }
    }

    const handleDeleteHorseOwner = async (horseOwnerId: UUID) => {
        const result = await deleteHorseOwner(horseOwnerId);
        if (result) {
            setHorseOwnerModalOpen(false);
            setSelectedHorseOwner(null);
        }
    }

    const handleDeleteHorseService = async (horseServiceId: UUID) => {
        const result = await deleteHorseService(horseServiceId);
        if (result) {
            setHorseServiceModalOpen(false);
            setSelectedHorseService(null);
        }
    }

    const filtersElements = (
        <HorsesHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
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

    return <>
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
            </>
        )}
        {activeTab === HorsesTabsKeys.DOCUMENTATION && (
            <>
                <HorsesDeveloperDocumentationView
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </>
        )}
        {activeTab === HorsesTabsKeys.INSTRUCTION && (
            <>
                <HorsesUserDocumentationView
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </>
        )}
    </>;
}
