import React from "react";
import { Card, Col, Image } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { PhotoOutShortDto } from "@/types/api/photos";

export type PhotoElementProps = {
    photo: PhotoOutShortDto;
    actions: React.ReactNode[];
};

export const PhotoElement: React.FC<PhotoElementProps> = ({
    photo,
    actions,
}) => {
    return (
        <Col
            key={photo.id}
            xs={{ flex: '100%' }}
            sm={{ flex: '50%' }}
            md={{ flex: '40%' }}
            lg={{ flex: '20%' }}
            xl={{ flex: '10%' }}
        >
            <Card actions={actions} className="w-48" styles={{ body: { padding: 0 } }}>
                <Image
                    alt={photo.id}
                    src={photo.url}
                />
            </Card>
        </Col>
    );
};



