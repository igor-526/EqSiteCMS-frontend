import React from "react";
import { Card, Col, Empty, Image } from "antd";
import { PhotoOutShortDto } from "@/types/api/photos";

export type PhotoElementProps = {
    photo: PhotoOutShortDto;
    actions: React.ReactNode[];
};

export const PhotoElement: React.FC<PhotoElementProps> = ({
    photo,
    actions,
}) => {
    const hasImageUrl = Boolean(photo.url);

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
                {hasImageUrl ? (
                    <Image
                        alt="Фотография"
                        src={photo.url}
                    />
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Нет изображения"
                    />
                )}
            </Card>
        </Col>
    );
};


