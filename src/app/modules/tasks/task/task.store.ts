import { Injectable } from '@angular/core';
import { TaskWithUser } from '../../../models/task.model';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, Observable, of } from 'rxjs';
import { BackendService } from '../../../backend.service';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface TaskState {
  task?: TaskWithUser;
}

@Injectable()
export class TaskStore extends ComponentStore<TaskState> {
  public readonly task$: Observable<TaskWithUser> = this.select(
    (state) => state.task
  );

  public readonly updateTask = this.updater((_state, task: TaskWithUser) => ({
    task,
  }));

  public readonly completeTask = this.updater((state, completed: boolean) => ({
    task: {
      ...state.task,
      completed,
    },
  }));

  readonly load = this.effect((taskId$: Observable<number>) => {
    return taskId$.pipe(
      switchMap((id) => {
        return this._backendService.task(id);
      }),
      switchMap((task) => {
        if (!task) {
          throw new Error('Not found');
        }
        if (task.assigneeId != null) {
          return this._backendService
            .user(task.assigneeId)
            .pipe(map((assignee) => ({ ...task, assignee })));
        }
        return of(task);
      }),
      tapResponse<TaskWithUser>(
        (task) => this.updateTask(task),
        (_error: Error) => {
          this._router.navigate(['not-found']);
          return EMPTY;
        }
      )
    );
  });

  constructor(
    private readonly _backendService: BackendService,
    private readonly _router: Router
  ) {
    super({ task: null });
  }
}
