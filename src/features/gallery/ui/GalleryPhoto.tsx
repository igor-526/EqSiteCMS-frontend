import React from "react";
import { Card, Checkbox, Image } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { PhotoOutDto } from "@/types/api/photos";

export type GalleryPhotoProps = {
    photo: PhotoOutDto;
    selected: boolean;
    onSelect: (selected: boolean) => void;
    onDelete: () => void;
    onEdit: () => void;
};

export const GalleryPhoto: React.FC<GalleryPhotoProps> = ({
    photo,
    selected,
    onSelect,
    onDelete,
    onEdit,
}) => {
    const actions: React.ReactNode[] = [
        <div key="checkbox_div" onClick={(e) => {
            e.stopPropagation();
            onSelect(!selected);
        }}>
            <Checkbox 
                key="checkbox" 
                checked={selected}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onChange={(e) => {
                    e.stopPropagation();
                    onSelect(e.target.checked);
                }}
            ></Checkbox>
        </div>,
        <EditOutlined key="edit" disabled onClick={() => {
            onEdit();
        }} />,
        <DeleteOutlined key="delete" onClick={() => {
            onDelete();
        }} />,
    ];

    return (
        <Card actions={actions} className="w-64">
            <Image
                alt={photo.name}
                src={photo.url}
            />
        </Card>
    );
};



