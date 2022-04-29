import { fetchData } from '~/utils/fetcher';

import type { HttpResponse } from '~/utils/fetcher';
import type { TaskListsError, TaskListsResponse } from './types';

export const fetchTaskLists = (
  init?: RequestInit,
): Promise<HttpResponse<TaskListsResponse, TaskListsError>> => {
  return fetchData<TaskListsResponse, TaskListsError>(() =>
    fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists`, init),
  );
};
