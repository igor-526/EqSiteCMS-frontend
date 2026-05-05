import { forwardRef } from "react";
import type { IconProps } from "../types";
import { getIconDimensions } from "../types";

const InfoIcon = forwardRef<SVGSVGElement, IconProps>(({ size, ...props }, ref) => {
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
            <path
                d="M7 5.5C7 4.67157 7.67157 4 8.5 4H15.5C16.3284 4 17 4.67157 17 5.5V12.5C17 12.8978 16.842 13.2794 16.5607 13.5607L11.5607 18.5607C11.2794 18.842 10.8978 19 10.5 19H8.5C7.67157 19 7 18.3284 7 17.5V5.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d="M10 9.5H14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M10 12.5H13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M12 4V7.5C12 8.32843 12.6716 9 13.5 9H17"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.5 17.5L16 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
});

InfoIcon.displayName = "InfoIcon";

export default InfoIcon;

