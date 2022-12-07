import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { BackendService } from '../../../backend.service';
import { Task, TaskWithUser, User } from '../../../models/task.model';

export interface TaskDialogData {
  task?: Task;
}

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.css'],
})
export class TaskDialogComponent implements OnInit {
  protected users$!: Observable<User[]>;
  protected taskForm: FormGroup = this._formBuilder.group({
    description: ['', Validators.required],
    assigneeId: [''],
  });

  constructor(
    private readonly _dialogRef: MatDialogRef<
      TaskDialogComponent,
      Partial<TaskWithUser>
    >,
    @Inject(MAT_DIALOG_DATA) protected readonly data: TaskDialogData,
    private readonly _backendService: BackendService,
    private readonly _formBuilder: FormBuilder
  ) {}

  get isEditForm() {
    return !!this.data?.task && this.data?.task.id != null;
  }

  ngOnInit(): void {
    this.users$ = this._backendService.users();
    if (this.isEditForm) {
      this.taskForm.patchValue({
        description: this.data.task.description,
        assigneeId: this.data.task.assigneeId ?? '',
      });
    }
  }

  protected submit() {
    const assigneeId = this.taskForm.get('assigneeId').value;
    const result = {
      ...this.taskForm.value,
      assigneeId: assigneeId !== '' ? assigneeId : null,
    };
    this._dialogRef.close(result);
  }
}
