import { getAccessToken } from '../utils/firebase';

export interface TaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated?: string;
}

export interface TaskList {
  id: string;
  title: string;
  updated?: string;
}

// Fetch user's task lists
export const fetchTaskLists = async (): Promise<TaskList[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch task lists (${res.status})`);
  }

  const data = await res.json();
  return data.items || [];
};

// Fetch tasks for a tasklist (defaults to @default)
export const fetchTasks = async (taskListId = '@default'): Promise<TaskItem[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks?showCompleted=true&showHidden=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch tasks (${res.status})`);
  }

  const data = await res.json();
  return data.items || [];
};

// Create a new task
export const createTask = async (
  taskListId = '@default',
  task: { title: string; notes?: string; due?: string }
): Promise<TaskItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  const body: any = {
    title: task.title,
    notes: task.notes,
  };

  if (task.due) {
    body.due = new Date(task.due).toISOString();
  }

  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create task (${res.status})`);
  }

  return await res.json();
};

// Update task completion status
export const toggleTaskStatus = async (
  taskListId = '@default',
  taskId: string,
  isCompleted: boolean
): Promise<TaskItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  const body = {
    status: isCompleted ? 'completed' : 'needsAction',
    completed: isCompleted ? new Date().toISOString() : null,
  };

  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to update task (${res.status})`);
  }

  return await res.json();
};

// Delete a task
export const deleteTask = async (taskListId = '@default', taskId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok && res.status !== 204) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete task (${res.status})`);
  }

  return true;
};
