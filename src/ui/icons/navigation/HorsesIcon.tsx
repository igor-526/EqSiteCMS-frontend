import { forwardRef } from "react";
import type { IconProps } from "../types";
import { getIconDimensions } from "../types";

const HorsesIcon = forwardRef<SVGSVGElement, IconProps>(({ size, ...props }, ref) => {
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
                d="M6.5 8.5C6.5 6.567 8.067 5 10 5H12.8C13.2623 5 13.7131 5.16051 14.0757 5.45379L16.9243 7.74621C17.2869 8.03949 17.7377 8.2 18.2 8.2H18.5C19.0523 8.2 19.5 8.64772 19.5 9.2V10.3C19.5 10.5753 19.3488 10.8272 19.1131 10.9585L17.3 11.9667C16.494 12.4148 15.5 11.8307 15.5 10.9231V10.2L14 11.7V14.5C14 16.9853 11.9853 19 9.5 19C7.01472 19 5 16.9853 5 14.5V10.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11 6.5L12.2 4.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8.5 12C8.5 13.933 9.567 15.5 11.5 15.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M8 10.2H6.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
});

HorsesIcon.displayName = "HorsesIcon";

export default HorsesIcon;

