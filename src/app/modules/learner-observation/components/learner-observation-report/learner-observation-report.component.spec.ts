import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CommonUtilService } from '../../../../../services'
import { LearnerObservationReporteComponent } from './learner-observation-report.component';
import { NavigationExtras, Router } from '@angular/router';
import { ObservationService } from '../../../observation/services/observation.service';
import { of, throwError } from 'rxjs';
import { RouterLinks } from '../../../../app.constant';
import { mockObservationDetails } from './learner-observation-report.component.spec.data';

describe('LearnerObservationReporteComponent', () => {
  let learnerObservationReporteComponent: LearnerObservationReporteComponent;

  const mockRouter: Partial<Router> = {
    getCurrentNavigation: jest.fn(),
    navigate: jest.fn()
  };

  const mockObservationService: Partial<ObservationService> = {
    getAllObservationForMentee: jest.fn(() => of({ data: [] }))
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    addLoader: jest.fn()
  };

  const div = document.createElement('div');

  function initCompo() {
    learnerObservationReporteComponent = new LearnerObservationReporteComponent(
      mockRouter as Router,
      mockObservationService as ObservationService,
      mockCommonUtilService as CommonUtilService,
    );
  }

  beforeAll(() => {
    initCompo();
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    div.id = 'observationQuestionSection';
    div.scroll = jest.fn();
    document.body.appendChild(div);
  });

  it('should create component', (done) => {
      expect(learnerObservationReporteComponent).toBeTruthy();
      done();
  });

  it('should navigate to MENTEES_LIST if extras not available', (done) => {
    (mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce({
      extras: undefined,
    });
    initCompo();
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith([learnerObservationReporteComponent.menteeProgressURL]);
      done();
    })
  });

  it('should navigate to MENTEES_LIST if navigate by back button', (done) => {
    learnerObservationReporteComponent.ngOnInit();
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith([learnerObservationReporteComponent.menteeProgressURL]);
      done();
    })
  });

  it('should navigate to list if getobservationDetails has error', (done) => {
    mockRouter.getCurrentNavigation = jest.fn(() => ({
      extras: {
        state: {
          observationData:
            {
              info: {
                mentee_id: 'mentee_id',
                mentor_id: 'mentor_id',
              },
              solution_id: 'test_solution_id',
            },
            attempted_count:0,
            observation_id: 'observation_id'
        }
      }
    } as any));
    mockObservationService.getobservationDetails =  jest.fn(() => throwError([{}] as any));
    initCompo();
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith([learnerObservationReporteComponent.menteeProgressURL]);
      done();
    })
  });

  it('should call getobservationDetails if observationData is available', (done) => {
    mockRouter.getCurrentNavigation = jest.fn(() => ({
      extras: {
        state: {
          observationData:
            {
              info: {
                mentee_id: 'mentee_id',
                mentor_id: 'mentor_id',
              },
              solution_id: 'test_solution_id',
              attempted_count:0,
              observation_id: 'observation_id'
            },
          canSubmit: true
        }
      }
    } as any));
    mockObservationService.getobservationDetails =  jest.fn(() => of(mockObservationDetails));
    initCompo();
    setTimeout(() => {
      expect(mockObservationService.getobservationDetails).toBeCalled();
      expect(learnerObservationReporteComponent.progressbarValue).toBe(25)
      done();
    })
  });
  it('should valdateCurrentSection, return false', (done) => {
    learnerObservationReporteComponent.valdateCurrentSection();
    setTimeout(() => {
      expect(learnerObservationReporteComponent.isCurrentSectionFormValid).toBe(false)
      done();
    })
  });

  it('should update the answer of the first question, ans is R4', (done) => {
    learnerObservationReporteComponent.saveAnswer('R4',0);
    setTimeout(() => {
      if(learnerObservationReporteComponent?.currentSection){
        expect(learnerObservationReporteComponent?.currentSection.pageQuestions[0].value).toBe('R4')
        done();
      }else{
        fail()
      }
    })
  });

  it('should return false after giving the above answer for isCurrentSectionFormValid var', (done) => {
    learnerObservationReporteComponent.valdateCurrentSection
    setTimeout(() => {
      expect(learnerObservationReporteComponent.isCurrentSectionFormValid).toBe(false)
      done();
    })
  });

  it('should update the index value on press next', (done) => {
    let activeIndex = learnerObservationReporteComponent.currentSectionIndex;
    mockObservationService.submitObservation = jest.fn(()=>of({}))
    learnerObservationReporteComponent.nextQuestion();
    setTimeout(() => {
      expect(mockObservationService.submitObservation).toBeCalled();
      expect(learnerObservationReporteComponent.currentSectionIndex).toBe(activeIndex+1)
      done();
    })
  });

  it('should update the answer of the 2nd sec and 4th question, ans is ["R1", "R2"]', (done) => {
    learnerObservationReporteComponent.saveAnswer([{checked:true,value:'R1'}, {checked:true,value:'R2'}],4);
    setTimeout(() => {
      if(learnerObservationReporteComponent?.currentSection){
        expect(learnerObservationReporteComponent?.currentSection.pageQuestions[4].value).toStrictEqual(["R1", "R2"])
        done();
      }else{
        fail()
      }
    })
  });

  it('should update the index value on press previous', (done) => {
    let activeIndex = learnerObservationReporteComponent.currentSectionIndex;
    mockObservationService.submitObservation = jest.fn(()=>of({}))
    learnerObservationReporteComponent.previousQuestion();
    setTimeout(() => {
      expect(learnerObservationReporteComponent.currentSectionIndex).toBe(activeIndex-1)
      done();
    })
  });

  it('should update the index value on press next - submitd duplicate section', (done) => {
    let activeIndex = learnerObservationReporteComponent.currentSectionIndex;
    mockObservationService.submitObservation = jest.fn(()=>of({}))
    learnerObservationReporteComponent.nextQuestion();
    setTimeout(() => {
      expect(mockObservationService.submitObservation).toBeCalled();
      expect(learnerObservationReporteComponent.currentSectionIndex).toBe(activeIndex+1)
      done();
    })
  });

  it('should update the index value on press submit', async (done) => {
    mockObservationService.submitObservation = jest.fn(()=>of({}));
    const navigationExtras: NavigationExtras = {
      state: {
        observationDetails: { ...learnerObservationReporteComponent.observationDetails },
        observationData: { ...learnerObservationReporteComponent.observationData },
        canSubmit: true,
      }
    };
    await learnerObservationReporteComponent.nextQuestion();
    await learnerObservationReporteComponent.nextQuestion();
    let activeIndex = learnerObservationReporteComponent.currentSectionIndex;
    await learnerObservationReporteComponent.nextQuestion();
    setTimeout(() => {
      expect(mockObservationService.submitObservation).toBeCalled();
      expect(learnerObservationReporteComponent.currentSectionIndex).toBe(activeIndex);
      expect(mockRouter.navigate).toBeCalledWith([`${RouterLinks.MENTOR}/${RouterLinks.OBSERVATION_RESULTS}`], navigationExtras);
      done();
    })
  });

  it('should call showToast with the correct message', () => {
    // Call the showRequiredMessage method
    mockCommonUtilService.showToast = jest.fn();
    learnerObservationReporteComponent.showRequiredMessage();
    // Expect showToast to have been called with the correct message key
    expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('PLEASE_ANSWER_ALL_QUESTION');
  });

  it('canSubmit would be same as route param', async (done) => {
    mockObservationService.submitObservation = jest.fn(()=>of({}));
    const navigationExtras: NavigationExtras = {
      state: {
        observationDetails: { ...learnerObservationReporteComponent.observationDetails },
        observationData: { ...learnerObservationReporteComponent.observationData },
        canSubmit: false,
      }
    };
    initCompo();
    setTimeout(() => {
      expect(learnerObservationReporteComponent.canSubmit).toBeFalsy();
      done();
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    document.body.removeChild(div);
  });

});
