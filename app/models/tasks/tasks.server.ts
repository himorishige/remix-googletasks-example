import { fetchData } from '~/utils/fetcher';

import type { HttpResponse } from '~/utils/fetcher';
import type { Task, TasksError, TasksResponse } from './types';

export function fetchTasks(
  taskListId: string,
  init?: RequestInit,
): Promise<HttpResponse<TasksResponse, TasksError>> {
  return fetchData<TasksResponse, TasksError>(() =>
    fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&showHidden=true&showDeleted=true`,
      init,
    ),
  );
}

export function fetchAllTasks(
  taskListIds: string[],
  init?: RequestInit,
): Promise<HttpResponse<TasksResponse, TasksError>[]> {
  return Promise.all(taskListIds.map((id) => fetchTasks(id, init)));
}

export function createTask(
  taskListId: string,
  title: Pick<Task, 'title'>,
  init?: RequestInit,
): Promise<HttpResponse<TasksResponse, TasksError>> {
  return fetchData<TasksResponse, TasksError>(() =>
    fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(title),
      ...init,
    }),
  );
}

export function updateTask(
  taskListId: string,
  body: Partial<Task>,
  init?: RequestInit,
): Promise<HttpResponse<TasksResponse, TasksError>> {
  return fetchData<TasksResponse, TasksError>(() =>
    fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${body.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
        ...init,
      },
    ),
  );
}
