import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { BackendService } from '../../../backend.service';
import { Task, TaskWithUser, User } from '../../../models/task.model';
import { TaskService } from '../services/task.service';

import { TaskListComponent } from './task-list.component';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;

  let taskServiceMock: TaskService;
  let matDialogMock: MatDialog;
  let backendServiceMock: BackendService;

  const createSpyObj = jasmine.createSpyObj;

  const userMock: User = { id: 111, name: 'Mike' };
  const tasksMock: TaskWithUser[] = [
    {
      id: 0,
      description: 'Install a monitor arm',
      assigneeId: 111,
      completed: false,
      assignee: userMock,
    },
    {
      id: 1,
      description: 'Move the desk to the new location',
      assigneeId: 111,
      completed: false,
      assignee: userMock,
    },
  ];
  const newTaskDataMock: Partial<Task> = {
    description: 'mock description',
    assigneeId: userMock.id,
  };
  const newTaskMock: TaskWithUser = {
    description: newTaskDataMock.description!,
    assigneeId: userMock.id,
    id: 3,
    completed: false,
    assignee: userMock,
  };
  const submitDialogRefMock = {
    afterClosed: () => of(newTaskDataMock),
  };
  const cancelDialogRefMock = {
    afterClosed: () => of(undefined),
  };
  const expectedTableData = tasksMock.map((item) => [
    item.description,
    item.assignee.name,
    item.completed ? 'Completed' : 'Not completed',
  ]);

  const clickAddTaskButton = () => {
    const newTaskButton = fixture.debugElement.query(
      By.css('.button_container button')
    );
    newTaskButton.triggerEventHandler('click', null);
  };

  const getTableData = () => {
    const rows = fixture.debugElement.queryAll(By.css('.task_table tbody tr'));
    return Array.from(rows).map((row) =>
      Array.from(row.queryAll(By.css('td'))).map((item) =>
        item.nativeElement.textContent.trim()
      )
    );
  };

  const initialize = () => {
    taskServiceMock = createSpyObj('TaskService', ['createTask']);
    (taskServiceMock.createTask as jasmine.Spy).and.returnValue(
      of(newTaskMock)
    );
    matDialogMock = createSpyObj('MatDialog', ['open']);
    backendServiceMock = createSpyObj('BackendService', ['tasksWithUser']);
    (backendServiceMock.tasksWithUser as jasmine.Spy).and.returnValue(
      of(tasksMock)
    );
  };

  beforeEach(async () => {
    initialize();
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatTableModule,
        NoopAnimationsModule,
      ],
      declarations: [TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: BackendService, useValue: backendServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should render title with value 'Tasks'", () => {
    const title = fixture.debugElement.query(By.css('.header_container h2'))
      .nativeElement.textContent;
    expect(title).toEqual('Tasks');
  });

  it('should render table with correct data', () => {
    const tableData = getTableData();
    expect(tableData).toEqual(expectedTableData);
  });

  it('should call TaskService.createTask() if new task is submited', () => {
    (matDialogMock.open as jasmine.Spy).and.returnValue(submitDialogRefMock);
    clickAddTaskButton();
    fixture.detectChanges();

    expect(taskServiceMock.createTask).toHaveBeenCalledWith(newTaskDataMock);
  });

  it('should render new row in table if new task is added', () => {
    const expectedNewTableData = [
      ...expectedTableData,
      [
        newTaskMock.description,
        newTaskMock.assignee.name,
        newTaskMock.completed ? 'Completed' : 'Not completed',
      ],
    ];

    (matDialogMock.open as jasmine.Spy).and.returnValue(submitDialogRefMock);
    clickAddTaskButton();
    fixture.detectChanges();

    const tableData = getTableData();

    expect(tableData).toEqual(expectedNewTableData);
  });

  it('should not call TaskService.createTask() if adding task is canceled', () => {
    (matDialogMock.open as jasmine.Spy).and.returnValue(cancelDialogRefMock);
    clickAddTaskButton();
    fixture.detectChanges();

    expect(taskServiceMock.createTask).not.toHaveBeenCalled();
  });
});
