import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Task, TaskWithUser } from '../../../models/task.model';
import { TaskService } from '../services/task.service';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { TasksStore } from './tasks.store';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  providers: [TasksStore],
})
export class TaskListComponent implements OnInit {
  protected readonly tasks$ = this._tasksStore.filteredTasks$;
  protected readonly displayedColumns = [
    'description',
    'assignee',
    'completed',
  ];
  constructor(
    private readonly _taskService: TaskService,
    private readonly _tasksStore: TasksStore,
    private readonly _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this._tasksStore.load();
  }

  public trackTask(_index: number, item: TaskWithUser): string {
    return `${item.id}`;
  }

  public openTaskDialog() {
    const dialogRef = this._dialog.open(TaskDialogComponent);
    dialogRef.afterClosed().subscribe((result: Partial<Task> | undefined) => {
      if (!!result) {
        this._taskService
          .createTask(result)
          .subscribe((newTask) => this._tasksStore.addTask(newTask));
      }
    });
  }
}
