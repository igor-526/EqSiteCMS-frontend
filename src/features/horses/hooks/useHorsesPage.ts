"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HorseServiceCreateInDto,
  HorseServiceUpdateInDto,
} from "@/types/api/horseServices";
import {
  HorseOwnerCreateInDto,
  HorseOwnerUpdateInDto,
} from "@/types/api/horseOwners";
import {
  HorseCoatColorCreateInDto,
  HorseCoatColorUpdateInDto,
} from "@/types/api/horseCoatColor";
import {
  HorseBreedCreateInDto,
  HorseBreedUpdateInDto,
} from "@/types/api/horseBreeds";
import { HorsesTabsKeys } from "@/features/horses/ui/HorsesTabs";
import { useHorseServiceRelations } from "@/features/horses/hooks/useHorseServiceRelations";
import { useHorseBreeds } from "@/features/horses/hooks/useHorseBreeds";
import { useHorseCoatColors } from "@/features/horses/hooks/useHorseCoatColors";
import { useHorseOwners } from "@/features/horses/hooks/useHorseOwners";
import { useHorseServices } from "@/features/horses/hooks/useHorseServices";
import { useHorses } from "@/features/horses/hooks/useHorses";
import { useHorsesPageHorseActions } from "@/features/horses/hooks/useHorsesPageHorseActions";
import { useHorsesPageModalState } from "@/features/horses/hooks/useHorsesPageModalState";
import { UUID } from "crypto";
import { useNotification } from "@/hooks/useNotification";
import { useDebounce } from "@/hooks/useDebounce";
import {
  fetchBreedPageData,
  saveBreedPageData,
} from "@/features/pageEditor/services/breedPageDataService";
import {
  fetchCoatColorPageData,
  saveCoatColorPageData,
} from "@/features/pageEditor/services/coatColorPageDataService";
import {
  fetchHorseServicePageData,
  saveHorseServicePageData,
} from "@/features/pageEditor/services/horseServicePageDataService";
import { usePhotoSelector } from "@/features/photoSelector/hooks/usePhotoSelector";
import { PhotoUpdateEntityInDto } from "@/types/api/photos";
import {
  HORSES_PAGE_SCOPES_ACTIONS,
  HORSE_SERVICE_SCOPES_ACTIONS,
  useHorsePageActionScopes,
  useHorseServicePageActionScopes,
} from "@/features/horses/hooks/useHorseScopes";

export function useHorsesPage() {
  const [activeTab, setActiveTab] = useState<HorsesTabsKeys>(
    HorsesTabsKeys.HORSES,
  );

  const modalState = useHorsesPageModalState();
  const {
    horseModalOpen,
    setHorseModalOpen,
    selectedHorse,
    setSelectedHorse,
    horsePhotosModalOpen,
    setHorsePhotosModalOpen,
    horsePedigreeModalOpen,
    setHorsePedigreeModalOpen,
    horseBreedModalOpen,
    setHorseBreedModalOpen,
    horseCoatColorModalOpen,
    setHorseCoatColorModalOpen,
    horseOwnerModalOpen,
    setHorseOwnerModalOpen,
    horseServiceModalOpen,
    setHorseServiceModalOpen,
    horseBreedPageModalOpen,
    setHorseBreedPageModalOpen,
    horseCoatColorPageModalOpen,
    setHorseCoatColorPageModalOpen,
    horseServicePageModalOpen,
    setHorseServicePageModalOpen,
    selectedHorseBreed,
    setSelectedHorseBreed,
    selectedHorseCoatColor,
    setSelectedHorseCoatColor,
    selectedHorseOwner,
    setSelectedHorseOwner,
    selectedHorseService,
    setSelectedHorseService,
  } = modalState;

  const toast = useNotification();
  const { hasPermission } = useHorsePageActionScopes();
  const { hasPermission: hasHorseServicePermission } =
    useHorseServicePageActionScopes();
  const canCreateDictionary = hasPermission(
    HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE_DICTIONARY,
  );
  const canUpdateDictionary = hasPermission(
    HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE_DICTIONARY,
  );
  const canDeleteDictionary = hasPermission(
    HORSES_PAGE_SCOPES_ACTIONS.DELETE_HORSE_DICTIONARY,
  );
  const canCreateHorseService = hasHorseServicePermission(
    HORSE_SERVICE_SCOPES_ACTIONS.CREATE_HORSE_SERVICE,
  );
  const canUpdateHorseServiceName = hasHorseServicePermission(
    HORSE_SERVICE_SCOPES_ACTIONS.UPDATE_HORSE_SERVICE_NAME,
  );
  const canUpdateHorseService = hasHorseServicePermission(
    HORSE_SERVICE_SCOPES_ACTIONS.UPDATE_HORSE_SERVICE,
  );
  const canDeleteHorseService = hasHorseServicePermission(
    HORSE_SERVICE_SCOPES_ACTIONS.DELETE_HORSE_SERVICE,
  );
  const canManageHorseServices =
    hasPermission(HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE) ||
    hasPermission(HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE);

  const {
    horses,
    horsesTotal,
    horsesLoading,
    horsesError,
    horsesFilters,
    setHorses,
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

  // Server-side search state for modal selectors
  const [coatColorSearch, setCoatColorSearch] = useState("");
  const [breedSearch, setBreedSearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const debouncedCoatColorSearch = useDebounce(coatColorSearch, 300);
  const debouncedBreedSearch = useDebounce(breedSearch, 300);
  const debouncedOwnerSearch = useDebounce(ownerSearch, 300);
  const [serviceFilterSearch, setServiceFilterSearch] = useState("");
  const debouncedServiceFilterSearch = useDebounce(serviceFilterSearch, 300);

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

  const refreshHorseInList = useCallback(
    async (horseId: UUID) => {
      const updated = await getHorseDetail(horseId.toString(), { pedigree: 1 });
      if (updated) {
        setHorses((prev) => prev.map((h) => (h.id === horseId ? updated : h)));
      }
    },
    [getHorseDetail, setHorses],
  );

  const {
    drawerOpen: serviceRelationsDrawerOpen,
    selectedHorseId: selectedHorseForServicesId,
    selectedHorseName: selectedHorseForServicesName,
    relations: serviceRelations,
    relationsLoading: serviceRelationsLoading,
    modalOpen: serviceRelationModalOpen,
    selectedRelation: selectedServiceRelation,
    validationErrors: serviceRelationValidationErrors,
    availableServices,
    availableServicesLoading,
    openDrawer: openServiceRelationsDrawer,
    closeDrawer: closeServiceRelationsDrawer,
    openCreateModal: openServiceRelationCreateModal,
    openUpdateModal: openServiceRelationUpdateModal,
    closeModal: closeServiceRelationModal,
    resetValidation: resetServiceRelationValidation,
    createRelation: createServiceRelation,
    updateRelation: updateServiceRelation,
    deleteRelation: deleteServiceRelation,
    loadAvailableServices,
    submitting: serviceRelationSubmitting,
  } = useHorseServiceRelations(refreshHorseInList);

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
  const breedFilterOptions = horseBreedSelectorOptions.map((breed) => ({
    label: breed.name,
    value: breed.id.toString(),
  }));
  const coatColorFilterOptions = horseCoatColors.map((coatColor) => ({
    label: coatColor.name,
    value: coatColor.id.toString(),
  }));
  const ownerFilterOptions = horseOwners.map((owner) => ({
    label: owner.name,
    value: owner.id.toString(),
  }));
  const serviceFilterOptions = horseServices.map((service) => ({
    label: service.name,
    value: service.id.toString(),
  }));

  const {
    selectedHorseWithPedigree,
    handleOpenHorseModal,
    handlePhotosClick,
    handlePedigreeClick,
    handleHorseModalClose,
    handleHorsePedigreeModalClose,
    handleHorsePedigreeChanged,
    handleHorsePhotosModalClose,
    handleEditFromPedigree,
    handleOpenPedigreeFromPedigree,
  } = useHorsesPageHorseActions({
    horses,
    selectedHorse,
    setSelectedHorse,
    setHorseModalOpen,
    setHorsePedigreeModalOpen,
    setHorsePhotosModalOpen,
    getHorseDetail,
    loadHorses,
    toast,
  });

  const handleCreateHorse = async (
    createData: Parameters<typeof createHorse>[0],
  ): Promise<boolean> => {
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

  const handleUpdateHorsePhotos = async (
    updateData: PhotoUpdateEntityInDto,
  ) => {
    if (!selectedHorse?.id) return;
    const updatedHorse = await updateHorsePhotos(selectedHorse.id, updateData);
    if (updatedHorse) {
      setSelectedHorse((prev) =>
        prev && "pedigree" in prev
          ? { ...prev, ...updatedHorse }
          : updatedHorse,
      );
    }
  };

  // ---- Breed handlers ----
  const handleOpenHorseBreedModal = (horseBreedId: UUID | null) => {
    if (horseBreedId ? !canUpdateDictionary : !canCreateDictionary) return;
    if (horseBreedId) {
      const horseBreed = horseBreeds.find(
        (horseBreed) => horseBreed.id === horseBreedId,
      );
      if (horseBreed) {
        setSelectedHorseBreed(horseBreed);
      } else {
        toast.error({
          title:
            "Порода не найдена. Попобуйте обновить страницу и повторить попытку.",
        });
        setSelectedHorseBreed(null);
        return;
      }
    } else {
      setSelectedHorseBreed(null);
    }
    setHorseBreedModalOpen(true);
  };

  const handleOpenHorseBreedPageModal = (horseBreedId: UUID | null) => {
    if (horseBreedId) {
      const horseBreed = horseBreeds.find(
        (horseBreed) => horseBreed.id === horseBreedId,
      );
      if (horseBreed) {
        setSelectedHorseBreed(horseBreed);
      } else {
        toast.error({
          title:
            "Порода не найдена. Попобуйте обновить страницу и повторить попытку.",
        });
        setSelectedHorseBreed(null);
        return;
      }
    } else {
      setSelectedHorseBreed(null);
    }
    setHorseBreedPageModalOpen(true);
  };

  const handleOpenHorseCoatColorModal = (horseCoatColorId: UUID | null) => {
    if (horseCoatColorId ? !canUpdateDictionary : !canCreateDictionary) return;
    if (horseCoatColorId) {
      const horseCoatColor = horseCoatColors.find(
        (horseCoatColor) => horseCoatColor.id === horseCoatColorId,
      );
      if (horseCoatColor) {
        setSelectedHorseCoatColor(horseCoatColor);
      } else {
        toast.error({
          title:
            "Масть не найдена. Попобуйте обновить страницу и повторить попытку.",
        });
        setSelectedHorseCoatColor(null);
        return;
      }
    } else {
      setSelectedHorseCoatColor(null);
    }
    setHorseCoatColorModalOpen(true);
  };

  const handleOpenHorseCoatColorPageModal = (horseCoatColorId: UUID | null) => {
    if (horseCoatColorId) {
      const horseCoatColor = horseCoatColors.find(
        (horseCoatColor) => horseCoatColor.id === horseCoatColorId,
      );
      if (horseCoatColor) {
        setSelectedHorseCoatColor(horseCoatColor);
      } else {
        toast.error({
          title:
            "Масть не найдена. Попобуйте обновить страницу и повторить попытку.",
        });
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
      const horseOwner = horseOwners.find(
        (horseOwner) => horseOwner.id === horseOwnerId,
      );
      if (horseOwner) {
        setSelectedHorseOwner(horseOwner);
      } else {
        toast.error({
          title:
            "Владелец не найден. Попобуйте обновить страницу и повторить попытку.",
        });
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
      const horseService = horseServices.find(
        (horseService) => horseService.id === horseServiceId,
      );
      if (horseService) {
        setSelectedHorseService(horseService);
      } else {
        toast.error({
          title:
            "Услуга не найдена. Попобуйте обновить страницу и повторить попытку.",
        });
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
      const horseService = horseServices.find(
        (horseService) => horseService.id === horseServiceId,
      );
      if (horseService) {
        setSelectedHorseService(horseService);
      } else {
        toast.error({
          title:
            "Услуга не найдена. Попобуйте обновить страницу и повторить попытку.",
        });
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

  const handleCreateHorseCoatColor = async (
    createData: HorseCoatColorCreateInDto,
  ) => {
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

  const handleCreateHorseService = async (
    createData: HorseServiceCreateInDto,
  ) => {
    const result = await createHorseService(createData);
    if (result) {
      setHorseServiceModalOpen(false);
      setSelectedHorseService(null);
    }
  };

  const handleUpdateHorseBreed = async (
    horseBreedId: UUID,
    updateData: HorseBreedUpdateInDto,
  ) => {
    const result = await updateHorseBreed(horseBreedId, updateData);
    if (result) {
      setHorseBreedModalOpen(false);
      setSelectedHorseBreed(null);
    }
  };

  const handleUpdateHorseCoatColor = async (
    horseCoatColorId: UUID,
    updateData: HorseCoatColorUpdateInDto,
  ) => {
    const result = await updateHorseCoatColor(horseCoatColorId, updateData);
    if (result) {
      setHorseCoatColorModalOpen(false);
      setSelectedHorseCoatColor(null);
    }
  };

  const handleUpdateHorseOwner = async (
    horseOwnerId: UUID,
    updateData: HorseOwnerUpdateInDto,
  ) => {
    const result = await updateHorseOwner(horseOwnerId, updateData);
    if (result) {
      setHorseOwnerModalOpen(false);
      setSelectedHorseOwner(null);
    }
  };

  const handleUpdateHorseService = async (
    horseServiceId: UUID,
    updateData: HorseServiceUpdateInDto,
  ) => {
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

  const handleServicesClick = (horseId: UUID) => {
    const horse = horses.find((h) => h.id === horseId);
    if (horse) {
      openServiceRelationsDrawer(horseId, horse.name);
    }
  };

  const handleSearchAvailableServices = (search: string) => {
    if (serviceRelationsDrawerOpen && selectedHorseForServicesId) {
      loadAvailableServices(selectedHorseForServicesId, search);
    }
  };


  // Sync debounced search queries with hook filters
  useEffect(() => {
    setHorseCoatColorsFilters((prev) => ({
      ...prev,
      name: debouncedCoatColorSearch || undefined,
    }));
  }, [debouncedCoatColorSearch, setHorseCoatColorsFilters]);

  useEffect(() => {
    loadHorseBreedSelectorOptions(null, debouncedBreedSearch || undefined);
  }, [debouncedBreedSearch, loadHorseBreedSelectorOptions]);

  useEffect(() => {
    setHorseOwnersFilters((prev) => ({
      ...prev,
      name: debouncedOwnerSearch || undefined,
    }));
  }, [debouncedOwnerSearch, setHorseOwnersFilters]);

  useEffect(() => {
    setHorseServicesFilters((prev) => ({
      ...prev,
      name: debouncedServiceFilterSearch || undefined,
    }));
  }, [debouncedServiceFilterSearch, setHorseServicesFilters]);

  const breedModalOptions = useMemo(() => {
    const base = horseBreedSelectorOptions.map((breed) => ({
      label: breed.name,
      value: breed.id.toString(),
    }));
    const selectedBreed = selectedHorse?.breed;
    if (selectedBreed) {
      const exists = base.some(
        (opt) => opt.value === selectedBreed.id.toString(),
      );
      if (!exists) {
        return [
          { label: selectedBreed.name, value: selectedBreed.id.toString() },
          ...base,
        ];
      }
    }
    return base;
  }, [horseBreedSelectorOptions, selectedHorse]);
  const coatColorModalOptions = useMemo(() => {
    const base = horseCoatColors.map((coatColor) => ({
      label: coatColor.name,
      value: coatColor.id.toString(),
    }));
    const selectedCoatColor = selectedHorse?.coat_color;
    if (selectedCoatColor) {
      const exists = base.some(
        (opt) => opt.value === selectedCoatColor.id.toString(),
      );
      if (!exists) {
        return [
          {
            label: selectedCoatColor.name,
            value: selectedCoatColor.id.toString(),
          },
          ...base,
        ];
      }
    }
    return base;
  }, [horseCoatColors, selectedHorse]);
  const ownerModalOptions = useMemo(() => {
    const base = horseOwners.map((owner) => ({
      label: owner.name,
      value: owner.id.toString(),
    }));
    const selectedOwner = selectedHorse?.horse_owner;
    if (selectedOwner) {
      const exists = base.some(
        (opt) => opt.value === selectedOwner.id.toString(),
      );
      if (!exists) {
        return [
          { label: selectedOwner.name, value: selectedOwner.id.toString() },
          ...base,
        ];
      }
    }
    return base;
  }, [horseOwners, selectedHorse]);

  return {
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
    setSelectedHorse,
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
  };
}
