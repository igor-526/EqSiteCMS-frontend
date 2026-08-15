import { useCallback, useMemo } from "react";
import type { UUID } from "crypto";
import type {
  HorseGetQueryParams,
  HorseOutDto,
  HorseWithPedigreeOutDto,
} from "@/types/api/horses";
import {
  findHorseInListById,
  toHorseWithPedigreeOrNull,
} from "../lib/horseSelection";

type ToastApi = {
  error: (options: { title: string; description?: string }) => void;
};

type UseHorsesPageHorseActionsParams = {
  horses: (HorseOutDto | HorseWithPedigreeOutDto)[];
  selectedHorse: HorseOutDto | HorseWithPedigreeOutDto | null;
  setSelectedHorse: React.Dispatch<
    React.SetStateAction<HorseOutDto | HorseWithPedigreeOutDto | null>
  >;
  setHorseModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setHorsePedigreeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setHorsePhotosModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getHorseDetail: (
    slugOrId: string,
    params?: HorseGetQueryParams,
  ) => Promise<HorseOutDto | HorseWithPedigreeOutDto | null>;
  loadHorses: () => void | Promise<void>;
  toast: ToastApi;
};

export const useHorsesPageHorseActions = ({
  horses,
  selectedHorse,
  setSelectedHorse,
  setHorseModalOpen,
  setHorsePedigreeModalOpen,
  setHorsePhotosModalOpen,
  getHorseDetail,
  loadHorses,
  toast,
}: UseHorsesPageHorseActionsParams) => {
  const selectedHorseWithPedigree = useMemo(
    () => toHorseWithPedigreeOrNull(selectedHorse),
    [selectedHorse],
  );

  const resolveHorseFromPedigreeRelation = useCallback(
    async (horse: HorseOutDto, requirePedigree = false) => {
      const tableHorse = findHorseInListById(horses, horse.id);
      if (tableHorse && (!requirePedigree || "pedigree" in tableHorse)) {
        return tableHorse;
      }
      return await getHorseDetail(horse.slug || horse.id.toString(), {
        pedigree: 1 as const,
      });
    },
    [getHorseDetail, horses],
  );

  const handleOpenHorseModal = useCallback(
    (horseId: UUID | null) => {
      if (horseId) {
        const horse = findHorseInListById(horses, horseId);
        if (horse) {
          setSelectedHorse(horse as HorseOutDto);
        } else {
          toast.error({
            title: "Лошадь не найдена. Попробуйте обновить страницу.",
          });
          setSelectedHorse(null);
          return;
        }
      } else {
        setSelectedHorse(null);
      }
      setHorseModalOpen(true);
    },
    [horses, setHorseModalOpen, setSelectedHorse, toast],
  );

  const handlePhotosClick = useCallback(
    (horseId: UUID) => {
      const horse = findHorseInListById(horses, horseId);
      if (horse) {
        setSelectedHorse(horse as HorseOutDto);
        setHorsePhotosModalOpen(true);
      }
    },
    [horses, setHorsePhotosModalOpen, setSelectedHorse],
  );

  const handlePedigreeClick = useCallback(
    (horseId: UUID) => {
      const horse = findHorseInListById(horses, horseId);
      if (!horse) {
        toast.error({
          title: "Лошадь не найдена. Попробуйте обновить страницу.",
        });
        return;
      }
      setSelectedHorse(horse);
      setHorsePedigreeModalOpen(true);
    },
    [horses, setHorsePedigreeModalOpen, setSelectedHorse, toast],
  );

  const handleHorseModalClose = useCallback(() => {
    setHorseModalOpen(false);
    setSelectedHorse(null);
  }, [setHorseModalOpen, setSelectedHorse]);

  const handleHorsePedigreeModalClose = useCallback(() => {
    setHorsePedigreeModalOpen(false);
    setSelectedHorse(null);
  }, [setHorsePedigreeModalOpen, setSelectedHorse]);

  const handleHorsePedigreeChanged = useCallback(() => {
    void loadHorses();
  }, [loadHorses]);

  const handleHorsePhotosModalClose = useCallback(() => {
    setHorsePhotosModalOpen(false);
  }, [setHorsePhotosModalOpen]);

  const handleEditFromPedigree = useCallback(
    async (horse: HorseOutDto) => {
      const resolvedHorse = await resolveHorseFromPedigreeRelation(horse);
      if (!resolvedHorse) {
        return;
      }
      setHorsePedigreeModalOpen(false);
      setSelectedHorse(resolvedHorse);
      setHorseModalOpen(true);
    },
    [
      resolveHorseFromPedigreeRelation,
      setHorseModalOpen,
      setHorsePedigreeModalOpen,
      setSelectedHorse,
    ],
  );

  const handleOpenPedigreeFromPedigree = useCallback(
    async (horse: HorseOutDto) => {
      const resolvedHorse = await resolveHorseFromPedigreeRelation(horse, true);
      if (!resolvedHorse || !("pedigree" in resolvedHorse)) {
        if (resolvedHorse) {
          toast.error({
            title: "Ошибка",
            description: "Не удалось загрузить родословную лошади",
          });
        }
        return;
      }
      setSelectedHorse(resolvedHorse);
      setHorsePedigreeModalOpen(true);
    },
    [
      resolveHorseFromPedigreeRelation,
      setHorsePedigreeModalOpen,
      setSelectedHorse,
      toast,
    ],
  );

  return {
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
  };
};
