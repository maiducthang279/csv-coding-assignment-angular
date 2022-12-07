import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BackendService } from '../../../backend.service';
import { Task, TaskFilterFormData, User } from '../../../models/task.model';
import { TasksStore } from '../task-list/tasks.store';

@Component({
  selector: 'app-tasks-filter',
  templateUrl: './tasks-filter.component.html',
  styleUrls: ['./tasks-filter.component.css'],
})
export class TasksFilterComponent implements OnInit {
  protected users$!: Observable<User[]>;
  protected filterForm: FormGroup = this._formBuilder.group({
    description: [''],
    assigneeId: ['All'],
    completed: ['All'],
  });
  constructor(
    private readonly _tasksStore: TasksStore,
    private readonly _backendService: BackendService,
    private readonly _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.users$ = this._backendService.users();
    this.filterForm.valueChanges
      .pipe(debounceTime(100))
      .subscribe((value: TaskFilterFormData) => {
        this._updateFilter(value);
      });
  }

  private _updateFilter(value: TaskFilterFormData) {
    this._tasksStore.setTaskFilter({
      filterFunction: this._makeFilterFunction(value),
    });
  }

  private _makeFilterFunction(value: TaskFilterFormData) {
    return (task: Task) =>
      this._filterByDescription(task, value.description) &&
      this._filterByAssignee(task, value.assigneeId) &&
      this._filterByCompleted(task, value.completed);
  }

  private _filterByDescription(task: Task, description: string) {
    return (
      description === '' ||
      task.description
        .toLocaleLowerCase()
        .includes(description.toLocaleLowerCase())
    );
  }

  private _filterByAssignee(
    task: Task,
    assigneeId: number | 'All' | 'Unassigned'
  ) {
    return (
      assigneeId === 'All' ||
      (assigneeId === 'Unassigned' && task.assigneeId == null) ||
      assigneeId === task.assigneeId
    );
  }

  private _filterByCompleted(task: Task, completed: boolean | 'All') {
    return completed === 'All' || completed === task.completed;
  }
}
