import { trimText } from "@/lib";
import {
  HorseBreedListQueryParams,
  HorseBreedOutDto,
} from "@/types/api/horseBreeds";
import { ListFilter, MainTable, StringFilter } from "@/ui";
import { Html5Outlined, SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { UUID } from "crypto";
import React from "react";
import {
  HORSES_PAGE_SCOPES_ACTIONS,
  useHorsePageActionScopes,
} from "../../hooks/useHorseScopes";

const KIND_LABELS: Record<string, string> = {
  horse: "Лошадь",
  pony: "Пони",
};

const KIND_OPTIONS = [
  { key: "horse", label: "Лошадь", value: "horse" },
  { key: "pony", label: "Пони", value: "pony" },
];

const FILTER_ACTIVE_COLOR = "#1677ff";
const SLUG_MAX_LENGTH = 40;
const TYPEOF_FUNCTION_STR = "function";

export type HorseBreedsTableProps = {
  horseBreeds: HorseBreedOutDto[];
  loading: boolean;
  filters: HorseBreedListQueryParams;
  setFilters: (filters: HorseBreedListQueryParams) => void;
  filtersElements: React.ReactNode;
  onOpenHorseBreedModal: (horseBreedId: UUID) => void;
  onOpenHorseBreedPageModal: (horseBreedId: UUID) => void;
};

export const HorseBreedsTable: React.FC<HorseBreedsTableProps> = ({
  horseBreeds,
  loading,
  filters,
  setFilters,
  filtersElements,
  onOpenHorseBreedModal,
  onOpenHorseBreedPageModal,
}) => {
  const { hasPermission } = useHorsePageActionScopes();
  const canUpdateDictionary = hasPermission(
    HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE_DICTIONARY,
  );
  const tableData = horseBreeds.map((horseBreed) => ({
    key: horseBreed.id.toString(),
    ...horseBreed,
  }));

  const handleSortChange = (sort: string[]) => {
    setFilters({
      ...filters,
      sort: sort as HorseBreedListQueryParams["sort"],
      offset: 0,
    });
  };

  const getFilterIconColor = (value: unknown): string | undefined =>
    (Array.isArray(value) ? value.length > 0 : Boolean(value))
      ? FILTER_ACTIVE_COLOR
      : undefined;

  const handleNameChange = (value: string | undefined) => {
    setFilters({ ...filters, name: value, offset: 0 });
  };

  const handleShortNameChange = (value: string | undefined) => {
    setFilters({ ...filters, short_name: value || undefined, offset: 0 });
  };

  const handleDescriptionChange = (value: string | undefined) => {
    setFilters({ ...filters, description: value, offset: 0 });
  };

  const handleSlugChange = (value: string | undefined) => {
    setFilters({ ...filters, slug: value, offset: 0 });
  };

  const handleKindSetFilters = (
    value:
      | HorseBreedListQueryParams
      | ((prev: HorseBreedListQueryParams) => HorseBreedListQueryParams),
  ) => {
    const resolved = typeof value === "function" ? value(filters) : value;
    setFilters({ ...resolved, offset: 0 });
  };

  const columns = [
    {
      title: "Наименование",
      key: "name",
      dataIndex: "name",
      sorter: true,
      render: (name: string) => <span>{name}</span>,
      filterIcon: (
        <SearchOutlined style={{ color: getFilterIconColor(filters.name) }} />
      ),
      filterDropdown: (
        <>
          <div style={{ padding: 8 }}>
            <StringFilter
              value={filters.name ?? ""}
              onChange={handleNameChange}
              placeHolder="Поиск по наименованию"
            />
          </div>
        </>
      ),
    },
    {
      title: "Кор. наим.",
      key: "short_name",
      dataIndex: "short_name",
      sorter: true,
      render: (shortName: string) => <span>{shortName}</span>,
      filterIcon: (
        <SearchOutlined
          style={{ color: getFilterIconColor(filters.short_name) }}
        />
      ),
      filterDropdown: (
        <div style={{ padding: 8 }}>
          <StringFilter
            value={filters.short_name ?? ""}
            onChange={handleShortNameChange}
            placeHolder="Поиск по короткому наименованию"
          />
        </div>
      ),
    },
    {
      title: "Описание",
      key: "description",
      dataIndex: "description",
      render: (description: string | null) => <span>{description}</span>,
      filterIcon: (
        <SearchOutlined
          style={{ color: getFilterIconColor(filters.description) }}
        />
      ),
      filterDropdown: (
        <>
          <div style={{ padding: 8 }}>
            <StringFilter
              value={filters.description ?? ""}
              onChange={handleDescriptionChange}
              placeHolder="Поиск по описанию"
            />
          </div>
        </>
      ),
    },
    {
      title: "Тип",
      key: "kind",
      dataIndex: "kind",
      sorter: true,
      render: (kind: string) => <span>{KIND_LABELS[kind] ?? kind}</span>,
      filterIcon: (
        <SearchOutlined style={{ color: getFilterIconColor(filters.kind) }} />
      ),
      filterDropdown: (
        <div style={{ padding: 8, minWidth: 200 }}>
          <ListFilter
            filters={filters}
            setFilters={handleKindSetFilters}
            filterKey="kind"
            filterData={KIND_OPTIONS}
            placeHolder="Тип"
          />
        </div>
      ),
    },
    {
      title: "Путь URL",
      key: "slug",
      dataIndex: "slug",
      sorter: true,
      render: (slug: string) => (
        <span className="text-blue-900 text-sm">
          {trimText(slug, SLUG_MAX_LENGTH)}
        </span>
      ),
      filterIcon: (
        <SearchOutlined style={{ color: getFilterIconColor(filters.slug) }} />
      ),
      filterDropdown: (
        <>
          <div style={{ padding: 8 }}>
            <StringFilter
              value={filters.slug ?? ""}
              onChange={handleSlugChange}
              placeHolder="Поиск по пути URL"
            />
          </div>
        </>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (record: HorseBreedOutDto) => {
        const handlePageModalClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          onOpenHorseBreedPageModal(record.id);
        };
        return (
          <div className="flex gap-2">
            <Button onClick={handlePageModalClick}>
              <Html5Outlined />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <MainTable
      сolumns={columns}
      data={tableData}
      loading={loading}
      filtersElements={filtersElements}
      onSortChange={handleSortChange}
      currentSort={filters.sort ?? undefined}
      onRow={(record) => ({
        onClick: () => {
          if (canUpdateDictionary) onOpenHorseBreedModal(record.key as UUID);
        },
      })}
    />
  );
};
