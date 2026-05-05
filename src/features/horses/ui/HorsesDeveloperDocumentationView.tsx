import React from "react";
import { HorsesTabs, HorsesTabsKeys } from "./HorsesTabs";

export type HorsesDeveloperDocumentationViewProps = {
    activeTab: HorsesTabsKeys;
    setActiveTab: (tab: HorsesTabsKeys) => void;
};

export const HorsesDeveloperDocumentationView: React.FC<HorsesDeveloperDocumentationViewProps> = ({
    activeTab,
    setActiveTab,
}) => {
    return (
        <>
            <HorsesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
    );
};



