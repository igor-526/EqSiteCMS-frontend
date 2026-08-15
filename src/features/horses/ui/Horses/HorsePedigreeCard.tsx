import React from "react";
import { Avatar, Button, Dropdown, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import type { HorseDateMode, HorseOutDto, HorseSex } from "@/types/api/horses";

const SEX_LABELS: Record<HorseSex, string> = {
  male: "Жеребец",
  female: "Кобыла",
  geld: "Мерин",
};

const SEX_MARKS: Record<HorseSex, string> = {
  male: "♂",
  female: "♀",
  geld: "♂м",
};

export const getHorsePhotoUrl = (
  horse: Pick<HorseOutDto, "photos"> | null | undefined,
) => {
  const photos = horse?.photos ?? [];
  return (
    photos.find((photo) => photo.is_main && photo.url)?.url ??
    photos.find((photo) => photo.url)?.url ??
    null
  );
};

const formatDateByMode = (bdate: string | null, mode: HorseDateMode) => {
  if (!bdate || mode === "hide") return "";
  const [year, month, day] = bdate.split("-");
  if (mode === "y") return year ?? "";
  if (mode === "ym") return [month, year].filter(Boolean).join(".");
  return [day, month, year].filter(Boolean).join(".");
};

export const getHorseBirthDateText = (
  horse: Pick<HorseOutDto, "bdate" | "bdate_formatted" | "bdate_mode">,
) => horse.bdate_formatted || formatDateByMode(horse.bdate, horse.bdate_mode);

export const getHorseSexText = (sex?: HorseSex | null) =>
  sex ? (SEX_LABELS[sex] ?? "") : "";
export const getHorseSexMark = (sex?: HorseSex | null) =>
  sex ? (SEX_MARKS[sex] ?? "") : "";

export type HorsePedigreeCardProps = {
  horse: HorseOutDto | null;
  label?: string;
  emptyText?: string;
  menuItems?: MenuProps["items"];
  onMenuClick?: MenuProps["onClick"];
  loading?: boolean;
  extraLine?: string;
  compact?: boolean;
  selected?: boolean;
};

export const HorsePedigreeCard: React.FC<HorsePedigreeCardProps> = ({
  horse,
  label,
  emptyText = "Не указано",
  menuItems,
  onMenuClick,
  loading,
  extraLine,
  compact = false,
  selected = false,
}) => {
  const photoUrl = getHorsePhotoUrl(horse);
  const birthDate = horse ? getHorseBirthDateText(horse) : "";
  const sexText = getHorseSexText(horse?.sex);
  const sexMark = getHorseSexMark(horse?.sex);
  const coatColor =
    horse?.coat_color?.short_name ?? horse?.coat_color?.name ?? "—";
  const breed = horse?.breed?.short_name ?? horse?.breed?.name ?? "—";

  return (
    <div style={{ minWidth: compact ? 220 : 240 }}>
      {label && (
        <Typography.Text
          strong
          style={{ display: "block", marginBottom: 8, textAlign: "center" }}
        >
          {label}
        </Typography.Text>
      )}
      <div
        data-testid={
          horse ? "horse-pedigree-card" : "horse-pedigree-empty-card"
        }
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "56px minmax(0, 1fr) auto",
          gap: 12,
          alignItems: "center",
          minHeight: compact ? 104 : 118,
          padding: 12,
          border: selected ? "2px solid #1677ff" : "1px solid #d9d9d9",
          borderRadius: 8,
          background: horse ? "#fff" : "#fafafa",
        }}
      >
        <Avatar
          src={photoUrl ?? undefined}
          size={56}
          shape="square"
          style={{
            flexShrink: 0,
            background: "#f0f0f0",
            color: "#8c8c8c",
            borderRadius: 6,
          }}
        >
          {horse ? horse.name.slice(0, 1).toUpperCase() : "—"}
        </Avatar>

        <div style={{ minWidth: 0 }}>
          {horse ? (
            <>
              <Typography.Text strong ellipsis style={{ display: "block" }}>
                {horse.name} {sexMark}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ display: "block" }}>
                {[sexText, birthDate].filter(Boolean).join(" · ")}
              </Typography.Text>
              <Typography.Text style={{ display: "block" }}>
                Масть: {coatColor}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ display: "block" }}>
                Порода: {breed}
              </Typography.Text>
              {extraLine && (
                <Typography.Text type="secondary" style={{ display: "block" }}>
                  {extraLine}
                </Typography.Text>
              )}
            </>
          ) : (
            <>
              <Typography.Text strong style={{ display: "block" }}>
                {emptyText}
              </Typography.Text>
              <Typography.Text type="secondary">—</Typography.Text>
            </>
          )}
        </div>

        {menuItems && menuItems.length > 0 ? (
          <Dropdown
            menu={{ items: menuItems, onClick: onMenuClick }}
            trigger={["click"]}
            disabled={loading}
          >
            <Button
              aria-label="Действия"
              type="text"
              icon={<MoreOutlined />}
              loading={loading}
            />
          </Dropdown>
        ) : (
          <Space style={{ width: 32 }} />
        )}
      </div>
    </div>
  );
};
