import { forwardRef } from "react";
import type { IconProps } from "../types";
import { getIconDimensions } from "../types";

const GalleryIcon = forwardRef<SVGSVGElement, IconProps>(({ size, ...props }, ref) => {
    const { width, height } = getIconDimensions(size);

    return (
        <svg
            ref={ref}
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M3 16L8 11L12.5 15.5L15 13L21 18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="9" cy="9" r="1.5" fill="currentColor" />
        </svg>
    );
});

GalleryIcon.displayName = "GalleryIcon";

export default GalleryIcon;

