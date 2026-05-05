"use client";

import React, { useState } from "react";
import { SiteSettingsDeveloperDocumentationView } from "@/features/siteSettings/ui/SiteSettingsDeveloperDocumentationView";
import { SiteSettingsUserDocumentationView } from "@/features/siteSettings/ui/SiteSettingsUserDocumentationView";
import { SiteSettingsTable } from "@/features/siteSettings/ui/SiteSettingsTable";
import { useSiteSettings } from "@/features/siteSettings/hooks/useSiteSettings";
import { UUID } from "crypto";
import { SiteSettingOutDto, SiteSettingsCreateInDto, SiteSettingsUpdateInDto } from "@/types/api/siteSettings";
import { useNotification } from "@/hooks/useNotification";
import { SiteSettingsCreateUpdateModal } from "@/features/siteSettings/ui/SiteSettingsCreateUpdateModal";


export default function SiteSettingsPage() {
    const [activeTab, setActiveTab] = useState<string>('settings');
    const [selectedSiteSetting, setSelectedSiteSetting] = useState<SiteSettingOutDto | null>(null);
    const [isSiteSettingModalOpen, setIsSiteSettingModalOpen] = useState<boolean>(false);
    const toast = useNotification();
    const {
        siteSettings,
        siteSettingsTotal,
        siteSettingsLoading,
        siteSettingsFilters,
        setSiteSettingsFilters,
        siteSettingsValidationErrors,
        resetSiteSettingsValidation,
        resetSiteSettingsFilters,
        createSiteSetting,
        updateSiteSetting,
        deleteSiteSetting,
    } = useSiteSettings();

    const handleOpenSiteSettingModal = (siteSettingId: UUID | null) => {
        if (siteSettingId) {
            const siteSetting = siteSettings.find((siteSetting) => siteSetting.id === siteSettingId);
            if (siteSetting) {
                setSelectedSiteSetting(siteSetting);
            } else {
                toast.error('Настройка сайта не найдена. Попробуйте обновить страницу и повторить попытку.');
                return;
            }
        } else {
            setSelectedSiteSetting(null);
        }
        resetSiteSettingsValidation();
        setIsSiteSettingModalOpen(true);
    };

    const handleCreateSiteSetting = async (siteSetting: SiteSettingsCreateInDto) => {
        const result = await createSiteSetting(siteSetting);
        if (result) {
            setIsSiteSettingModalOpen(false);
            setSelectedSiteSetting(null);
        }
    };

    const handleUpdateSiteSetting = async (siteSettingId: UUID, siteSetting: SiteSettingsUpdateInDto) => {
        const result = await updateSiteSetting(siteSettingId, siteSetting);
        if (result) {
            setIsSiteSettingModalOpen(false);
            setSelectedSiteSetting(null);
        }
    };

    const handleDeleteSiteSetting = async (siteSettingId: UUID) => {
        const result = await deleteSiteSetting(siteSettingId);
        if (result) {
            setIsSiteSettingModalOpen(false);
            setSelectedSiteSetting(null);
        }
    };

    return <>
        {activeTab === 'settings' && (
            <>
                <SiteSettingsTable
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    siteSettings={siteSettings}
                    siteSettingsTotal={siteSettingsTotal}
                    loading={siteSettingsLoading}
                    filters={siteSettingsFilters}
                    setFilters={setSiteSettingsFilters}
                    onOpenSiteSettingModal={handleOpenSiteSettingModal}
                    onResetSiteSettingFilters={resetSiteSettingsFilters}
                />
                <SiteSettingsCreateUpdateModal
                    open={isSiteSettingModalOpen}
                    onClose={() => setIsSiteSettingModalOpen(false)}
                    selectedSiteSetting={selectedSiteSetting}
                    onCreate={handleCreateSiteSetting}
                    onUpdate={handleUpdateSiteSetting}
                    onDelete={handleDeleteSiteSetting}
                    validationErrors={siteSettingsValidationErrors}
                    onResetValidation={resetSiteSettingsValidation}
                />
            </>
        )}
        {activeTab === 'developerDocumentation' && (
            <>
                <SiteSettingsDeveloperDocumentationView
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </>
        )}
        {activeTab === 'userDocumentation' && (
            <>
                <SiteSettingsUserDocumentationView
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </>
        )}
    </>;
}
