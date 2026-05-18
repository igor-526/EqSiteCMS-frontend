import { useCallback } from "react";
import type { UUID } from "crypto";
import type { PriceGroupOutDto } from "@/types/api/priceGroups";
import type { PriceOutDto } from "@/types/api/prices";

type UsePricesPageActionsParams = {
    prices: PriceOutDto[];
    priceGroups: PriceGroupOutDto[];
    setSelectedPrice: React.Dispatch<React.SetStateAction<PriceOutDto | null>>;
    setSelectedGroupForReorder: React.Dispatch<React.SetStateAction<PriceGroupOutDto | null>>;
    setPriceModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPriceTableModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPricePhotosModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPricePageModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPriceGroupModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPriceGroupReorderModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const usePricesPageActions = ({
    prices,
    priceGroups,
    setSelectedPrice,
    setSelectedGroupForReorder,
    setPriceModalOpen,
    setPriceTableModalOpen,
    setPricePhotosModalOpen,
    setPricePageModalOpen,
    setPriceGroupModalOpen,
    setPriceGroupReorderModalOpen,
}: UsePricesPageActionsParams) => {
    const findPriceById = useCallback(
        (priceId: UUID) => prices.find((price) => price.id === priceId) ?? null,
        [prices],
    );

    const findPriceGroupById = useCallback(
        (priceGroupId: string) =>
            priceGroups.find((group) => group.id.toString() === priceGroupId) ?? null,
        [priceGroups],
    );

    const handlePriceModalClose = useCallback(() => {
        setPriceModalOpen(false);
    }, [setPriceModalOpen]);

    const handlePriceTableModalClose = useCallback(() => {
        setPriceTableModalOpen(false);
    }, [setPriceTableModalOpen]);

    const handlePricePhotosModalClose = useCallback(() => {
        setPricePhotosModalOpen(false);
    }, [setPricePhotosModalOpen]);

    const handlePricePageModalClose = useCallback(() => {
        setPricePageModalOpen(false);
    }, [setPricePageModalOpen]);

    const handlePriceGroupModalClose = useCallback(() => {
        setPriceGroupModalOpen(false);
    }, [setPriceGroupModalOpen]);

    const handlePriceGroupReorderModalClose = useCallback(() => {
        setPriceGroupReorderModalOpen(false);
    }, [setPriceGroupReorderModalOpen]);

    const handleOpenPricePageModal = useCallback(
        (priceId: UUID) => {
            const price = findPriceById(priceId);
            setSelectedPrice(price);
            setPricePageModalOpen(true);
        },
        [findPriceById, setPricePageModalOpen, setSelectedPrice],
    );

    const handleOpenReorderModal = useCallback(
        (priceGroupId: string) => {
            const group = findPriceGroupById(priceGroupId);
            setSelectedGroupForReorder(group);
            setPriceGroupReorderModalOpen(true);
            return group;
        },
        [findPriceGroupById, setPriceGroupReorderModalOpen, setSelectedGroupForReorder],
    );

    return {
        findPriceById,
        findPriceGroupById,
        handlePriceModalClose,
        handlePriceTableModalClose,
        handlePricePhotosModalClose,
        handlePricePageModalClose,
        handlePriceGroupModalClose,
        handlePriceGroupReorderModalClose,
        handleOpenPricePageModal,
        handleOpenReorderModal,
    };
};
