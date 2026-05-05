import { forwardRef } from "react";
import type { IconProps } from "../types";
import { getIconDimensions } from "../types";

const DashboardIcon = forwardRef<SVGSVGElement, IconProps>(({ size, ...props }, ref) => {
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
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <rect x="14" y="11" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <rect x="3" y="13" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
});

DashboardIcon.displayName = "DashboardIcon";

export default DashboardIcon;

