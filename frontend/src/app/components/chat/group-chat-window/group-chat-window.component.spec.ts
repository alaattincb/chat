import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupChatWindowComponent } from './group-chat-window.component';

describe('GroupChatWindowComponent', () => {
  let component: GroupChatWindowComponent;
  let fixture: ComponentFixture<GroupChatWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupChatWindowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
