import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostAuthenticationComponent } from './post-authentication.component';

describe('PostAuthenticationComponent', () => {
  let component: PostAuthenticationComponent;
  let fixture: ComponentFixture<PostAuthenticationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostAuthenticationComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
