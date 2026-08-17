import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HorsesTabsKeys } from "./HorsesTabs";
import { HorsesDeveloperDocumentationView } from "./HorsesDeveloperDocumentationView";

vi.mock("./HorsesTabs", async (importOriginal) => {
  const original = await importOriginal<typeof import("./HorsesTabs")>();
  return { ...original, HorsesTabs: () => <nav>Horse tabs</nav> };
});

const renderView = () =>
  render(
    <HorsesDeveloperDocumentationView
      activeTab={HorsesTabsKeys.DEVELOPER_DOCS}
      setActiveTab={vi.fn()}
    />,
  );

describe("HorsesDeveloperDocumentationView", () => {
  it("lists breed_groups and places its API section before breeds", () => {
    const { container } = renderView();
    expect(screen.getByText("breed_groups")).toBeVisible();
    const headings = Array.from(
      container.querySelectorAll("h2"),
      (node) => node.textContent,
    );
    expect(
      headings.findIndex((heading) => heading?.includes("breed-groups")),
    ).toBeLessThan(
      headings.findIndex((heading) => heading?.includes("/api/horses/breeds")),
    );
  });

  it("documents every group path and list/detail contract", () => {
    renderView();
    expect(
      screen.getAllByText("GET /api/horses/breed-groups").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("GET /api/horses/breed-groups/{slug_or_id}"),
    ).toBeVisible();
    expect(screen.getByText("POST /api/horses/breed-groups")).toBeVisible();
    expect(
      screen.getByText("PATCH /api/horses/breed-groups/{slug_or_id}"),
    ).toBeVisible();
    expect(
      screen.getByText("DELETE /api/horses/breed-groups/{slug_or_id}"),
    ).toBeVisible();
    expect(
      screen.getByText(/Detail lookup принимает slug или UUID/),
    ).toHaveTextContent("page_data=true");
    expect(
      screen.getByText(/Параметры списка:/).parentElement,
    ).toHaveTextContent("limit");
    expect(
      screen.getByText(/Параметры списка:/).parentElement,
    ).toHaveTextContent("updated_at");
  });

  it("documents DTO, auto-slug, partial PATCH and access outcomes", () => {
    renderView();
    expect(screen.getByText(/HorseBreedGroupCreateInDto/)).toHaveTextContent(
      "не входят в их response",
    );
    expect(screen.getByText(/Если slug при создании/)).toHaveTextContent(
      "генерируется автоматически",
    );
    expect(screen.getByText(/Если slug при создании/)).toHaveTextContent(
      "PATCH изменяет только",
    );
    const access = screen.getByText(/Access contract:/).parentElement;
    expect(access).toHaveTextContent("Public Read");
    expect(access).toHaveTextContent("X-Equestrian-Service-Key");
    expect(access).toHaveTextContent("SUPERUSER, ADMIN и DEVELOPER");
    expect(access).toHaveTextContent("HTTP 401");
    expect(access).toHaveTextContent("HTTP 403");
  });

  it("separates base responses from detail page_data responses", () => {
    renderView();
    const detailBehavior = screen
      .getAllByText("page_data")
      .find((element) =>
        element.closest("p")?.textContent?.includes("по умолчанию равен"),
      );
    expect(detailBehavior?.closest("p")).toHaveTextContent("false");
    expect(detailBehavior?.closest("p")).toHaveTextContent(
      "BreedGroupOutWithPageDataDto",
    );
    const responses = screen.getByText(/BreedGroupOutDto: list items/);
    expect(responses).toHaveTextContent("detail по умолчанию");
    expect(responses).toHaveTextContent(
      "BreedGroupOutWithPageDataDto: только detail GET с ?page_data=true",
    );
    const behavior = screen.getByText(/Список всегда содержит базовые DTO/);
    expect(behavior).toHaveTextContent("POST и PATCH");
    expect(behavior).toHaveTextContent("без page_data");
    expect(behavior).toHaveTextContent("HTTP 204 без тела");
  });

  it("documents the nullable breed-group relationship and SET NULL", () => {
    renderView();
    expect(screen.getByText(/breed_group_ids/)).toBeVisible();
    expect(screen.getByText("-group_name")).toBeVisible();
    const relation = screen
      .getAllByText("group")
      .find((element) =>
        element.closest("p")?.textContent?.includes("в ответе nullable"),
      );
    expect(relation?.closest("p")).toHaveTextContent("breed_group_id");
    expect(relation?.closest("p")).toHaveTextContent("omitted");
    expect(relation?.closest("p")).toHaveTextContent("ON DELETE SET NULL");
  });
});
