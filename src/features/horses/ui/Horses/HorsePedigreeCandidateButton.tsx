import React, { useCallback } from "react";
import { Radio, Typography } from "antd";
import type { UUID } from "crypto";
import type { HorseOutDto } from "@/types/api/horses";
import {
  getHorseBirthDateText,
  getHorsePhotoUrl,
  getHorseSexMark,
  getHorseSexText,
} from "./HorsePedigreeCard";
import { useHorsePedigreeCandidateButtonStyles } from "./horsePedigreePickerModal.styles";

export type HorsePedigreeCandidateButtonProps = {
  candidate: HorseOutDto;
  selected: boolean;
  onSelect: (id: UUID) => void;
};

export const HorsePedigreeCandidateButton: React.FC<
  HorsePedigreeCandidateButtonProps
> = ({ candidate, selected, onSelect }) => {
  const { styles, cx } = useHorsePedigreeCandidateButtonStyles();
  const photoUrl = getHorsePhotoUrl(candidate);
  const birthDate = getHorseBirthDateText(candidate);
  const sexText = getHorseSexText(candidate.sex);
  const sexMark = getHorseSexMark(candidate.sex);
  const coatColor =
    candidate.coat_color?.short_name ?? candidate.coat_color?.name ?? "—";
  const breed = candidate.breed?.short_name ?? candidate.breed?.name ?? "—";

  const handleClick = useCallback(() => {
    onSelect(candidate.id);
  }, [candidate.id, onSelect]);

  const avatarStyle = photoUrl
    ? { background: `center / cover url("${photoUrl}")` }
    : undefined;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cx(
        styles.button,
        selected ? styles.buttonSelected : styles.buttonDefault,
      )}
    >
      <span
        className={cx(styles.avatar, !photoUrl && styles.avatarEmpty)}
        style={avatarStyle}
      >
        {!photoUrl ? candidate.name.slice(0, 1).toUpperCase() : ""}
      </span>
      <span className={styles.details}>
        <Typography.Text strong ellipsis className={styles.lineBlock}>
          {candidate.name} {sexMark}
        </Typography.Text>
        <Typography.Text type="secondary" className={styles.lineBlock}>
          {[sexText, birthDate].filter(Boolean).join(" · ")}
        </Typography.Text>
        <Typography.Text className={styles.lineBlock}>
          {coatColor} · {breed}
        </Typography.Text>
        {candidate.this_stable && (
          <Typography.Text type="secondary" className={styles.lineBlock}>
            В этой конюшне
          </Typography.Text>
        )}
      </span>
      <Radio checked={selected} />
    </button>
  );
};
