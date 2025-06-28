import { of } from "rxjs";
import { ConfigurationsService } from "../../../../../library/ws-widget/utils/src/lib/services/configurations.service";
import { ObservationService } from "../../services/observation.service";
import { ScheduleDashboardComponent } from "./schedule-dashboard.component";

describe("ScheduleDashboardComponent", () => {
  let component: ScheduleDashboardComponent;

  const mockUserObserSvc: Partial<ObservationService> = {};
  const mockConfigSvc: Partial<ConfigurationsService> = {};

  beforeAll(() => {
    component = new ScheduleDashboardComponent(
          mockUserObserSvc as ObservationService,
          mockConfigSvc as ConfigurationsService,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a instance", () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with getscheduleList', () => {
    // arrange
    mockConfigSvc.userProfile = {
      userId: 'sample-user-id'
    }
    mockUserObserSvc.getAllSechedules = jest.fn(() => of([
      {
        sameDay: [
          {
            mentoring_relationship_id: 'sample-id',
            mentor_id: 'sample-mentor-id',
            mentee_id: 'sample-mentee-id',
            mentee_name: 'sample-mentee-name',
            mentee_contact_info: 'info',
            mentoring_observations: [
              {
                solution_id: 'sample-solution-id',
                solution_name: 'sample-solution-name1', scheduled_on, observationData, attempted_count
              }
            ]
          }
        ],
        overdue: 
        [
          {
            mentoring_relationship_id: 'sample-id',
            mentor_id: 'sample-mentor-id',
            mentee_id: 'sample-mentee-id',
            mentee_name: 'sample-mentee-name',
            mentee_contact_info: 'info',
            mentoring_observations: []
          }
        ],
        upcoming: [
          {
            mentoring_relationship_id: 'sample-id',
            mentor_id: 'sample-mentor-id',
            mentee_id: 'sample-mentee-id',
            mentee_name: 'sample-mentee-name',
            mentee_contact_info: 'info',
            mentoring_observations: []
          }
        ]
      }
    ])) as any;
    // act
    component.ngOnInit();
    // arrange
    expect(mockUserObserSvc.getAllSechedules).toHaveBeenCalled();
    expect(component.presentScheduleList).toBeTruthy();
    expect(component.overdueScheduleList).toBeTruthy();
    expect(component.upComingScheduleList).toBeTruthy();
  });

  it('should invoked toggleShowAllSchedules', () => {
    // arrange
    component.showAllSchedules = false;
    //act
    component.toggleShowAllSchedules();
    //assert
    expect(component.showAllSchedules).toBeTruthy();
  })

  it('should be called')
});
