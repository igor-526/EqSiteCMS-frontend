import React from "react";
import { Card, Empty, Image } from "antd";
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
    <div key={photo.id}>
      <Card
        actions={actions}
        styles={{ body: { padding: 0 } }}
      >
        {hasImageUrl ? (
          <Image alt="Фотография" src={photo.url} />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Нет изображения"
          />
        )}
      </Card>
    </div>
  );
};
