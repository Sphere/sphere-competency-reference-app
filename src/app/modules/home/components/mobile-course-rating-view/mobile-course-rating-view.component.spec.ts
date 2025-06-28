import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileCourseRatingViewComponent } from './mobile-course-rating-view.component';

describe('MobileCourseRatingViewComponent', () => {
  let component: MobileCourseRatingViewComponent;
  let fixture: ComponentFixture<MobileCourseRatingViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileCourseRatingViewComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileCourseRatingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
