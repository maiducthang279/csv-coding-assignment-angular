import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { BackendService } from '../../../backend.service';
import { Task } from '../../../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private readonly _backendService: BackendService) {}

  public createTask(result: Partial<Task>) {
    return this._backendService
      .newTask({ description: result.description })
      .pipe(
        take(1),
        switchMap((newTask) => {
          if (result.assigneeId != null) {
            return this._backendService
              .assign(newTask.id, result.assigneeId)
              .pipe(
                switchMap((assignedTask) =>
                  this._backendService
                    .user(result.assigneeId)
                    .pipe(map((user) => ({ ...assignedTask, assignee: user })))
                )
              );
          }
          return of(newTask);
        })
      );
  }
  public updateTask(id: number, result: Partial<Omit<Task, 'id'>>) {
    return this._backendService
      .update(id, {
        description: result.description,
        assigneeId: result.assigneeId,
      })
      .pipe(
        take(1),
        switchMap((updatedTask) => {
          if (updatedTask.assigneeId != null) {
            return this._backendService
              .user(updatedTask.assigneeId)
              .pipe(map((user) => ({ ...updatedTask, assignee: user })));
          }
          return of(updatedTask);
        })
      );
  }
}
