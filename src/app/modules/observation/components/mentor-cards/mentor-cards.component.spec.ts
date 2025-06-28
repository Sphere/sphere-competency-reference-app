import { NavigationExtras, Router } from '@angular/router';
import { MentorCardsComponent } from './mentor-cards.component';
import {
  mockDisplayConfigMentor,
  mockData,
  mockDisplayConfigStart
} from './mentor-cards.component.spec.data';
import { ElementRef } from '@angular/core';
import { RouterLinks } from '../../../../app.constant';

describe('MentorCardsComponent', () => {
  let component: MentorCardsComponent;

  const mockRouter: Partial<Router> = {
    navigate: jest.fn()
  };
  let buttonElement: ElementRef;

  beforeAll(() => {
    component = new MentorCardsComponent(
      mockRouter as Router
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check ngOnInit', () => {
    const mockData = {  result_percentage: 0, total_score: 0, acquired_score: 0 };
    component.showResult = true;
    component.data = mockData
    component.ngOnInit();
    expect(component.result_percentage).toEqual(mockData.result_percentage);
    expect(component.total_score).toEqual(mockData.total_score);
    expect(component.acquired_score).toEqual(mockData.acquired_score);
  });

  it('should check arrow button if display.arrowbtn = true', () => {
    component.display = mockDisplayConfigMentor;
    const navigationExtras: NavigationExtras = {
      state: {
        cardData: { ...mockData },
        mentee_id: mockData.mentee_id,
        activeTab: 'inProgress'
      }
    };
    mockRouter.navigate = jest.fn(() => Promise.resolve(true));
    component.mentee('mentee');
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should navigate to attempListNavigation', () => {
    const navigationExtras: NavigationExtras = {
      state: {
        cardData: { ...mockData },
        mentee_id: mockData.mentee_id,
        activeTab: 'inProgress'
      }
    };
    mockRouter.navigate = jest.fn(() => Promise.resolve(true));
    component.attempListNavigation('list');
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should check start button if display.button = true', () => {
    component.display = mockDisplayConfigStart;
    component.data = mockData;
    const navigationExtras: NavigationExtras = {
      state: {
        observationData: { ...component.data },
        canSubmit: true
      }
    };
    mockRouter.navigate = jest.fn(() => Promise.resolve(true));
    component.observation('start');
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should check resume button if display.button = true', () => {
    component.display = mockDisplayConfigStart;
    component.data = mockData;
    const navigationExtras: NavigationExtras = {
      state: {
        observationData: { ...component.data, showTimer: true },
        canSubmit: true
      }
    };
    mockRouter.navigate = jest.fn(() => Promise.resolve(true));
    component.observation('resume');
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should check view button if display.button = true', () => {
    component.display = mockDisplayConfigStart;
    component.data = mockData;
    const navigationExtras: NavigationExtras = {
      state: {
        observationData: { ...component.data, showTimer: false, showResult: true },
        canSubmit: false
      }
    };
    component.viewByLearner = true;
    mockRouter.navigate = jest.fn(() => Promise.resolve(true));
    component.observation('view');
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should check downloadObservation method', () => {
    component.viewByLearner = false;
    const navigationExtras: NavigationExtras = {
      state: {
        observationData: { ...component.data, showTimer: false, showResult: true },
        canSubmit: false
      }
    };
    mockRouter.navigate = jest.fn(() => Promise.resolve(true));
    component.downloadObservation();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

});


