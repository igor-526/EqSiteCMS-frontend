import { PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, Empty } from "antd";
import React from "react";
import { HorseServiceRelationsTable } from "./HorseServiceRelationsTable";
import { HorseServiceRelationOutDto } from "@/types/api/horseServiceRelations";

export type HorseServiceRelationsDrawerProps = {
  open: boolean;
  onClose: () => void;
  horseName: string;
  relations: HorseServiceRelationOutDto[];
  loading: boolean;
  onAdd: () => void;
  onRowClick: (relation: HorseServiceRelationOutDto) => void;
  canMutate?: boolean;
};

export const HorseServiceRelationsDrawer: React.FC<
  HorseServiceRelationsDrawerProps
> = ({
  open,
  onClose,
  horseName,
  relations,
  loading,
  onAdd,
  onRowClick,
  canMutate = true,
}) => {
  return (
    <Drawer
      title={`Услуги: ${horseName}`}
      open={open}
      onClose={onClose}
      size="default"
      extra={
        canMutate ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Добавить
          </Button>
        ) : undefined
      }
    >
      {relations.length === 0 && !loading ? (
        <Empty description="Нет привязанных услуг">
          {canMutate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              Добавить услугу
            </Button>
          )}
        </Empty>
      ) : (
        <HorseServiceRelationsTable
          relations={relations}
          loading={loading}
          onRowClick={onRowClick}
          canMutate={canMutate}
        />
      )}
    </Drawer>
  );
};
