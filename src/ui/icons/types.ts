import { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
    size?: number | string;
};

export const getIconDimensions = (size?: number | string) => {
    if (typeof size === "number") {
        return { width: size, height: size };
    }
    if (typeof size === "string") {
        return { width: size, height: size };
    }
    return { width: 24, height: 24 };
};

