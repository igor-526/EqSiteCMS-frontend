import {
  callbackRequestDetail,
  callbackRequestSpamUpdate,
  callbackRequestStatuses,
  callbackRequestStatusUpdate,
  callbackRequestsList,
} from "@/api/callbackRequests";

export const fetchCallbackRequests = callbackRequestsList;
export const fetchCallbackRequest = callbackRequestDetail;
export const fetchCallbackRequestStatuses = callbackRequestStatuses;
export const updateCallbackRequestStatus = callbackRequestStatusUpdate;
export const updateCallbackRequestSpam = callbackRequestSpamUpdate;
