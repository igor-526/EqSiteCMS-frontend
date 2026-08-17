import { Alert, Button, Empty } from "antd";
import { Html5Outlined, SearchOutlined } from "@ant-design/icons";
import { MainTable, StringFilter } from "@/ui";
import type { HorseBreedGroupListQueryParams, HorseBreedGroupOutDto } from "@/types/api/horseBreedGroups";
import { HORSES_PAGE_SCOPES_ACTIONS, useHorsePageActionScopes } from "../../hooks/useHorseScopes";

export type HorseBreedGroupsTableProps = {
  horseBreedGroups: HorseBreedGroupOutDto[];
  loading: boolean;
  error: string | null;
  filters: HorseBreedGroupListQueryParams;
  setFilters: (value: HorseBreedGroupListQueryParams) => void;
  filtersElements?: React.ReactNode;
  onOpenModal: (id: string) => void;
  onOpenPageModal: (id: string) => void;
};

export const HorseBreedGroupsTable = ({ horseBreedGroups, loading, error, filters, setFilters, filtersElements, onOpenModal, onOpenPageModal }: HorseBreedGroupsTableProps) => {
  const { hasPermission } = useHorsePageActionScopes();
  const canUpdate = hasPermission(HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE_DICTIONARY);
  const filterColor = (value?: string | null) => value ? "#1677ff" : undefined;
  const columns = [
    { title: "Наименование", key: "name", dataIndex: "name", sorter: true,
      filterIcon: <SearchOutlined style={{ color: filterColor(filters.name) }} />,
      filterDropdown: <div style={{ padding: 8 }}><StringFilter value={filters.name ?? ""} onChange={(name) => setFilters({ ...filters, name, offset: 0 })} placeHolder="Поиск по наименованию" /></div> },
    { title: "Путь URL", key: "slug", dataIndex: "slug", sorter: true,
      filterIcon: <SearchOutlined style={{ color: filterColor(filters.slug) }} />,
      filterDropdown: <div style={{ padding: 8 }}><StringFilter value={filters.slug ?? ""} onChange={(slug) => setFilters({ ...filters, slug, offset: 0 })} placeHolder="Поиск по пути URL" /></div> },
    { title: "Действия", key: "actions", render: (_: unknown, rawRecord: Record<PropertyKey, unknown>) => {
      const record = rawRecord as HorseBreedGroupOutDto;
      if (!canUpdate) return null;
      const openPage = (event: React.MouseEvent) => { event.stopPropagation(); onOpenPageModal(String(record.id)); };
      return <Button aria-label={`Редактировать страницу ${record.name}`} onClick={openPage}><Html5Outlined /></Button>;
    } },
  ];
  if (error && !loading) return <><div>{filtersElements}</div><Alert type="error" showIcon message={error} /></>;
  if (!loading && horseBreedGroups.length === 0) return <><div>{filtersElements}</div><Empty description="Группы пород не найдены" /></>;
  return <MainTable сolumns={columns} data={horseBreedGroups.map((group) => ({ ...group, key: group.id.toString() }))} loading={loading}
    filtersElements={filtersElements} currentSort={filters.sort ?? undefined}
    onSortChange={(sort) => setFilters({ ...filters, sort: sort as HorseBreedGroupListQueryParams["sort"], offset: 0 })}
    onRow={(record) => ({ onClick: () => { if (canUpdate) onOpenModal(String(record.key)); } })} />;
};
