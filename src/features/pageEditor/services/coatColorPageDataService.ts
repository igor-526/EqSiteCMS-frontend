import {
  horseCoatColorDetail,
  horseCoatColorUpdate,
} from "@/api/horseCoatColor";
import { UUID } from "crypto";

export const fetchCoatColorPageData = (id: string) =>
  horseCoatColorDetail(id as UUID, { page_data: true });

export const saveCoatColorPageData = (id: string, pageData: string) =>
  horseCoatColorUpdate(id as UUID, { page_data: pageData });
