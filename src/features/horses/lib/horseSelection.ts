import type { HorseOutDto, HorseWithPedigreeOutDto } from "@/types/api/horses";
import type { UUID } from "crypto";

export function findHorseInListById(
  horses: (HorseOutDto | HorseWithPedigreeOutDto)[],
  horseId: UUID,
): HorseOutDto | HorseWithPedigreeOutDto | undefined {
  return horses.find((horse) => horse.id === horseId);
}

export function toHorseWithPedigreeOrNull(
  selectedHorse: HorseOutDto | HorseWithPedigreeOutDto | null,
): HorseWithPedigreeOutDto | null {
  if (selectedHorse && "pedigree" in selectedHorse) {
    return selectedHorse;
  }
  return null;
}
