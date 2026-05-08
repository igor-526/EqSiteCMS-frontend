import { horseServiceDetail, horseServiceUpdate } from "@/api/horseServices";
import { UUID } from "crypto";

export const fetchHorseServicePageData = (id: string) =>
    horseServiceDetail(id as UUID, { page_data: true });

export const saveHorseServicePageData = (id: string, pageData: string) =>
    horseServiceUpdate(id as UUID, { page_data: pageData });
