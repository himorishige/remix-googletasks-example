import { json, redirect } from '@remix-run/node';
import { Form, useCatch, useFetcher, useLoaderData } from '@remix-run/react';
import { fetchTaskLists } from '~/models/tasklists/tasklists.server';
import { createTask, fetchTasks, updateTask } from '~/models/tasks';
import { auth } from '~/utils/auth.server';
import React from 'react';

import type { Task } from '~/models/tasks';
import type { GoogleProfile } from 'remix-auth-google';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';

type LoaderData = {
  profile: GoogleProfile;
  taskListId: string;
  tasks?: Task[];
};

export const action: ActionFunction = async ({ request }) => {
  const loginData = await auth.authenticate('google', request, {
    failureRedirect: '/',
  });

  if (!loginData.accessToken) return redirect('/');

  const formData = await request.formData();

  switch (formData.get('action')) {
    case 'add': {
      const title = formData.get('title');
      const taskListId = formData.get('taskListId');
      if (typeof title !== 'string' || title.length === 0) {
        return json(
          { error: { message: 'Title is required' } },
          { status: 422 },
        );
      }
      if (typeof taskListId !== 'string' || taskListId.length === 0) {
        return json(
          { error: { message: 'TaskListId is required' } },
          { status: 422 },
        );
      }

      return await createTask(
        taskListId,
        { title: title },
        {
          headers: {
            Authorization: `Bearer ${loginData.accessToken}`,
            'Content-Type': 'application/json;charset=utf-8',
          },
        },
      );
    }

    case 'change': {
      const taskListId = formData.get('taskListId');
      const taskId = formData.get('taskId');

      if (typeof taskListId !== 'string' || taskListId.length === 0) {
        return json(
          { error: { message: 'TaskListId is required' } },
          { status: 422 },
        );
      }

      if (typeof taskId !== 'string' || taskId.length === 0) {
        return json(
          { error: { message: 'TaskId is required' } },
          { status: 422 },
        );
      }

      const status = formData.get('status');

      return await updateTask(
        taskListId,
        {
          id: taskId,
          status: status === 'needsAction' ? 'completed' : 'needsAction',
        },
        {
          headers: {
            Authorization: `Bearer ${loginData.accessToken}`,
            'Content-Type': 'application/json;charset=utf-8',
          },
        },
      );
    }

    case 'logout': {
      await auth.logout(request, { redirectTo: '/' });
    }

    default: {
      return json({ error: { message: 'Unknown action' } }, { status: 400 });
    }
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const loginData = await auth.isAuthenticated(request, {
    failureRedirect: '/',
  });

  // TODO 暫定対応タスクリストは先頭のひとつめを利用
  const result = await fetchTaskLists({
    headers: {
      Authorization: `Bearer ${loginData.accessToken}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  if (!result.data)
    return json(
      {
        error: {
          message: result.err,
        },
      },
      { status: result.status },
    );

  const { data, err, status } = await fetchTasks(result.data.items[0].id, {
    headers: {
      Authorization: `Bearer ${loginData.accessToken}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  try {
    if (data) {
      return json<LoaderData>({
        profile: loginData.profile,
        taskListId: result.data.items[0].id,
        tasks: data.items,
      });
    }
    if (err) {
      return json(
        {
          error: {
            message: err,
          },
        },
        { status },
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw json({ error: { message: error.message } }, { status: 500 });
    }
    throw json(
      { error: { message: 'Something went wrong...' } },
      { status: 500 },
    );
  }

  return null;
};

export default function Screen() {
  const { profile, taskListId, tasks } = useLoaderData<LoaderData>();

  return (
    <>
      <Form method="post">
        <button name="action" value="logout">
          Log Out
        </button>
      </Form>

      <hr />

      <div>
        {tasks?.map((task) => (
          <TaskItem key={task.id} taskListId={taskListId} task={task} />
        ))}
      </div>

      <div>
        <Form replace method="post">
          <input type="text" name="title" />
          <input type="hidden" name="taskListId" value={taskListId} />
          <button type="submit" name="action" value="add">
            Add Task
          </button>
        </Form>
      </div>

      <pre>
        <code>{JSON.stringify(profile, null, 2)}</code>
      </pre>
    </>
  );
}

export function TaskItem(props: { taskListId: string; task: Task }) {
  const taskListId = props.taskListId;
  const task = props.task;

  const fetcher = useFetcher();

  const checkHandler = (event: React.FormEvent<HTMLFormElement>) => {
    fetcher.submit(event.currentTarget, { replace: true });
  };

  return (
    <div key={task.id}>
      <fetcher.Form method="post" onChange={checkHandler}>
        <input type="hidden" name="action" value="change" />
        <input type="hidden" name="taskListId" value={taskListId} />
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="status" value={task.status} />
        <input
          type="checkbox"
          defaultChecked={task.status === 'completed' ? true : false}
        />{' '}
        {task.title}
      </fetcher.Form>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <div>
      <h1>Error</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  );
}
