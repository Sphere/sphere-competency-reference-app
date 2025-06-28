import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SphereMobilePageComponent } from './sphere-mobile-page.component';

describe('SphereMobilePageComponent', () => {
  let component: SphereMobilePageComponent;
  let fixture: ComponentFixture<SphereMobilePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SphereMobilePageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SphereMobilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formatFeaturedCourseResponse()', () => {

    beforeEach(() => {
      component.featuredCourse = []
      component.featuredCourseIdentifier = []
    })

    test('has feature courses', ()=> {
      component.featuredCourse = []
      component.featuredCourseIdentifier =['do_1138142243687792641209', 'do_1138142849466777601296'] 
      const res = {
        result: {
          content: [
            {
              identifier: 'do_1138142243687792641209',
              appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138142243687792641209/artifact/do_1138142252640583681210_1686306795404_eyecare1686306794788.thumb.png',
              value : {
                name: 'EYE Care Training Manual for MPWs'
              }
            },
            {
              identifier: 'do_1138141555188121601143',
              appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138141555188121601143/artifact/do_1138141915097169921165_1686302675216_ent1686302674640.thumb.png',
              value : {
                name: 'Ear, Nose, and Throat (ENT) Care course for MPWs'
              }
            },
            {
              identifier: 'do_1138142849466777601296',
              appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138142849466777601296/artifact/do_1138142861047398401297_1686314222320_elderlycare1686314221533.thumb.png',
              value : {
                name: 'Elderly care course for MPWs'
              }
            }
          ]
        }
      }
      component.formatFeaturedCourseResponse(res)
      expect(component.featuredCourse).toEqual(
        [
          {
            identifier: 'do_1138142243687792641209',
            appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138142243687792641209/artifact/do_1138142252640583681210_1686306795404_eyecare1686306794788.thumb.png',
            value : {
              name: 'EYE Care Training Manual for MPWs'
            }
          },
          {
            identifier: 'do_1138142849466777601296',
            appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138142849466777601296/artifact/do_1138142861047398401297_1686314222320_elderlycare1686314221533.thumb.png',
            value : {
              name: 'Elderly care course for MPWs'
            }
          }
        ]
      );
    })

    test('has no feature courses', ()=> {
      component.featuredCourseIdentifier =['do_1138142243687792641208', 'do_1138142849466777601295'] 
      const res = {
        result: {
          content: [
            {
              identifier: 'do_1138142243687792641209',
              appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138142243687792641209/artifact/do_1138142252640583681210_1686306795404_eyecare1686306794788.thumb.png',
              value : {
                name: 'EYE Care Training Manual for MPWs'
              }
            },
            {
              identifier: 'do_1138141555188121601143',
              appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138141555188121601143/artifact/do_1138141915097169921165_1686302675216_ent1686302674640.thumb.png',
              value : {
                name: 'Ear, Nose, and Throat (ENT) Care course for MPWs'
              }
            },
            {
              identifier: 'do_1138142849466777601296',
              appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138142849466777601296/artifact/do_1138142861047398401297_1686314222320_elderlycare1686314221533.thumb.png',
              value : {
                name: 'Elderly care course for MPWs'
              }
            }
          ]
        }
      }
      component.formatFeaturedCourseResponse(res)
      expect(component.featuredCourse).toEqual(
        []
      );
    })

    test('has no featuredCourseIdentifier', ()=> {
      const res = {
        result: {
          content: [
            {
              identifier: 'do_1138142243687792641209',
              appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138142243687792641209/artifact/do_1138142252640583681210_1686306795404_eyecare1686306794788.thumb.png',
              value : {
                name: 'EYE Care Training Manual for MPWs'
              }
            },
            {
              identifier: 'do_1138141555188121601143',
              appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138141555188121601143/artifact/do_1138141915097169921165_1686302675216_ent1686302674640.thumb.png',
              value : {
                name: 'Ear, Nose, and Throat (ENT) Care course for MPWs'
              }
            },
            {
              identifier: 'do_1138142849466777601296',
              appIcon: 'https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1138142849466777601296/artifact/do_1138142861047398401297_1686314222320_elderlycare1686314221533.thumb.png',
              value : {
                name: 'Elderly care course for MPWs'
              }
            }
          ]
        }
      }
      component.formatFeaturedCourseResponse(res)
      expect(component.featuredCourse).toEqual(
        []
      );
    })

    test('has no courses', ()=> {
      component.featuredCourseIdentifier =['do_1138142243687792641208'] 
      const res = {
        result: {
          content: []
        }
      }
      component.formatFeaturedCourseResponse(res)
      expect(component.featuredCourse).toEqual(
        []
      );
    })
  })
});
