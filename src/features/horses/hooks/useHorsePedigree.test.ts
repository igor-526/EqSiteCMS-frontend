import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UUID } from "crypto";
import type { HorseOutDto, HorseWithPedigreeOutDto } from "@/types/api/horses";
import { API_STATUS } from "@/lib/apiStatus";
import {
  PEDIGREE_CANDIDATE_PAGE_SIZE,
  useHorsePedigree,
} from "./useHorsePedigree";

const serviceMocks = vi.hoisted(() => ({
  fetchAvailablePedigree: vi.fn(),
  fetchHorse: vi.fn(),
  fetchSetHorsePedigree: vi.fn(),
}));

const scopeMock = vi.hoisted(() => ({
  canUpdate: true,
}));

vi.mock("../services/horseService", () => serviceMocks);

vi.mock("./useHorseScopes", () => ({
  HORSES_PAGE_SCOPES_ACTIONS: {
    UPDATE_HORSE_PEDIGREE: "UPDATE_HORSE_PEDIGREE",
  },
  useHorsePageActionScopes: () => ({
    hasPermission: () => scopeMock.canUpdate,
  }),
}));

const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix}` as UUID;

const makeHorse = (overrides: Partial<HorseOutDto> = {}): HorseOutDto => ({
  id: uuid("000000000001"),
  slug: "atlas",
  name: "Atlas",
  pedigree_name: null,
  description: null,
  breed: null,
  coat_color: null,
  height: null,
  sex: "male",
  bdate: null,
  ddate: null,
  bdate_mode: "hide",
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

const makePedigreeHorse = (
  overrides: Partial<HorseWithPedigreeOutDto> = {},
): HorseWithPedigreeOutDto => ({
  ...makeHorse(),
  pedigree: {
    sire: null,
    dam: null,
    foals: [],
  },
  ...overrides,
});

const expectCandidateParamsUseLimitOffsetOnly = (
  params: Record<string, unknown>,
) => {
  expect(params).toHaveProperty("limit", PEDIGREE_CANDIDATE_PAGE_SIZE);
  expect(params).toHaveProperty("offset");
  expect(params).not.toHaveProperty("page");
  expect(params).not.toHaveProperty("pageSize");
  expect(params).not.toHaveProperty("page_size");
};

describe("useHorsePedigree", () => {
  beforeEach(() => {
    scopeMock.canUpdate = true;
    serviceMocks.fetchAvailablePedigree.mockReset();
    serviceMocks.fetchHorse.mockReset();
    serviceMocks.fetchSetHorsePedigree.mockReset();
    serviceMocks.fetchAvailablePedigree.mockResolvedValue({
      status: API_STATUS.OK,
      data: { total: 0, items: [] },
    });
    serviceMocks.fetchHorse.mockResolvedValue({
      status: API_STATUS.OK,
      data: makePedigreeHorse(),
    });
  });

  it("resets candidate offset on search and calls candidate service with limit/offset only", async () => {
    const selectedHorse = makePedigreeHorse();
    const { result } = renderHook(() => useHorsePedigree(selectedHorse, true));

    act(() => {
      result.current.openPicker({ mode: "children", action: "add" });
    });

    await waitFor(() =>
      expect(serviceMocks.fetchAvailablePedigree).toHaveBeenCalledTimes(1),
    );
    expect(serviceMocks.fetchAvailablePedigree).toHaveBeenLastCalledWith(
      selectedHorse.id,
      "children",
      { search: undefined, limit: PEDIGREE_CANDIDATE_PAGE_SIZE, offset: 0 },
    );
    expectCandidateParamsUseLimitOffsetOnly(
      serviceMocks.fetchAvailablePedigree.mock.calls.at(-1)?.[2],
    );

    act(() => {
      result.current.setCandidateOffset(20);
    });

    await waitFor(() =>
      expect(serviceMocks.fetchAvailablePedigree).toHaveBeenLastCalledWith(
        selectedHorse.id,
        "children",
        { search: undefined, limit: PEDIGREE_CANDIDATE_PAGE_SIZE, offset: 20 },
      ),
    );
    expectCandidateParamsUseLimitOffsetOnly(
      serviceMocks.fetchAvailablePedigree.mock.calls.at(-1)?.[2],
    );

    act(() => {
      result.current.setCandidateSearch("star");
    });

    expect(result.current.candidateOffset).toBe(0);
    await waitFor(() =>
      expect(serviceMocks.fetchAvailablePedigree).toHaveBeenLastCalledWith(
        selectedHorse.id,
        "children",
        { search: "star", limit: PEDIGREE_CANDIDATE_PAGE_SIZE, offset: 0 },
      ),
    );
    expectCandidateParamsUseLimitOffsetOnly(
      serviceMocks.fetchAvailablePedigree.mock.calls.at(-1)?.[2],
    );
  });

  it("surfaces 401 mutation denial and keeps picker open", async () => {
    const selectedHorse = makePedigreeHorse();
    const candidateId = uuid("000000000002");
    serviceMocks.fetchAvailablePedigree.mockResolvedValue({
      status: API_STATUS.OK,
      data: {
        total: 1,
        items: [makeHorse({ id: candidateId, name: "Candidate" })],
      },
    });
    serviceMocks.fetchSetHorsePedigree.mockResolvedValue({
      status: API_STATUS.ERROR,
      data: { detail: "Authentication failed" },
    });

    const { result } = renderHook(() => useHorsePedigree(selectedHorse, true));
    act(() => {
      result.current.openPicker({ mode: "sire", action: "add" });
    });
    await waitFor(() => expect(result.current.candidatesTotal).toBe(1));

    act(() => {
      result.current.setSelectedCandidateId(candidateId);
    });
    await act(async () => {
      await result.current.saveCandidate();
    });

    expect(serviceMocks.fetchSetHorsePedigree).toHaveBeenCalledWith(
      selectedHorse.id,
      {
        sire_id: candidateId,
      },
    );
    expect(result.current.operationError).toBe("Authentication failed");
    expect(result.current.pickerIntent).toEqual({
      mode: "sire",
      action: "add",
    });
  });

  it("surfaces 403 mutation denial without sending page based candidate params", async () => {
    const selectedHorse = makePedigreeHorse();
    const candidateId = uuid("000000000003");
    serviceMocks.fetchAvailablePedigree.mockResolvedValue({
      status: API_STATUS.OK,
      data: {
        total: 1,
        items: [makeHorse({ id: candidateId, name: "Forbidden Dam" })],
      },
    });
    serviceMocks.fetchSetHorsePedigree.mockResolvedValue({
      status: API_STATUS.ERROR,
      data: { detail: "Forbidden" },
    });

    const { result } = renderHook(() => useHorsePedigree(selectedHorse, true));
    act(() => {
      result.current.openPicker({ mode: "dam", action: "replace" });
    });
    await waitFor(() =>
      expect(serviceMocks.fetchAvailablePedigree).toHaveBeenCalled(),
    );

    expectCandidateParamsUseLimitOffsetOnly(
      serviceMocks.fetchAvailablePedigree.mock.calls.at(-1)?.[2],
    );

    act(() => {
      result.current.setSelectedCandidateId(candidateId);
    });
    await act(async () => {
      await result.current.saveCandidate();
    });

    expect(serviceMocks.fetchSetHorsePedigree).toHaveBeenCalledWith(
      selectedHorse.id,
      {
        dam_id: candidateId,
      },
    );
    expect(result.current.operationError).toBe("Forbidden");
    expect(result.current.pickerIntent).toEqual({
      mode: "dam",
      action: "replace",
    });
  });

  it("successful mutation refreshes opened modal pedigree and invalidates table", async () => {
    const candidateId = uuid("000000000004");
    const newSire = makeHorse({ id: candidateId, name: "New Sire" });
    const initialHorse = makePedigreeHorse({
      pedigree: {
        sire: null,
        dam: null,
        foals: [],
      },
    });
    const onChanged = vi.fn();
    serviceMocks.fetchAvailablePedigree.mockResolvedValue({
      status: API_STATUS.OK,
      data: {
        total: 1,
        items: [makeHorse({ id: candidateId, name: "New Sire" })],
      },
    });
    serviceMocks.fetchSetHorsePedigree.mockResolvedValue({
      status: API_STATUS.OK,
      data: null,
    });
    serviceMocks.fetchHorse.mockResolvedValue({
      status: API_STATUS.OK,
      data: makePedigreeHorse({
        pedigree: {
          sire: newSire,
          dam: null,
          foals: [],
        },
      }),
    });

    const { result } = renderHook(() =>
      useHorsePedigree(initialHorse, true, onChanged),
    );
    act(() => {
      result.current.openPicker({ mode: "sire", action: "add" });
    });
    await waitFor(() => expect(result.current.candidatesTotal).toBe(1));

    act(() => {
      result.current.setSelectedCandidateId(candidateId);
    });
    await act(async () => {
      await result.current.saveCandidate();
    });

    expect(onChanged).toHaveBeenCalledOnce();
    expect(serviceMocks.fetchHorse).toHaveBeenCalledWith("atlas", {
      pedigree: 1,
    });
    expect(result.current.pickerIntent).toBeNull();
    expect(result.current.horse?.pedigree.sire).toMatchObject({
      name: "New Sire",
    });
  });

  it("surfaces failed detail refresh after successful mutation and keeps picker open", async () => {
    const candidateId = uuid("000000000005");
    const initialHorse = makePedigreeHorse({
      pedigree: {
        sire: null,
        dam: null,
        foals: [],
      },
    });
    const onChanged = vi.fn();
    serviceMocks.fetchAvailablePedigree.mockResolvedValue({
      status: API_STATUS.OK,
      data: {
        total: 1,
        items: [makeHorse({ id: candidateId, name: "New Sire" })],
      },
    });
    serviceMocks.fetchSetHorsePedigree.mockResolvedValue({
      status: API_STATUS.OK,
      data: null,
    });
    serviceMocks.fetchHorse.mockResolvedValue({
      status: API_STATUS.ERROR,
      data: { detail: "Лошадь не найдена" },
    });

    const { result } = renderHook(() =>
      useHorsePedigree(initialHorse, true, onChanged),
    );
    act(() => {
      result.current.openPicker({ mode: "sire", action: "add" });
    });
    await waitFor(() => expect(result.current.candidatesTotal).toBe(1));

    act(() => {
      result.current.setSelectedCandidateId(candidateId);
    });
    await act(async () => {
      await result.current.saveCandidate();
    });

    expect(onChanged).toHaveBeenCalledOnce();
    expect(result.current.operationError).toBe("Лошадь не найдена");
    expect(result.current.pickerIntent).toEqual({
      mode: "sire",
      action: "add",
    });
    expect(result.current.horse?.pedigree.sire).toBeNull();
  });
});
