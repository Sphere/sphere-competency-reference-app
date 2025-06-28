import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SphereMobileHomeComponent } from './sphere-mobile-home.component';

describe('SphereMobileHomeComponent', () => {
  let component: SphereMobileHomeComponent;
  let fixture: ComponentFixture<SphereMobileHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SphereMobileHomeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SphereMobileHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
