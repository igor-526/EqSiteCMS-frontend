import { newsUpdate } from "@/api/news";
import { NewsOutDto } from "@/types/api/news";
import { UUID } from "crypto";

/**
 * Creates a fetch function for PageEditorModal that reads content
 * from an already-loaded NewsOutDto item (available in the CMS news list).
 *
 * The public endpoint GET /api/news/{id} returns NewsPublicOutDto which
 * does not include 'content'. Since the CMS list (newsCmsList) already
 * loads full NewsOutDto items including content, we pass the loaded news
 * list here and find the matching item by id.
 */
export const createFetchNewsPageData =
  (newsList: NewsOutDto[]) => async (id: string) => {
    const item = newsList.find((n) => String(n.id) === id);
    return {
      status: "ok" as const,
      data: {
        page_data: item?.content ?? "",
      },
    };
  };

export const saveNewsPageData = (id: string, content: string) =>
  newsUpdate(id as UUID, { content });
