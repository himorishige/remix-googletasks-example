export type TaskList = {
  kind: string;
  id: string;
  etag: string;
  title: string;
  updated: string;
  selfLink: string;
};

export type TaskListsResponse = {
  kind: string;
  etag: string;
  items: TaskList[];
};

export type TaskListsError = { error: string };
