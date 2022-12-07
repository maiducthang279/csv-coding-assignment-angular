import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { BackendService } from '../../../backend.service';
import { Task } from '../../../models/task.model';
import { TaskService } from '../services/task.service';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { TaskStore } from './task.store';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  providers: [TaskStore],
})
export class TaskComponent implements OnInit {
  protected task$ = this._taskStore.task$;

  constructor(
    private readonly _backendService: BackendService,
    private readonly _taskService: TaskService,
    private readonly _taskStore: TaskStore,
    private readonly _route: ActivatedRoute,
    private readonly _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const taskId$ = this._route.paramMap.pipe(
      map((params) => {
        return parseInt(params.get('id'), 10);
      })
    );
    this._taskStore.load(taskId$);
  }

  public openTaskDialog(task: Task) {
    const dialogRef = this._dialog.open(TaskDialogComponent, {
      data: { task },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        this._taskService
          .updateTask(task.id, {
            description: result.description,
            assigneeId: result.assigneeId,
          })
          .subscribe((updatedTask) => this._taskStore.updateTask(updatedTask));
      }
    });
  }

  public toggleCompleteButton({ checked }: MatSlideToggleChange, task: Task) {
    if (checked !== task.completed) {
      this._backendService
        .complete(task.id, checked)
        .subscribe((updatedTask) =>
          this._taskStore.completeTask(updatedTask.completed)
        );
    }
  }
}
