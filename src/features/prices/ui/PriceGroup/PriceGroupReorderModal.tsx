"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import {
  CloseOutlined,
  SaveOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PriceOutDto } from "@/types/api/prices";
import { PriceGroupReorderItemInDto } from "@/types/api/priceGroups";

type SortableItemProps = {
  price: PriceOutDto;
};

const SortableItem: React.FC<SortableItemProps> = ({ price }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: price.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f0f0f0" : "white",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border border-gray-300 rounded mb-2 cursor-default select-none"
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
      >
        <OrderedListOutlined />
      </span>
      <span>{price.name}</span>
    </div>
  );
};

export type PriceGroupReorderModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (changes: PriceGroupReorderItemInDto[]) => Promise<void>;
  loading: boolean;
  prices: PriceOutDto[];
};

export const PriceGroupReorderModal: React.FC<PriceGroupReorderModalProps> = ({
  open,
  onClose,
  onSave,
  loading,
  prices,
}) => {
  const [localPrices, setLocalPrices] = useState<PriceOutDto[]>([]);

  useEffect(() => {
    if (open) {
      setLocalPrices([...prices]);
    }
  }, [open, prices]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalPrices((items) => {
      const oldIndex = items.findIndex((p) => p.id === active.id);
      const newIndex = items.findIndex((p) => p.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    // Вычисляем только изменённые позиции (diff)
    const changes: PriceGroupReorderItemInDto[] = localPrices
      .map((price, index) => ({ id: price.id, order: index + 1 }))
      .filter((item, index) => prices[index]?.id !== item.id);

    if (changes.length === 0) {
      onClose();
      return;
    }

    await onSave(changes);
  };

  const footer = [
    <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
      Закрыть
    </Button>,
    <Button
      key="save"
      type="primary"
      onClick={handleSave}
      loading={loading}
      icon={<SaveOutlined />}
    >
      Сохранить
    </Button>,
  ];

  return (
    <Modal
      open={open}
      title="Порядок услуг в группе"
      onCancel={onClose}
      footer={footer}
      width={600}
      centered
      styles={{ body: { maxHeight: "calc(90vh - 200px)", overflowY: "auto" } }}
    >
      {localPrices.length === 0 ? (
        <div className="text-center text-gray-500 py-8">В группе нет услуг</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localPrices.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="py-2">
              {localPrices.map((price) => (
                <SortableItem key={price.id} price={price} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </Modal>
  );
};
