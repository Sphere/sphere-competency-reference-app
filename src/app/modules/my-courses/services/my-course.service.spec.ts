import { MyCourseService } from './my-course.service';

describe('MyCourseService', () => {
  let service: MyCourseService;

  beforeAll(() => {
    service = new MyCourseService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set and get started course data', (done) => {
    const testData = { course: 'Angular' };
    service.getStartedCourseData().subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });
    service.setStartedCourseData(testData);
  });

  it('should set and get recommended course data', (done) => {
    const testData = { course: 'React' };
    service.getRecomendedCourseData().subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });
    service.setRecomendedCourseData(testData);
  });

  it('should set and get completed course data', (done) => {
    const testData = { course: 'Vue' };
    service.getCompletedCourseData().subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });
    service.setCompletedCourseData(testData);
  });

  it('should set and get for you params', (done) => {
    const testData = { param: 'value' };
    service.getForYouParams().subscribe(data => {
      expect(data).toEqual(testData);
      done();
    });
    service.setForYouParams(testData);
  });

  it('should update and get for you count', () => {
    const testCount = 5;
    service.currentForYouCount.subscribe(count => {
      expect(count).toBe(testCount);
    });
    service.updateForYouCount(testCount);
  });
});
