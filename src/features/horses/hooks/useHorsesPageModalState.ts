import { useState } from "react";
import type { HorseBreedOutDto } from "@/types/api/horseBreeds";
import type { HorseCoatColorOutDto } from "@/types/api/horseCoatColor";
import type { HorseOwnerOutDto } from "@/types/api/horseOwners";
import type { HorseServiceOutDto } from "@/types/api/horseServices";
import type { HorseOutDto, HorseWithPedigreeOutDto } from "@/types/api/horses";

export function useHorsesPageModalState() {
  const [horseModalOpen, setHorseModalOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<
    HorseOutDto | HorseWithPedigreeOutDto | null
  >(null);
  const [horsePhotosModalOpen, setHorsePhotosModalOpen] = useState(false);
  const [horsePedigreeModalOpen, setHorsePedigreeModalOpen] = useState(false);
  const [horseBreedModalOpen, setHorseBreedModalOpen] = useState(false);
  const [horseCoatColorModalOpen, setHorseCoatColorModalOpen] = useState(false);
  const [horseOwnerModalOpen, setHorseOwnerModalOpen] = useState(false);
  const [horseServiceModalOpen, setHorseServiceModalOpen] = useState(false);
  const [horseBreedPageModalOpen, setHorseBreedPageModalOpen] = useState(false);
  const [horseCoatColorPageModalOpen, setHorseCoatColorPageModalOpen] =
    useState(false);
  const [horseServicePageModalOpen, setHorseServicePageModalOpen] =
    useState(false);
  const [selectedHorseBreed, setSelectedHorseBreed] =
    useState<HorseBreedOutDto | null>(null);
  const [selectedHorseCoatColor, setSelectedHorseCoatColor] =
    useState<HorseCoatColorOutDto | null>(null);
  const [selectedHorseOwner, setSelectedHorseOwner] =
    useState<HorseOwnerOutDto | null>(null);
  const [selectedHorseService, setSelectedHorseService] =
    useState<HorseServiceOutDto | null>(null);

  return {
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
  };
}
