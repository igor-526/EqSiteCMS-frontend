import React, { useEffect, useRef } from "react";

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
      { threshold: 0.1 },
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
        }}
      >
        {children}
      </div>
      {hasMore && <div ref={observerTarget} style={{ height: "20px" }} />}
    </>
  );
};
