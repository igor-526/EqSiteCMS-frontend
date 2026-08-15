import { UUID } from "crypto";
import { PhotoOutShortDto } from "./photos";

export type NewsStatus = "published" | "scheduled" | "deleted";

export type NewsOutDto = {
  id: UUID;
  name: string;
  snippet: string | null;
  content: string;
  published_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  photos: PhotoOutShortDto[];
  created_at: string;
  updated_at: string | null;
};

export type NewsPublicOutDto = {
  id: UUID;
  name: string;
  snippet: string | null;
  published_at: string;
  photos: PhotoOutShortDto[];
};

export type NewsCreateInDto = {
  name: string;
  snippet?: string | null;
  content: string;
  published_at: string;
  photo_ids?: UUID[];
  main_photo_id?: UUID | null;
};

export type NewsUpdateInDto = {
  name?: string;
  snippet?: string | null;
  content?: string;
  published_at?: string;
};

export type NewsCmsQueryParams = {
  page?: number;
  limit?: number;
  name?: string;
  snippet?: string;
  content?: string;
  published_at_from?: string;
  published_at_to?: string;
  status?: NewsStatus[];
  sort?: string;
};

export type NewsPhotosUpdateInDto = {
  photo_ids?: UUID[];
  main?: UUID | null;
};
