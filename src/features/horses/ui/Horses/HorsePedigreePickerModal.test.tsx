import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import type { HorseOutDto } from "@/types/api/horses";
import type { UUID } from "crypto";
import { HorsePedigreePickerModal } from "./HorsePedigreePickerModal";

const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix}` as UUID;

const candidate = (id: UUID, name: string): HorseOutDto => ({
  id,
  slug: name.toLowerCase(),
  name,
  code: null,
  description: null,
  breed: {
    id: uuid("000000000101"),
    name: "Breed",
    short_name: null,
    slug: "breed",
  },
  coat_color: {
    id: uuid("000000000102"),
    name: "Bay",
    short_name: null,
    slug: "bay",
  },
  height: null,
  sex: "female",
  bdate: "2022-01-01",
  ddate: null,
  bdate_mode: "y",
  ddate_mode: "hide",
  bdate_formatted: null,
  ddate_formatted: null,
  age: null,
  horse_owner: null,
  photos: [],
  this_stable: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
});

describe("HorsePedigreePickerModal", () => {
  it("renders search, count, empty state and disabled save without selected candidate", () => {
    renderWithCmsProviders(
      <HorsePedigreePickerModal
        open
        intent={{ mode: "children", action: "add" }}
        candidates={[]}
        total={0}
        loading={false}
        error={null}
        search=""
        onSearchChange={vi.fn()}
        offset={0}
        limit={10}
        onOffsetChange={vi.fn()}
        selectedCandidateId={null}
        onSelectCandidate={vi.fn()}
        onCancel={vi.fn()}
        onSave={vi.fn()}
        mutationLoading={false}
        operationError={null}
      />,
    );

    expect(screen.getByText("Выберите лошадь")).toBeInTheDocument();
    expect(screen.getByText("Добавить потомка")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Поиск")).toBeInTheDocument();
    expect(screen.getByText("Найдено: 0 лошадей")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ничего не найдено. Попробуйте изменить поисковый запрос",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сохранить" })).toBeDisabled();
  });

  it("selects a candidate by row click and keeps single result unselected before click", async () => {
    const onSelectCandidate = vi.fn();
    const candidateId = uuid("000000000201");
    const { rerender } = renderWithCmsProviders(
      <HorsePedigreePickerModal
        open
        intent={{ mode: "sire", action: "replace" }}
        candidates={[candidate(candidateId, "Stella")]}
        total={1}
        loading={false}
        error={null}
        search=""
        onSearchChange={vi.fn()}
        offset={0}
        limit={10}
        onOffsetChange={vi.fn()}
        selectedCandidateId={null}
        onSelectCandidate={onSelectCandidate}
        onCancel={vi.fn()}
        onSave={vi.fn()}
        mutationLoading={false}
        operationError={null}
      />,
    );

    expect(screen.getByRole("button", { name: "Сохранить" })).toBeDisabled();
    await userEvent.click(screen.getByText("Stella ♀"));
    expect(onSelectCandidate).toHaveBeenCalledWith(candidateId);

    rerender(
      <HorsePedigreePickerModal
        open
        intent={{ mode: "sire", action: "replace" }}
        candidates={[candidate(candidateId, "Stella")]}
        total={1}
        loading={false}
        error={null}
        search=""
        onSearchChange={vi.fn()}
        offset={0}
        limit={10}
        onOffsetChange={vi.fn()}
        selectedCandidateId={candidateId}
        onSelectCandidate={onSelectCandidate}
        onCancel={vi.fn()}
        onSave={vi.fn()}
        mutationLoading={false}
        operationError={null}
      />,
    );

    expect(screen.getByRole("button", { name: "Сохранить" })).toBeEnabled();
  });
});
