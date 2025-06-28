import { ObservationService } from '../../services/observation.service';
import { ViwerObservationQuestionsComponent } from './viwer-observation-questions.component';
import { dateQuestion, dateQuestionDefault, multiselectInputArray, multiselectQuestion, textQuestion } from './viwer-observation-questions.component.spec.data';

describe('ViwerObservationQuestionsComponent', () => {

  let viwerObservationQuestionsComponent: ViwerObservationQuestionsComponent;
  const mockObservationService: Partial<ObservationService> = {};

  function initCompo(){
    viwerObservationQuestionsComponent = new ViwerObservationQuestionsComponent()
  }

  beforeAll(() => {
    initCompo();
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create', (done) => {
    expect(viwerObservationQuestionsComponent).toBeTruthy();
    done();
  });

  it('should check question type multiselect input array', (done) => {
    viwerObservationQuestionsComponent.question = multiselectQuestion;
    viwerObservationQuestionsComponent.ngOnInit();
    expect(viwerObservationQuestionsComponent.inputValue).toStrictEqual(multiselectInputArray);
    done();
  });

  it('should check question type date input value', (done) => {
    viwerObservationQuestionsComponent.question = dateQuestion;
    viwerObservationQuestionsComponent.ngOnInit()
    expect(viwerObservationQuestionsComponent.inputValue).toBe('');
    done();
  });

  it('should check question type date input value obj', (done) => {
    viwerObservationQuestionsComponent.question = dateQuestionDefault;
    let date = new Date('2024/01/01');
    viwerObservationQuestionsComponent.ngOnInit()
    expect(viwerObservationQuestionsComponent.inputValue).toStrictEqual(date);
    done();
  });

  it('should check question type text input value', (done) => {
    viwerObservationQuestionsComponent.question = textQuestion;
    viwerObservationQuestionsComponent.ngOnInit()
    expect(viwerObservationQuestionsComponent.inputValue).toBe('');
    done();
  });

  it('should check handleChange event', (done) => {
    let outPut = '';
    viwerObservationQuestionsComponent.inputValue = 2;
    const emitSpy = jest.spyOn(viwerObservationQuestionsComponent.onValueChage, 'emit');
    viwerObservationQuestionsComponent.handleChange(null);
    setTimeout(() => {
      expect(emitSpy).toHaveBeenCalledWith(viwerObservationQuestionsComponent.inputValue);
      done();
    },1000);
    
  });

});
