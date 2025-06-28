import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrgComponent } from './org.component';

describe('OrgComponent', () => {
  let component: OrgComponent;
  let fixture: ComponentFixture<OrgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
