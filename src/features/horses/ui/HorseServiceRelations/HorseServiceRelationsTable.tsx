import { getPriceString } from "@/lib";
import { HorseServiceRelationOutDto } from "@/types/api/horseServiceRelations";
import { Table } from "antd";
import React from "react";

export type HorseServiceRelationsTableProps = {
  relations: HorseServiceRelationOutDto[];
  loading: boolean;
  onRowClick?: (relation: HorseServiceRelationOutDto) => void;
  canMutate?: boolean;
};

export const HorseServiceRelationsTable: React.FC<
  HorseServiceRelationsTableProps
> = ({ relations, loading, onRowClick, canMutate = true }) => {
  const columns = [
    {
      title: "Наименование",
      key: "name",
      dataIndex: "name",
      render: (name: string) => <span>{name}</span>,
    },
    {
      title: "Цена",
      key: "price",
      render: (record: HorseServiceRelationOutDto) => (
        <span>{getPriceString(record.price_formatter, record.price)}</span>
      ),
    },
  ];

  const handleRow =
    canMutate && onRowClick
      ? (record: HorseServiceRelationOutDto) => ({
          onClick: () => onRowClick(record),
          style: { cursor: "pointer" as const },
        })
      : undefined;

  return (
    <Table
      columns={columns}
      dataSource={relations.map((r) => ({ ...r, key: r.id.toString() }))}
      loading={loading}
      pagination={false}
      size="small"
      onRow={handleRow}
    />
  );
};
