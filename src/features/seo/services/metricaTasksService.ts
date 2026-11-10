import { getMetricaTasks } from "@/api/seo";
import { apiError, isApiError } from "@/lib/apiStatus";
import type { ApiResult } from "@/types/api/api";
import type { MetricaTasksOutDto, MetricaTasksQueryInDto } from "@/types/api/seo";

const HTTP_STATUS = { UNAUTHORIZED: 401, FORBIDDEN: 403 } as const;

export const METRICA_TASKS_ERROR = "Не удалось загрузить задачи. Повторите позже";

export async function fetchMetricaTasks(query: MetricaTasksQueryInDto): Promise<ApiResult<MetricaTasksOutDto>> {
  try {
    const result = await getMetricaTasks(query);
    if (!isApiError(result)) return result;
    const message = result.httpStatus === HTTP_STATUS.FORBIDDEN ? "Недостаточно прав"
      : result.httpStatus === HTTP_STATUS.UNAUTHORIZED ? "Требуется авторизация" : METRICA_TASKS_ERROR;
    return { ...apiError(message), httpStatus: result.httpStatus };
  } catch {
    return apiError(METRICA_TASKS_ERROR);
  }
}
