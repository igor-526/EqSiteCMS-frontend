import React from "react";
import { HorsesTabs, HorsesTabsKeys } from "./HorsesTabs";


export type HorsesUserDocumentationViewProps = {
    activeTab: HorsesTabsKeys;
    setActiveTab: (tab: HorsesTabsKeys) => void;
};

export const HorsesUserDocumentationView: React.FC<HorsesUserDocumentationViewProps> = ({
    activeTab,
    setActiveTab,
}) => {
    return (
        <>
            <HorsesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
    );
};



