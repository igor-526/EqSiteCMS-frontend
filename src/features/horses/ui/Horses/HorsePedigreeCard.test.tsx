import React from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import type { HorseOutDto } from "@/types/api/horses";
import type { UUID } from "crypto";
import {
  HorsePedigreeCard,
  getHorseBirthDateText,
  getHorsePhotoUrl,
} from "./HorsePedigreeCard";

const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix}` as UUID;

const horse = (overrides: Partial<HorseOutDto> = {}): HorseOutDto => ({
  id: uuid("000000000001"),
  slug: "stella",
  name: "Stella",
  pedigree_name: null,
  description: null,
  breed: {
    id: uuid("000000000002"),
    name: "Arabian",
    short_name: "AR",
    slug: "arabian",
  },
  coat_color: {
    id: uuid("000000000003"),
    name: "Серая",
    short_name: "Сер.",
    slug: "gray",
  },
  height: null,
  sex: "female",
  bdate: "2020-03-15",
  ddate: null,
  bdate_mode: "ymd",
  ddate_mode: "hide",
  bdate_formatted: null,
  ddate_formatted: null,
  age: null,
  horse_owner: null,
  photos: [],
  this_stable: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
  ...overrides,
});

describe("HorsePedigreeCard", () => {
  it("uses main photo before first available photo", () => {
    expect(
      getHorsePhotoUrl(
        horse({
          photos: [
            { id: uuid("000000000004"), is_main: false, url: "/first.jpg" },
            { id: uuid("000000000005"), is_main: true, url: "/main.jpg" },
          ],
        }),
      ),
    ).toBe("/main.jpg");
  });

  it("falls back from formatted date to date mode", () => {
    expect(
      getHorseBirthDateText(horse({ bdate_mode: "y", bdate: "2020-03-15" })),
    ).toBe("2020");
    expect(
      getHorseBirthDateText(horse({ bdate_mode: "ym", bdate: "2020-03-15" })),
    ).toBe("03.2020");
    expect(
      getHorseBirthDateText(horse({ bdate_mode: "hide", bdate: "2020-03-15" })),
    ).toBe("");
  });

  it("renders sex, coat, breed and placeholder without breaking card structure", () => {
    renderWithCmsProviders(<HorsePedigreeCard horse={horse()} label="Мать" />);

    expect(screen.getByText("Мать")).toBeInTheDocument();
    expect(screen.getByText("Stella ♀")).toBeInTheDocument();
    expect(screen.getByText("Кобыла · 15.03.2020")).toBeInTheDocument();
    expect(screen.getByText("Масть: Сер.")).toBeInTheDocument();
    expect(screen.getByText("Порода: AR")).toBeInTheDocument();
    expect(screen.getByTestId("horse-pedigree-card")).toBeInTheDocument();
  });

  it("renders geld marker as male sign plus m", () => {
    renderWithCmsProviders(
      <HorsePedigreeCard horse={horse({ sex: "geld", name: "Merin" })} />,
    );

    expect(screen.getByText("Merin ♂м")).toBeInTheDocument();
    expect(screen.getByText(/Мерин/)).toBeInTheDocument();
  });

  it("renders empty relation slot", () => {
    renderWithCmsProviders(
      <HorsePedigreeCard horse={null} emptyText="Не указан" />,
    );
    expect(screen.getByText("Не указан")).toBeInTheDocument();
    expect(screen.getByTestId("horse-pedigree-empty-card")).toBeInTheDocument();
  });
});
