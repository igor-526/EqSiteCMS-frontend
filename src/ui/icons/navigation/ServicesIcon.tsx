import { forwardRef } from "react";
import type { IconProps } from "../types";
import { getIconDimensions } from "../types";

const ServicesIcon = forwardRef<SVGSVGElement, IconProps>(({ size, ...props }, ref) => {
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
                x="4"
                y="4"
                width="16"
                height="16"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M9.5 7H14.2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M9.5 9H13.5C14.8807 9 16 10.1193 16 11.5C16 12.8807 14.8807 14 13.5 14H9.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14 11.5H9.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M12 11.5H9.5V16.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9.5 16.5H13.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
});

ServicesIcon.displayName = "ServicesIcon";

export default ServicesIcon;

