import { Injectable } from '@angular/core';
import {
  Task,
  TaskFilter,
  TaskWithUser,
  User,
} from '../../../models/task.model';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, Observable } from 'rxjs';
import { BackendService } from '../../../backend.service';

export interface TasksState {
  tasks: TaskWithUser[];
  taskFilter: TaskFilter;
}

@Injectable()
export class TasksStore extends ComponentStore<TasksState> {
  public readonly tasks$ = this.select((state) => state.tasks);
  public readonly taskFilter$ = this.select((state) => state.taskFilter);
  public readonly filteredTasks$ = this.select(
    this.tasks$,
    this.taskFilter$,
    (tasks, taskFilter) =>
      tasks.filter((task) => taskFilter.filterFunction(task))
  );

  public readonly setTasks = this.updater((state, tasks: TaskWithUser[]) => ({
    ...state,
    tasks,
  }));
  public readonly addTask = this.updater((state, task: TaskWithUser) => ({
    ...state,
    tasks: [...state.tasks, task],
  }));
  public readonly setTaskFilter = this.updater(
    (state, taskFilter: TaskFilter) => ({
      ...state,
      taskFilter,
    })
  );
  readonly load = this.effect(() => {
    return this._backendService.tasksWithUser().pipe(
      tapResponse<TaskWithUser[]>(
        (tasks) => this.setTasks(tasks),
        (error: Error) => {
          alert(error);
          return EMPTY;
        }
      )
    );
  });

  constructor(private readonly _backendService: BackendService) {
    super({
      tasks: [],
      taskFilter: {
        filterFunction: (_task) => true,
      },
    });
  }
}
