import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BackendService } from '../../../backend.service';
import { User } from '../../../models/task.model';
import { TasksStore } from '../task-list/tasks.store';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TasksFilterComponent } from './tasks-filter.component';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('TasksFilterComponent', () => {
  let component: TasksFilterComponent;
  let fixture: ComponentFixture<TasksFilterComponent>;

  let tasksStoreMock: TasksStore;
  let backendServiceMock: BackendService;

  const createSpyObj = jasmine.createSpyObj;
  const usersMock: User[] = [
    { id: 111, name: 'Mike' },
    { id: 222, name: 'James' },
  ];

  const initialize = () => {
    tasksStoreMock = createSpyObj('TasksStore', ['setTaskFilter']);
    backendServiceMock = createSpyObj('BackendService', ['users']);
    (backendServiceMock.users as jasmine.Spy).and.returnValues(of(usersMock));
  };

  beforeEach(async () => {
    initialize();
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
      declarations: [TasksFilterComponent],
      providers: [
        { provide: TasksStore, useValue: tasksStoreMock },
        { provide: BackendService, useValue: backendServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show all users option after clicking assignee select field', () => {
    const expectedOption = [
      'All',
      'Unassigned',
      ...usersMock.map((user) => user.name),
    ];
    fixture.debugElement
      .queryAll(By.css('.mat-select-trigger'))[0]
      .nativeElement.click();
    fixture.detectChanges();
    const options = Array.from(
      document.querySelectorAll('.cdk-overlay-container mat-option span')
    ).map((item) => item.textContent);

    expect(options).toEqual(expectedOption);
  });
  it('should call TasksStore.setTaskFilter() after changing description field', waitForAsync(() => {
    const descriptionInput = fixture.debugElement.query(
      By.css('input[matInput]')
    );
    descriptionInput.nativeElement.value = 'Install';
    descriptionInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(tasksStoreMock.setTaskFilter).toHaveBeenCalledWith({
        filterFunction: jasmine.any(Function),
      });
    });
  }));
});
