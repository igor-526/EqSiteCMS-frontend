import { horseBreedDetail, horseBreedUpdate } from "@/api/horseBreeds";
import { UUID } from "crypto";

export const fetchBreedPageData = (id: string) =>
  horseBreedDetail(id as UUID, { page_data: true });

export const saveBreedPageData = (id: string, pageData: string) =>
  horseBreedUpdate(id as UUID, { page_data: pageData });
