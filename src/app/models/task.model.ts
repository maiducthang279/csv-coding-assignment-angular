export type User = {
  id: number;
  name: string;
};

export type Task = {
  id: number;
  description: string;
  assigneeId: number | null;
  completed: boolean;
};

export type TaskWithUser = Task & {
  assignee?: User;
};

export interface TaskFilterFormData {
  description: string;
  assigneeId: number | 'All' | 'Unassigned';
  completed: boolean | 'All';
}
export interface TaskFilter {
  filterFunction: (task: Task) => boolean;
}
