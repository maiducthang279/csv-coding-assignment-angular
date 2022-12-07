import { Injectable } from '@angular/core';
import { combineLatest, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Task, TaskWithUser, User } from './models/task.model';

/**
 * This service acts as a mock backend.
 *
 * You are free to modify it as you see.
 */

function randomDelay() {
  return Math.random() * 1000;
}

@Injectable()
export class BackendService {
  storedTasks: Task[] = [
    {
      id: 0,
      description: 'Install a monitor arm',
      assigneeId: 111,
      completed: false,
    },
    {
      id: 1,
      description: 'Move the desk to the new location',
      assigneeId: 111,
      completed: false,
    },
  ];

  storedUsers: User[] = [
    { id: 111, name: 'Mike' },
    { id: 222, name: 'James' },
  ];

  lastId = 1;

  private findTaskById = (id) =>
    this.storedTasks.find((task) => task.id === +id);

  private findUserById = (id) =>
    this.storedUsers.find((user) => user.id === +id);

  tasks() {
    return of(this.storedTasks).pipe(delay(randomDelay()));
  }

  task(id: number): Observable<Task> {
    return of(this.findTaskById(id)).pipe(delay(randomDelay()));
  }

  users() {
    return of(this.storedUsers).pipe(delay(randomDelay()));
  }

  user(id: number) {
    return of(this.findUserById(id)).pipe(delay(randomDelay()));
  }

  tasksWithUser(): Observable<TaskWithUser[]> {
    return combineLatest([this.tasks(), this.users()]).pipe(
      map(([tasks, users]) =>
        tasks.map((task) => ({
          ...task,
          assignee: users.find((user) => user.id === task.assigneeId) || null,
        }))
      )
    );
  }

  newTask(payload: { description: string }) {
    const newTask: Task = {
      id: ++this.lastId,
      description: payload.description,
      assigneeId: null,
      completed: false,
    };

    this.storedTasks = this.storedTasks.concat(newTask);

    return of(newTask).pipe(delay(randomDelay()));
  }

  assign(taskId: number, userId: number) {
    return this.update(taskId, { assigneeId: userId });
  }

  complete(taskId: number, completed: boolean) {
    return this.update(taskId, { completed });
  }

  update(taskId: number, updates: Partial<Omit<Task, 'id'>>) {
    const foundTask = this.findTaskById(taskId);

    if (!foundTask) {
      return throwError(new Error('task not found'));
    }

    const updatedTask = { ...foundTask, ...updates };

    this.storedTasks = this.storedTasks.map((t) =>
      t.id === taskId ? updatedTask : t
    );

    return of(updatedTask).pipe(delay(randomDelay()));
  }
}
