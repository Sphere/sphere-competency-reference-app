import { MenteeProgressTrackerComponent } from './mentee-progress-tracker.component';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../../../../app/manage-learn/core';
import { ObservationService } from '../../services/observation.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { CommonUtilService } from '../../../../../services';
import { of, throwError } from 'rxjs';
import exp from 'constants';

describe('MenteeProgressTrackerComponent', () => {
  let component: MenteeProgressTrackerComponent;
  let router: Partial<Router>;
  let localStorage: Partial<LocalStorageService>;
  let userObserSvc: Partial<ObservationService>;
  let configSvc: Partial<ConfigurationsService>;
  let commonUtilService: Partial<CommonUtilService>;

  beforeEach(() => {
    router = {
      getCurrentNavigation: jest.fn().mockReturnValue({
        extras: {
          state: {
            activeTab: 'mentee',
            cardData: {
              mentor_id: 'mentor123',
              mentee_id: 'mentee123',
              id: 'solution123',
              name: 'Observation Name'
            }
          }
        }
      }),
      navigate: jest.fn()
    };

    localStorage = {
      getLocalStorage: jest.fn().mockResolvedValue({
        mentorId: 'mentor123',
        menteeId: 'mentee123',
        solutionId: 'solution123',
        name: 'Observation Name'
      }),
      setLocalStorage: jest.fn()
    };

    userObserSvc = {
      getAllObservationForMentee: jest.fn().mockReturnValue(of({ data: [] })),
      getAttempsOfMentee: jest.fn().mockReturnValue(of({ result: {
        attempts: [{ observationId: 'observation123' , mentor_id: 'mentor123', info: { status: 'completed' } }]
      } })),
      getAttempsOfObservations: jest.fn().mockReturnValue(of({ result: {
        attempts: { observationId: 'observation123' , mentor_id: 'mentor123', info: { status: 'completed' }, attempts: [{
          attemptId: 'attempt123',
          mentoring_relationship_id: 'mentoring123',
          mentor_id: 'mentor123',
          observation_id: 'observation123',
          observation_name: 'Observation Name',
          status: 'completed',
          mentee_id: 'mentee123',
          createdAt: '2021-06-01T00:00:00.000Z',
          attempt_serial_number: 1,
          result_percentage: 100,
          total_score: 100,
          acquired_score: 100,
          submission_id: 'submission123',
          submission_status: 'submitted',
          observationAttemptsMetaData: {
            solution_id: 'solution123',
            solution_name: 'Observation Name'
          }
        }] },
        solution_name: 'Observation Name'
      } }))
    };

    configSvc = {
      userProfile: {
        userId: 'user123'
      }
    };

    commonUtilService = {
      addLoader: jest.fn(),
      translateMessage: jest.fn().mockReturnValue('No result found')
    };

    component = new MenteeProgressTrackerComponent(
      router as Router,
      localStorage as LocalStorageService,
      userObserSvc as ObservationService,
      configSvc as ConfigurationsService,
      commonUtilService as CommonUtilService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set last visited details and fetch observations for mentee', () => {
    expect(localStorage.setLocalStorage).toHaveBeenCalledWith('lastVisitedDetails', {
      mentorId: 'mentor123',
      menteeId: undefined,
    });
    expect(userObserSvc.getAllObservationForMentee).toHaveBeenCalledWith(undefined);
    expect(userObserSvc.getAttempsOfMentee).toHaveBeenCalledWith('mentor123', undefined);
  });

  it('should set last visited details and fetch observations for observation', () => {
    jest.spyOn(router, 'getCurrentNavigation').mockReturnValue({
      extras: {
        state: {
          activeTab: 'observation',
          cardData: {
            mentor_id: 'mentor123',
            id: 'solution123',
            name: 'Observation Name'
          }
        }
      }
    } as any);

    component = new MenteeProgressTrackerComponent(
      router as Router,
      localStorage as LocalStorageService,
      userObserSvc as ObservationService,
      configSvc as ConfigurationsService,
      commonUtilService as CommonUtilService
    );

    expect(localStorage.setLocalStorage).toHaveBeenCalledWith('lastVisitedDetails', {
      mentorId: 'mentor123',
      solutionId: 'solution123',
      name: 'Observation Name'
    });
    expect(userObserSvc.getAttempsOfObservations).toHaveBeenCalledWith('mentor123', 'solution123');
    expect(component.observationData).toEqual({ name: 'Observation Name' });
  });

  describe('getObservationForMentee', () => {
    it('should fetch observations for mentee', () => {
      commonUtilService.addLoader = jest.fn(() => Promise.resolve());
      userObserSvc.getAllObservationForMentee = jest.fn().mockReturnValue(of({ data: [
        { observationId: 'observation123' , mentor_id: 'mentor123',
          mentoring_observations: [
            { observationId: 'observation123' , mentor_id: 'mentor123',info: { status: 'completed' }, 
            observationData: {competency_data: [{competency: 'competency123'}]}, submission_status: '' },
            { observationId: 'observation456' , mentor_id: 'mentor123', info: { status: 'completed' } },]
        }
      ] }));
      configSvc.userProfile = { userId  : 'mentor123' };
      router.navigate = jest.fn(() => Promise.resolve(true));
      //act
      component.getObservationForMentee('mentee123');
      expect(userObserSvc.getAllObservationForMentee).toHaveBeenCalledWith('mentee123');
      expect(userObserSvc.getAttempsOfMentee).toHaveBeenCalled();
      expect(commonUtilService.addLoader).toHaveBeenCalled();
    });

    it('should fetch observations for other id', () => {
      commonUtilService.addLoader = jest.fn(() => Promise.resolve());
      userObserSvc.getAllObservationForMentee = jest.fn().mockReturnValue(of({ data: [
        { observationId: 'observation123' , mentor_id: 'mentor123' }
      ] }));
      configSvc.userProfile = { userId  : 'mentor1234' };
      router.navigate = jest.fn(() => Promise.resolve(true));
      //act
      component.getObservationForMentee('mentee123');
      expect(userObserSvc.getAllObservationForMentee).toHaveBeenCalledWith('mentee123');
      expect(userObserSvc.getAttempsOfMentee).toHaveBeenCalled();
      expect(commonUtilService.addLoader).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['mentor/mentees-list']);
    });

    it('should fetch observations for error part', () => {
      commonUtilService.addLoader = jest.fn(() => Promise.resolve());
      userObserSvc.getAllObservationForMentee = jest.fn().mockReturnValue(throwError({}));
      configSvc.userProfile = { userId  : 'mentor1234' };
      router.navigate = jest.fn(() => Promise.resolve(true));
      //act
      component.getObservationForMentee('mentee123');
      expect(userObserSvc.getAllObservationForMentee).toHaveBeenCalledWith('mentee123');
      expect(userObserSvc.getAttempsOfMentee).toHaveBeenCalled();
      expect(commonUtilService.addLoader).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['mentor/mentees-list']);
    });
  });

  it('should fetch last mentee id and fetch observations', async () => {
    jest.spyOn(router, 'getCurrentNavigation').mockReturnValue(null);

    component = new MenteeProgressTrackerComponent(
      router as Router,
      localStorage as LocalStorageService,
      userObserSvc as ObservationService,
      configSvc as ConfigurationsService,
      commonUtilService as CommonUtilService
    );

    await component.fetchLastMenteeId();

    expect(localStorage.getLocalStorage).toHaveBeenCalledWith('lastVisitedDetails');
    expect(userObserSvc.getAllObservationForMentee).toHaveBeenCalledWith('mentee123');
    expect(userObserSvc.getAttempsOfMentee).toHaveBeenCalledWith('mentor123', 'mentee123');
  });

  it('should navigate to previous URL if no last visited details found', async () => {
    jest.spyOn(localStorage, 'getLocalStorage').mockRejectedValue(new Error('No data'));
    component = new MenteeProgressTrackerComponent(
      router as Router,
      localStorage as LocalStorageService,
      userObserSvc as ObservationService,
      configSvc as ConfigurationsService,
      commonUtilService as CommonUtilService
    );
    // act
    await component.fetchLastMenteeId();
    // assert
    expect(router.navigate).toHaveBeenCalledWith([component.prevUrl]);
  });

  it('should invoked ngOnInit', () => {
    commonUtilService.translateMessage = jest.fn().mockReturnValue('No result found');
    component.ngOnInit();
    expect(component.noResultData.message).toEqual('No result found');
  })

 it('should navigate to MenteeList', () => {
    router.navigate = jest.fn(() => Promise.resolve(true));
    component.navigateToMenteeList();
    expect(router.navigate).toHaveBeenCalledWith(['mentor/mentees-list']);
  });

  describe('getMenteeAttemps', () => {
    it('should fetch observations for mentee', () => {
      commonUtilService.addLoader = jest.fn(() => Promise.resolve());
      userObserSvc.getMenteeAttemps = jest.fn().mockReturnValue(of([
        { observationId: 'observation123' , mentor_id: 'mentor123',
          observationAttemptsMetaData: {
            observationId: 'observation123' , mentor_id: 'mentor123',info: { status: 'completed' }, 
            competency_data: [{competency: 'competency123'}], submission_status: '' 
        }
      }
      ]));
      //act
      component.getMenteeAttemps('mentee123');
      expect(userObserSvc.getMenteeAttemps).toHaveBeenCalledWith({ mentor_id: 'user123', mentee_id: 'mentee123' });
    });

    it('should fetch observations for error part', () => {
      commonUtilService.addLoader = jest.fn(() => Promise.resolve());
      userObserSvc.getMenteeAttemps = jest.fn().mockReturnValue(throwError({error: {message: 'error'}}));
      //act
      component.getMenteeAttemps('mentee123');
      expect(userObserSvc.getMenteeAttemps).toHaveBeenCalled();
    });
  });
});