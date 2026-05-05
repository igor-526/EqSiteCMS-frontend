import { forwardRef } from "react";
import type { IconProps } from "../types";
import { getIconDimensions } from "../types";

const AddIcon = forwardRef<SVGSVGElement, IconProps>(({ size, ...props }, ref) => {
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
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
});

AddIcon.displayName = "AddIcon";

export default AddIcon;

