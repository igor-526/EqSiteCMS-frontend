import { horseBreedGroupDetail, horseBreedGroupUpdate } from "@/api/horseBreedGroups";

export const fetchBreedGroupPageData = (id: string) =>
  horseBreedGroupDetail(id, { page_data: true });
export const saveBreedGroupPageData = (id: string, pageData: string) =>
  horseBreedGroupUpdate(id, { page_data: pageData });
