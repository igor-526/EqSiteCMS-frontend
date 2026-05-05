import React, { useEffect, useRef } from "react";
import { Row, Col } from "antd";
import { PhotoOutDto } from "@/types/api/photos";
import { GalleryPhoto } from "./GalleryPhoto";

export type PhotosListProps = {
    photos: PhotoOutDto[];
    selectedPhotos: PhotoOutDto[];
    onSelectPhoto: (photo: PhotoOutDto, selected: boolean) => void;
    onDeletePhoto: (photo: PhotoOutDto) => void;
    onEditPhoto: (photo: PhotoOutDto) => void;
    onLoadMore: () => void;
    hasMore?: boolean;
    loading?: boolean;
};

export const PhotosList: React.FC<PhotosListProps> = ({
    photos,
    selectedPhotos,
    onSelectPhoto,
    onDeletePhoto,
    onEditPhoto,
    onLoadMore,
    hasMore = true,
    loading = false,
}) => {
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading, onLoadMore]);

    return (
        <>
            <Row gutter={[8, 8]} justify="space-between">
                {photos.map(photo => (
                    <Col
                        key={photo.id}
                        xs={{ flex: '100%' }}
                        sm={{ flex: '50%' }}
                        md={{ flex: '40%' }}
                        lg={{ flex: '20%' }}
                        xl={{ flex: '10%' }}
                    >
                        <GalleryPhoto
                            key={photo.id}
                            photo={photo}
                            selected={selectedPhotos.some(p => p.id === photo.id)}
                            onSelect={(selected) => {
                                onSelectPhoto(photo, selected);
                            }}
                            onDelete={() => {
                                onDeletePhoto(photo);
                            }}
                            onEdit={() => {
                                onEditPhoto(photo);
                            }}
                        />
                    </Col>
                ))}
            </Row>
            {hasMore && <div ref={observerTarget} style={{ height: '20px' }} />}
        </>
    );
};



