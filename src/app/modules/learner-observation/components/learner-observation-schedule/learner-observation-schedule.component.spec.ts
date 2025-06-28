import { Config } from '@ionic/angular';
import {LearnerObservationScheduleComponent} from './learner-observation-schedule.component';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api';
import { TelemetryGeneratorService } from '../../../../../services';
import { ObservationService } from '../../../observation/services/observation.service';
import { of } from 'rxjs';

jest.mock("../../../core/services/cordova-http.service", () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
    },
  };
});

describe('LearnerObservationScheduleComponent', () => {
    let learnerObservationScheduleComponent: LearnerObservationScheduleComponent;
    const mockconfigSvc: Partial<ConfigurationsService> = {};
    const mockuserObserSvc: Partial<ObservationService> = {};
    const mocktelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

    beforeAll(() => {
        learnerObservationScheduleComponent = new LearnerObservationScheduleComponent(
           mockuserObserSvc as ObservationService,
                mockconfigSvc as ConfigurationsService,
                mocktelemetryGeneratorService as TelemetryGeneratorService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it("should create", () => {
        expect(learnerObservationScheduleComponent).toBeTruthy();
    });

    it('should call getSechdules on ngOnInit', () => {
        const spy = jest.spyOn(learnerObservationScheduleComponent, 'getSechdules');
        mockconfigSvc.userProfile = { userId: 'user-123' };
        mocktelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockuserObserSvc.getAllMenteSechedules = jest.fn(() => of([{
            sameDay: 'sameDay',
            overdue: 'overdue'
        }]));
        jest.useFakeTimers();
        learnerObservationScheduleComponent.ngOnInit();
        jest.advanceTimersByTime(200);
        expect(spy).toHaveBeenCalled();
        expect(mocktelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
        expect(mockuserObserSvc.getAllMenteSechedules).toHaveBeenCalledWith('user-123');
        jest.clearAllTimers();
    });

    it('mapToScheduleList should map data correctly', () => {
        const data = [
            {
                mentoring_relationship_id: 'rel-1',
                mentor_id: 'mentor-1',
                mentee_id: 'mentee-1',
                mentee_name: 'Test User',
                mentee_contact_info: '1112223333',
                mentoring_observations: [
                    {
                        solution_id: 'sol-1',
                        scheduled_on: '2024-06-10T00:00:00Z',
                        observationData: {
                            solution_name: 'Test Solution',
                            competency_data: { a: 1 }
                        }
                    }
                ]
            }
        ];
        const result = (learnerObservationScheduleComponent as any).mapToScheduleList(data);
        expect(result[0]).toMatchObject({
            mentoring_relationship_id: 'rel-1',
            mentor_id: 'mentor-1',
            mentee_id: 'mentee-1',
            mentee_name: 'Test User',
            mentee_contact_info: '1112223333',
            solution_id: 'sol-1',
            solution_name: 'Test Solution',
            scheduled_on: '10-06-2024',
            name: 'Test User',
            designation: 'Test Solution',
            competency_data: { a: 1 }
        });
    });

    it('getFormatDate should format date as dd-mm-yyyy', () => {
        const dateStr = '2024-06-15T00:00:00Z';
        const formatted = learnerObservationScheduleComponent.getFormatDate(dateStr);
        expect(formatted).toBe('15-06-2024');
    });

    it('generateImpressionEvent should call telemetryGeneratorService.generateImpressionTelemetry', () => {
        const mockTelemetry = jest.fn();
        (learnerObservationScheduleComponent as any).telemetryGeneratorService.generateImpressionTelemetry = mockTelemetry;
        learnerObservationScheduleComponent.generateImpressionEvent();
        expect(mockTelemetry).toHaveBeenCalled();
    });
})