import React, { useEffect, useRef } from "react";
import { Row } from "antd";

export type PhotoSelectorListProps = {
    children: React.ReactNode;
    onLoadMore: () => void;
    hasMore?: boolean;
    loading?: boolean;
};

export const PhotoSelectorList: React.FC<PhotoSelectorListProps> = ({
    children,
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
                {children}
            </Row>
            {hasMore && <div ref={observerTarget} style={{ height: '20px' }} />}
        </>
    );
};



