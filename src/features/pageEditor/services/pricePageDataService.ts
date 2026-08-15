import { priceDetail, priceUpdate } from "@/api/price";
import { UUID } from "crypto";

export const fetchPricePageData = (id: string) =>
  priceDetail(id as UUID, { page_data: true });

export const savePricePageData = (id: string, pageData: string) =>
  priceUpdate(id as UUID, { page_data: pageData });
