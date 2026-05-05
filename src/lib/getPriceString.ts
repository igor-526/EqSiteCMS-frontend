import { PriceFormatter } from "@/types/api/prices";

export const getPriceString = (priceFormatter: PriceFormatter, price: number) => {
    switch (priceFormatter) {
        case PriceFormatter.equal:
            return `${price} ₽`;
        case PriceFormatter.gt:
            return `от ${price} ₽`;
        case PriceFormatter.lt:
            return `до ${price} ₽`;
        case PriceFormatter.discuss:
            return "Обсуждается";
        default:
            return `${price} ₽`;
    }
};