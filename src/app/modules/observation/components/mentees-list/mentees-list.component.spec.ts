import { MenteesListComponent } from './mentees-list.component';
import { ObservationService } from '../../services/observation.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { CommonUtilService } from '../../../../../services'
import { of, throwError } from 'rxjs';
import exp from 'constants';
import { error } from 'console';

  const menteeData: any = [
    { mentee_name: 'Mentee1', mentee_designation: 'Designation1' },
    { mentee_name: 'Mentee2', mentee_designation: 'Designation2' },
  ];
  const menteeList: any = [
    { name: 'Mentee1', designation: 'Designation1', mentee_name: 'Mentee1', mentee_designation: 'Designation1' },
    { name: 'Mentee2', designation: 'Designation2', mentee_name: 'Mentee2', mentee_designation: 'Designation2' },
  ];

  const observationData: any = {
    solutionsList: {
      '1': 'Observation1',
      '2': 'Observation2'
    }
  };

  const observationList: any = [
    { id: '1', name: 'Observation1', mentor_id: '1234' },
    { id: '2', name: 'Observation2', mentor_id: '1234' }
  ];

  const observationCountData: any = {
    data: {
      pending: 2,
      inProgress: 1,
      completed: 3
    }
  };

  describe('MenteesListComponent', () => {
    let menteesListComponent: MenteesListComponent;
    const mockObservationService: Partial<ObservationService> = {};
    const mockConfigurationsService: Partial<ConfigurationsService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};

    beforeAll(() => {
      menteesListComponent = new MenteesListComponent(
        mockObservationService as ObservationService,
        mockConfigurationsService as ConfigurationsService,
        mockCommonUtilService as CommonUtilService,
      );
      mockCommonUtilService.addLoader = jest.fn();
    })
    beforeEach(() => {
      mockConfigurationsService.userProfile = { userId: '1234' };
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it('should be create a instance of mentee list', () => {
      expect(menteesListComponent).toBeTruthy();
    });

    it('should call ngOnInit and getAllMentee on component initialization', (done) => {
      mockObservationService.getAllMenteeForMentor = jest.fn(() => of({ data: menteeData }));
      mockCommonUtilService.translateMessage = jest.fn();
      mockObservationService.getObservationListMentor = jest.fn(() => of(observationData));
      mockObservationService.getMentorObservationCount = jest.fn(() => of(observationCountData));
      menteesListComponent.ngOnInit();
      expect(mockCommonUtilService.addLoader).toHaveBeenCalled();
      expect(mockObservationService.getAllMenteeForMentor).toHaveBeenCalled();
      expect(mockObservationService.getObservationListMentor).toHaveBeenCalled();
      expect(mockObservationService.getMentorObservationCount).toHaveBeenCalled
      done();
    });

    it('should call ngOnInit and getAllMentee on component initialization for catch part', (done) => {
      mockObservationService.getAllMenteeForMentor = jest.fn(() => of({ data: menteeData }));
      mockCommonUtilService.translateMessage = jest.fn();
      mockObservationService.getObservationListMentor = jest.fn(() => of(observationData));
      mockObservationService.getMentorObservationCount = jest.fn(() => throwError({error: 'error'}));
      menteesListComponent.ngOnInit();
      expect(mockCommonUtilService.addLoader).toHaveBeenCalled();
      expect(mockObservationService.getAllMenteeForMentor).toHaveBeenCalled();
      expect(mockObservationService.getObservationListMentor).toHaveBeenCalled();
      expect(mockObservationService.getMentorObservationCount).toHaveBeenCalled
      done();
    });

    it('should filter mentee list based on search text', () => {
      menteesListComponent.mentieeList = menteeList;
      menteesListComponent.serchText = 'Mentee1';
      menteesListComponent.onSearchChange({});
      expect(menteesListComponent.menteeCount).toEqual(1);
    });

    it('should reset mentee list when search text is empty', () => {
      menteesListComponent.mentieeList = menteeList;
      menteesListComponent.serchText = '';
      menteesListComponent.onSearchChange({});
      expect(menteesListComponent.menteeCount).toEqual(2);
    });
});
