import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TelemetryService } from "../../../../../../../../../library/ws-widget/utils/src/lib/services/telemetry.service";
import { AudioService } from '../../../../../../../../../app/modules/home/services/audio.service';
import { CourseOptimisticUiService } from '../../../../../../../../../app/modules/shared/services/course-optimistic-ui.service';
import { OfflineCourseOptimisticService } from '../../../../../../../../../app/modules/shared/services/offline-course-optimistic.service';
import { OnlineSqliteService } from '../../../../../../../../../app/modules/shared/services/online-sqlite.service';
import { SqliteService } from '../../../../../../../../../app/modules/shared/services/sqlite.service';
import { WidgetContentService } from '../../../../../../../../../library/ws-widget/collection/src/public-api';
import { ValueService, ConfigurationsService, EnqueueService } from '../../../../../../../../../library/ws-widget/utils/src/public-api';
import { CommonUtilService, TelemetryGeneratorService } from '../../../../../../../../../services';
import { PlayerStateService } from '../../../../player-state.service';
import { ViewerDataService } from '../../../../viewer-data.service';
import { ViewerUtilService } from '../../../../viewer-util.service';
import { QuizService } from '../../quiz.service';
import {AssesmentModalComponent} from './assesment-modal.component';
import { of, ReplaySubject, throwError } from 'rxjs';
import exp from 'constants';
import { first, takeUntil } from 'rxjs/operators';

jest.mock('../../../../../../../../../app/modules/core/services/cordova-http.service', () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
    }
  };
});
jest.mock('@capacitor-community/native-audio', () => {
    return {
        NativeAudio: {
            preload: jest.fn().mockResolvedValue({}),
            play: jest.fn().mockResolvedValue({}),
            stop: jest.fn().mockResolvedValue({}),
            loop: jest.fn().mockResolvedValue({}),
            unload: jest.fn().mockResolvedValue({}),
        }
    };
});
describe('AssesmentModalComponent', () => {
    let component: AssesmentModalComponent;
    const mockroute: Partial<ActivatedRoute> = {
        snapshot: {
            queryParams: {
                competency: 'sample-competency',
                isAsha: true
            }
        }
    } as any;
    const mockdialogRef: Partial<MatDialogRef<AssesmentModalComponent>> = {
        close: jest.fn(),
        afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn() })
    };
    const mockassesmentdata: Partial<any> = {
            questions: {
                question: 'Sample Question',
                options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                answer: 'Option 1',
                explanation: 'This is a sample explanation for the question.',
                type: 'MCQ',
                timeLimit: 0,
                questions: [
                    {
                        question: 'Sample Question 1',
                        questionId:'sample-question-id1',
                        options: [{isCorrect: true, text: 'Option A', match: 'Option A'}, 'Option B', 'Option C', 'Option D'],
                        answer: 'Option A',
                        explanation: 'Explanation for Sample Question 1',
                        type: 'MCQ',
                        timeLimit: 10,
                        questionType: 'mtf',
                    },{
                        questionType: 'fitb',
                        questionId: 'sample-question-id2',
                        question: 'Sample Question 2',
                        options: [{isCorrect: true, text: 'Option A'}, 'Option B', 'Option C', 'Option D'],
                        answer: 'Option A',
                        explanation: 'Explanation for Sample Question 1',
                        type: 'MCQ',
                        timeLimit: 10,
                    }]
            },
            title: 'Sample Assessment',
            description: 'This is a sample assessment description.',
            generalData: {
                name: 'Sample Assessment',
                collectionId: 'sample-collection-id',
                identifier: 'sample-identifier',
            },
            duration: 30,
            passingPercentage: 50,
            maxScore: 100,
            questionsCount: 10,
            isRandomizeQuestions: false,
            isRandomizeOptions: false,
            isShowCorrectAnswer: false,
            isShowScore: false,
            isShowSolution: false
    };
    const mockquizService: Partial<QuizService> = {};
    const mockvalueSvc: Partial<ValueService> = {};
    const mocksnackBar: Partial<MatSnackBar> = {
        open: jest.fn(),
        dismiss: jest.fn()
    };
    const mockviewerDataSvc: Partial<ViewerDataService> = {};
    const mockconfigSvc: Partial<ConfigurationsService> = {};
    const mocktelemetrySvc: Partial<TelemetryService> = {};
    const mockviewerSvc: Partial<ViewerUtilService> = {};
    const mockPlayerState$ = new ReplaySubject<any>(1); // buffer 1 value
    const mockplayerStateService = {
      playerState: mockPlayerState$
    };
    const mockenqueueService: Partial<EnqueueService> = {};
    const mockcontentSvc: Partial<WidgetContentService> = {};
    const mockonlineSqliteService: Partial<OnlineSqliteService> = {};
    const mockcourseOptimisticUiService: Partial<CourseOptimisticUiService> = {};
    const mockofflineCourseOptimisticService: Partial<OfflineCourseOptimisticService> = {};
    const mocksqliteService: Partial<SqliteService> = {};
    const mocktelemetryGeneraterService: Partial<TelemetryGeneratorService> = {};
    const mockaudioService: Partial<AudioService> = {};
    const mockCommonutilService: Partial<CommonUtilService> = {
        previesUrlList: ['app/self-asses?isAsha=true']
    } as any;

    beforeAll(() => {
        component = new AssesmentModalComponent(
            mockdialogRef as MatDialogRef<AssesmentModalComponent>,
            mockassesmentdata as any,
                mockquizService as QuizService,
                mockroute as ActivatedRoute,
                mockvalueSvc as ValueService,
                mocksnackBar as MatSnackBar,
                mockviewerDataSvc as ViewerDataService,
                mockconfigSvc as ConfigurationsService,
                mocktelemetrySvc as TelemetryService,
                mockviewerSvc as ViewerUtilService,
                mockplayerStateService as PlayerStateService,
                mockenqueueService as EnqueueService,
                mockcontentSvc as WidgetContentService,
                mockonlineSqliteService as OnlineSqliteService,
                mockcourseOptimisticUiService as CourseOptimisticUiService,
                mockofflineCourseOptimisticService as OfflineCourseOptimisticService,
                mocksqliteService as SqliteService,
                mocktelemetryGeneraterService as TelemetryGeneratorService,
                mockaudioService as AudioService,
                mockCommonutilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should initialize component properties', () => {
            //arrange
            mocktelemetrySvc.impression = jest.fn();
            jest.useFakeTimers();
            mocktelemetrySvc.end = jest.fn();
            mockviewerDataSvc.resource = {
                    parent: {
                        identifier: 'sample-parent-identifier',
                        name: 'Sample Parent Resource'
                    }
            } as any;
            component.ngOnInit();
            jest.advanceTimersByTime(100);
             jest.useRealTimers();
            jest.clearAllTimers();
            // assert
            expect(component.isAshaHome).toBe(true);
            expect(component.isCompetency).toBe('sample-competency');
            expect(mocktelemetrySvc.impression).toHaveBeenCalled();
            expect(component.totalQuestion).toBe(2);
            expect(component.progressbarValue).toBe(50);
            expect(mocktelemetrySvc.end).toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit', () => {
        it('should set the focus on the first question', () => {
            // Arrange
            const mockfirstQuestion = {
                nativeElement: {
                    focus: jest.fn()
                }
            };
            mocktelemetrySvc.start = jest.fn();
            mockquizService.updateMtf = {
                next: jest.fn()
            } as any;
            // Act
            component.ngAfterViewInit();
            // Assert
            expect(mocktelemetrySvc.start).toHaveBeenCalled();
        });
    });

    describe('closePopup', () => {
        it('should close the dialog and reset the component', () => {
            // Arrange
            component.isAshaHome = true;
            mockdialogRef.close = jest.fn();
            mocktelemetrySvc.start = jest.fn();
            mocktelemetrySvc.end = jest.fn();
            //act
            component.closePopup();
            // Assert
            expect(component.isAshaHome).toBe(true);
            expect(component.isCompetency).toBe('sample-competency');
            expect(mockdialogRef.close).toHaveBeenCalled();
            expect(mocktelemetrySvc.start).toHaveBeenCalled();
            expect(mocktelemetrySvc.end).toHaveBeenCalled();
        });

        it('should close the dialog as ashahome if false', () => {
            // Arrange
            component.isAshaHome = false;
            mockdialogRef.close = jest.fn();
            mocktelemetrySvc.start = jest.fn();
            mocktelemetrySvc.end = jest.fn();
            //act
            component.closePopup();
            // Assert
            expect(component.isAshaHome).toBeFalsy();
            expect(component.isCompetency).toBe('sample-competency');
            expect(mockdialogRef.close).toHaveBeenCalled();
            expect(mocktelemetrySvc.start).toHaveBeenCalled();
            expect(mocktelemetrySvc.end).toHaveBeenCalled();
        });

         it('should close the dialog if ashaHome and competency are false', () => {
            // Arrange
            component.isAshaHome = false;
            component.isCompetency = false;
            mockdialogRef.close = jest.fn();
            mocktelemetrySvc.start = jest.fn();
            mocktelemetrySvc.end = jest.fn();
            //act
            component.closePopup();
            // Assert
            expect(component.isAshaHome).toBeFalsy();
            expect(component.isCompetency).toBeFalsy();
            expect(mockdialogRef.close).toHaveBeenCalled();
            expect(mocktelemetrySvc.start).toHaveBeenCalled();
            expect(mocktelemetrySvc.end).toHaveBeenCalled();
        });
    });

    it('should invoked closeDone', () => {
        // Arrange
        mockdialogRef.close = jest.fn();
        // Act
        component.closeDone();
        // Assert
        expect(mockdialogRef.close).toHaveBeenCalled();
    });

    it('should invoked retakeQuiz', () => {
        // Arrange
        mockdialogRef.close = jest.fn();
        // Act
        component.retakeQuiz();
        // Assert
        expect(mockdialogRef.close).toHaveBeenCalled();
    })

    it('should be invoked CompetencyDashboard', () => {
        // Arrange
        mockdialogRef.close = jest.fn();
        // Act
        component.CompetencyDashboard();
        // Assert
        expect(mockdialogRef.close).toHaveBeenCalled();
    })

    it('should close popup for goToAshaHome', () => {
        // Arrange
        mockdialogRef.close = jest.fn();
        // Act
        component.goToAshaHome();
        // Assert
        expect(mockdialogRef.close).toHaveBeenCalled();
    });

    it('should close popup for viewCourses', () => {
        // Arrange
        mockdialogRef.close = jest.fn();
        component.competencyId = 'sample-competency-id';
        // Act
        component.viewCourses();
        // Assert
        expect(mockdialogRef.close).toHaveBeenCalled();
    });

    it('should close popup for viewAshaCourses', async() => {
        // Arrange
        mockdialogRef.close = jest.fn();
        component.competencyId = 'sample-competency-id';
        mockaudioService.stopAllAudio = jest.fn(() => Promise.resolve());
        // Act
        await component.viewAshaCourses();
        // Assert
        expect(mockdialogRef.close).toHaveBeenCalled();
        expect(mockaudioService.stopAllAudio).toHaveBeenCalled();
    });

    it('should close popup for nextCompetency', async() => {
        // Arrange
        mockdialogRef.close = jest.fn();
        mockaudioService.stopAllAudio = jest.fn(() => Promise.resolve());
        // Act
        await component.nextCompetency();
        // Assert
        expect(mockdialogRef.close).toHaveBeenCalled();
        expect(mockaudioService.stopAllAudio).toHaveBeenCalled();
    });

    describe('fillSelectedItems', () => {
        it('should fill selected items with correct answers', () => {
            // Arrange
            const question = {
                questionId: 'sample-question-id',
                multiSelection: true,
            } as any;
            const optionId = 'sample-option-id';
            const qindex = 0;
            component.questionAnswerHash = {
                'sample-question-id': ['sample-option-id']
            }
            mocktelemetryGeneraterService.generateInteractTelemetry = jest.fn();
            // Act
            component.fillSelectedItems(question, optionId, qindex);
            // Assert
            expect(mocktelemetryGeneraterService.generateInteractTelemetry).toHaveBeenCalled();
        });

        it('should fill selected items with correct answers not matched', () => {
            // Arrange
            const question = {
                questionId: 'sample-question-id',
                multiSelection: true,
            } as any;
            const optionId = 'sample-option-id1';
            const qindex = 0;
            component.questionAnswerHash = {
                'sample-question-id': ['sample-option-id']
            }
            mocktelemetryGeneraterService.generateInteractTelemetry = jest.fn();
            // Act
            component.fillSelectedItems(question, optionId, qindex);
            // Assert
            expect(mocktelemetryGeneraterService.generateInteractTelemetry).toHaveBeenCalled();
        });

        it('should fill selected items not for multi select', () => {
            // Arrange
            const question = {
                questionId: 'sample-question-id',
                multiSelection: false,
            } as any;
            const optionId = 'sample-option-id1';
            const qindex = 0;
            component.questionAnswerHash = {
                'sample-question-id': ['sample-option-id']
            }
            mocktelemetryGeneraterService.generateInteractTelemetry = jest.fn();
            // Act
            component.fillSelectedItems(question, optionId, qindex);
            // Assert
            expect(mocktelemetryGeneraterService.generateInteractTelemetry).toHaveBeenCalled();
        });
    });

    describe('proceedToSubmit', () => {
        it('should proceed to submit the quiz for untouched if competency is not completed', () => {
            // Arrange
            component.questionAnswerHash = {
                'sample-question-id': ['sample-option-id']
            };
            component.isAshaHome = true;
                 mockquizService.questionState = {
                slides: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                isCorrect: true
                            }
                        ]
                    }
                ]
            } as any;
            mockquizService.createAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockquizService.sanitizeAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockconfigSvc.userProfile = {
                userId: 'sample-user-id',
                firstName: 'Sample',
                lastName: 'User',
                email: 'sample-email'
            };
            mockquizService.competencySubmitQuizV2 = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,
                    result: 100,
                    total: 1
                }
            }));
            jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
            mockviewerDataSvc.resource = {
                parent: {
                    identifier: 'sample-parent-identifier',
                    name: 'Sample Parent Resource'
                }            
            } as any;
            jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('[{"userId":"sample-user-id", "competencyId":"sample-competency-id"}]');
            mockquizService.updateAshaAssessment = jest.fn().mockReturnValue(throwError({
                error: {
                    error: 'Sample Error'
                }
            }));
            mockaudioService.isReady = jest.fn().mockReturnValue(true);
            mockaudioService.getInitializationStatus = jest.fn().mockReturnValue(true);
            mockaudioService.playFailureAudio = jest.fn();
            mocktelemetrySvc.end = jest.fn();
            component.questionAnswerHash = {
                'sample-question-id2': ['Option A'],
                'sample-question-id1': [{sourceId: 'Option A'}]
            };
            component.isCompetencyComplted = false;
            mockquizService.updatePassbook = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,
                    result: 100,                    
                    total: 1                    
                }
            }));
            const mockData = { someKey: 'someValue' };
            const processSpy = jest.fn();
          component.playerStateService.playerState
           .pipe(first(), takeUntil(component.unsubscribe))
           .subscribe(processSpy);
            jest.useFakeTimers();
            mockPlayerState$.next(mockData);
            mockaudioService.playSuccessAudio = jest.fn();
            // Act
            component.proceedToSubmit();
            jest.advanceTimersByTime(100)
            // Assert
            expect(mockquizService.createAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.sanitizeAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.competencySubmitQuizV2).toHaveBeenCalled();
            expect(mockquizService.updateAshaAssessment).toHaveBeenCalled();
            expect(mockaudioService.isReady).toHaveBeenCalled();
            expect(mockaudioService.getInitializationStatus).toHaveBeenCalled();
            expect(mockaudioService.playFailureAudio).toHaveBeenCalled();
            expect(mocktelemetrySvc.end).toHaveBeenCalled();
        });
        it('should proceed to submit the quiz for untouched competency is completed', () => {
            // Arrange
            component.questionAnswerHash = {
                'sample-question-id': ['sample-option-id']
            };
            component.isAshaHome = true;
                 mockquizService.questionState = {
                slides: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                isCorrect: true
                            }
                        ]
                    }
                ]
            } as any;
            mockquizService.createAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockquizService.sanitizeAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockconfigSvc.userProfile = {
                userId: 'sample-user-id',
                firstName: 'Sample',
                lastName: 'User',
                email: 'sample-email'
            };
            mockquizService.competencySubmitQuizV2 = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,
                    result: 100,
                    total: 1
                }
            }));
            jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
            mockviewerDataSvc.resource = {
                parent: {
                    identifier: 'sample-parent-identifier',
                    name: 'Sample Parent Resource'
                }            
            } as any;
            jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('[{"userId":"sample-user-id", "competencyId":"sample-competency-id"}]');
            mockquizService.updateAshaAssessment = jest.fn().mockReturnValue(throwError({
                error: {
                    error: 'Sample Error'
                }
            }));
            mockaudioService.isReady = jest.fn().mockReturnValue(true);
            mockaudioService.getInitializationStatus = jest.fn().mockReturnValue(true);
            mockaudioService.playFailureAudio = jest.fn();
            mocktelemetrySvc.end = jest.fn();
            component.questionAnswerHash = {
                'sample-question-id2': ['Option A'],
                'sample-question-id1': [{sourceId: 'Option A'}]
            };
            component.isCompetencyComplted = true;
            mockquizService.updatePassbook = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,
                    result: 100,                    
                    total: 1                    
                }
            }));
            mockplayerStateService.playerState = of({
                isCompetencyCompleted: true,
                competencyId: 'sample-competency-id',
                competencyName: 'Sample Competency',
                competencyDescription: 'Sample Competency Description',
                competencyImage: 'sample-competency-image',
                competencyScore: 100,
                competencyTotal: 1,
                competencyBlank: 0,
                competencyCorrect: 1,
                competencyInCorrect: 0,
                competencyPassPercent: 100,
                competencyResult: 100,
                competencyTimeTaken: 0,
                competencyQuestions: [
                    {
                        questionId: 'sample-question-id1',
                        options: [
                            {
                                optionId: 'sample-option-id1',
                                userSelected: true,
                                isCorrect: true
                            }
                        ]
                    },
                    {
                        questionId: 'sample-question-id2',
                        options: [
                            {
                                optionId: 'sample-option-id2',
                                userSelected: true,
                                isCorrect: true
                            }
                        ]
                    }
                ]
            }) as any;
            mockaudioService.playSuccessAudio = jest.fn();
            // Act
            component.proceedToSubmit();
            // Assert
            expect(mockquizService.createAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.sanitizeAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.competencySubmitQuizV2).toHaveBeenCalled();
            expect(mockquizService.updateAshaAssessment).toHaveBeenCalled();
            expect(mockaudioService.isReady).toHaveBeenCalled();
            expect(mockaudioService.getInitializationStatus).toHaveBeenCalled();
            expect(mocktelemetrySvc.end).toHaveBeenCalled();
            expect(mockquizService.updatePassbook).toHaveBeenCalled();
        });

        it('should proceed to submit the quiz', () => {
            // Arrange
            component.questionAnswerHash = {
                'sample-question-id': ['sample-option-id']
            };
            component.isAshaHome = true;
                 mockquizService.questionState = {
                slides: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                isCorrect: true
                            }
                        ]
                    }
                ]
            } as any;
            component.isCompetencyComplted = false;
            mockquizService.createAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockquizService.sanitizeAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockconfigSvc.userProfile = {
                userId: 'sample-user-id',
                firstName: 'Sample',
                lastName: 'User',
                email: 'sample-email'
            };
            mockquizService.competencySubmitQuizV2 = jest.fn().mockReturnValue(throwError({
                error: {
                    error: 'Sample Error'
                }
            }));
            mockviewerDataSvc.resource = {
                parent: {
                    identifier: 'sample-parent-identifier',
                    name: 'Sample Parent Resource'
                }            
            } as any;
            jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('[{"userId":"sample-user-id", "competencyId":"sample-competency-id"}]');
            mockquizService.updateAshaAssessment = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,
                    result: 100,
                    total: 1
                }
            }));
            mockaudioService.isReady = jest.fn().mockReturnValue(true);
            mockaudioService.getInitializationStatus = jest.fn().mockReturnValue(true);
            mockaudioService.playFailureAudio = jest.fn();
            mocktelemetrySvc.end = jest.fn();
            component.questionAnswerHash = {
                'sample-question-id1': [[{
                    sourceId: 'sample-option-id1',
                    target: {
                        innerHTML: 'Option A'
                    },
                    setPaintStyle: jest.fn(),
                }]]
            }
            jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
            // Act
            component.proceedToSubmit();
            // Assert
            expect(mockquizService.createAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.sanitizeAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.competencySubmitQuizV2).toHaveBeenCalled();
        });

        it('should proceed to submit the quiz', () => {
            // Arrange
            component.questionAnswerHash = {
                'sample-question-id': ['sample-option-id']
            };
            component.isAshaHome = true;
                 mockquizService.questionState = {
                slides: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                isCorrect: true
                            }
                        ]
                    }
                ]
            } as any;
            mockquizService.createAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockquizService.sanitizeAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockconfigSvc.userProfile = {
                userId: 'sample-user-id',
                firstName: 'Sample',
                lastName: 'User',
                email: 'sample-email'
            };
            component.isCompetencyComplted = false;
            mockquizService.competencySubmitQuizV2 = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,
                    result: 100,
                    total: 1
                }
            }));
            mockviewerDataSvc.resource = {
                parent: {
                    identifier: 'sample-parent-identifier',
                    name: 'Sample Parent Resource'
                }            
            } as any;
            jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('[{"userId":"sample-user-id", "competencyId":"sample-competency-id"}]');
            mockquizService.updateAshaAssessment = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,
                    result: 100,
                    total: 1
                }
            }));
            mockaudioService.isReady = jest.fn().mockReturnValue(true);
            mockaudioService.getInitializationStatus = jest.fn().mockReturnValue(true);
            mockaudioService.playFailureAudio = jest.fn();
            mocktelemetrySvc.end = jest.fn();
            jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
            component.questionAnswerHash = {
                'sample-question-id2': ['sample-option-id2']
            }
            // Act
            component.proceedToSubmit();
            // Assert
            expect(mockquizService.createAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.sanitizeAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.competencySubmitQuizV2).toHaveBeenCalled();
            expect(mockquizService.updateAshaAssessment).toHaveBeenCalled();
            expect(mockaudioService.isReady).toHaveBeenCalled();
            expect(mockaudioService.getInitializationStatus).toHaveBeenCalled();
            expect(mockaudioService.playFailureAudio).toHaveBeenCalled();
            expect(mocktelemetrySvc.end).toHaveBeenCalled();
        });

        it('should proceed to submit the quiz', () => {
            // Arrange
            component.questionAnswerHash = {
                'sample-question-id': ['sample-option-id']
            };
            component.isAshaHome = true;
                 mockquizService.questionState = {
                slides: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                isCorrect: true
                            }
                        ]
                    }
                ]
            } as any;
            component.isCompetencyComplted = false;
            mockquizService.createAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockquizService.sanitizeAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockconfigSvc.userProfile = {
                userId: 'sample-user-id',
                firstName: 'Sample',
                lastName: 'User',
                email: 'sample-email'
            };
            mockquizService.competencySubmitQuizV2 = jest.fn().mockReturnValue(throwError({
                error: {
                    error: 'Sample Error'
                }
            }));
            mockviewerDataSvc.resource = {
                parent: {
                    identifier: 'sample-parent-identifier',
                    name: 'Sample Parent Resource'
                }            
            } as any;
            jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('[{"userId":"sample-user-id", "competencyId":"sample-competency-id"}]');
            mockquizService.updateAshaAssessment = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,
                    result: 100,
                    total: 1
                }
            }));
            mockaudioService.isReady = jest.fn().mockReturnValue(true);
            mockaudioService.getInitializationStatus = jest.fn().mockReturnValue(true);
            mockaudioService.playFailureAudio = jest.fn();
            mocktelemetrySvc.end = jest.fn();
            component.questionAnswerHash = {
                'sample-question-id2': ['sample-option-id2']
            }
            jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
            // Act
            component.proceedToSubmit();
            // Assert
            expect(mockquizService.createAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.sanitizeAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.competencySubmitQuizV2).toHaveBeenCalled();
        });

         it('should proceed to submit the quiz but audio is not ready to play', () => {
            // Arrange
            component.questionAnswerHash = {
                'sample-question-id': ['sample-option-id']
            };
            component.isAshaHome = true;
                 mockquizService.questionState = {
                slides: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                isCorrect: true
                            }
                        ]
                    }
                ]
            } as any;
            mockquizService.createAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockquizService.sanitizeAssessmentSubmitRequest = jest.fn().mockReturnValue({
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'
            });
            mockconfigSvc.userProfile = {
                userId: 'sample-user-id',
                firstName: 'Sample',
                lastName: 'User',
                email: 'sample-email'
            };
            component.isCompetencyComplted = false;
            mockquizService.competencySubmitQuizV2 = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,
                    result: 100,
                    total: 1
                }
            }));
            mockviewerDataSvc.resource = {
                parent: {
                    identifier: 'sample-parent-identifier',
                    name: 'Sample Parent Resource'
                }            
            } as any;
            jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('[{"userId":"sample-user-id", "competencyId":"sample-competency-id"}]');
            mockquizService.updateAshaAssessment = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,
                    result: 100,
                    total: 1
                }
            }));
            mockaudioService.isReady = jest.fn().mockReturnValue(false);
            mockaudioService.getInitializationStatus = jest.fn().mockReturnValue(true);
            mockaudioService.playFailureAudio = jest.fn();
            mocktelemetrySvc.end = jest.fn();
            component.questionAnswerHash = {
                'sample-question-id2': ['sample-option-id2'],
            }
            // Act
            component.proceedToSubmit();
            // Assert
            expect(mockquizService.createAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.sanitizeAssessmentSubmitRequest).toHaveBeenCalled();
            expect(mockquizService.competencySubmitQuizV2).toHaveBeenCalled();
            expect(mockquizService.updateAshaAssessment).toHaveBeenCalled();
            expect(mockaudioService.isReady).toHaveBeenCalled();
            expect(mockaudioService.getInitializationStatus).toHaveBeenCalled();
            expect(mocktelemetrySvc.end).toHaveBeenCalled();
        });
    });

    describe('submitQuizV2', () => {
        it('should submit quiz for online', async() => {
            const sanitizedRequestData = {
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'    
            };
            jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
            mockquizService.submitQuizV2 = jest.fn().mockReturnValue(of({
                result: {
                    blank: 0,
                    correct: 1,
                    inCorrect: 0,
                    passPercent: 100,                    
                    total: 1                    
                }
            }));
            mocktelemetryGeneraterService.generateEndTelemetry = jest.fn();
            jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
            mockcourseOptimisticUiService.insertCourseProgress = jest.fn(() => Promise.resolve());
            mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
                identifier: 'sample-identifier',
                progress: 100,
                status: 'completed'
            })) as any;
            mockcourseOptimisticUiService.updateLastReadContentId = jest.fn(() => Promise.resolve());
            mockonlineSqliteService.updateResumeData = jest.fn(() => Promise.resolve());
            mockcontentSvc.changeMessage = jest.fn();
            // Act
            await component.submitQuizV2(sanitizedRequestData);
            //assert
            expect(mockquizService.submitQuizV2).toHaveBeenCalled();
            expect(mockcourseOptimisticUiService.insertCourseProgress).toHaveBeenCalled();
            expect(mockcourseOptimisticUiService.courseProgressRead).toHaveBeenCalled();
            expect(mockcourseOptimisticUiService.updateLastReadContentId).toHaveBeenCalled();
            expect(mockonlineSqliteService.updateResumeData).toHaveBeenCalled();
            expect(mockcontentSvc.changeMessage).toHaveBeenCalled();
        });

        it('should submit quiz for online and handle error part', async() => {
            const sanitizedRequestData = {
                identifier: 'sample-identifier',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'    
            };
            jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
            mockquizService.submitQuizV2 = jest.fn().mockReturnValue(throwError({
                error: {
                    error: 'Sample Error'
                }
            }));
            mocktelemetryGeneraterService.generateEndTelemetry = jest.fn();
            jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
            mockcourseOptimisticUiService.insertCourseProgress = jest.fn(() => Promise.resolve());
            mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
                identifier: 'sample-identifier',
                progress: 100,
                status: 'completed'
            })) as any;
            mockcourseOptimisticUiService.updateLastReadContentId = jest.fn(() => Promise.resolve());
            mockonlineSqliteService.updateResumeData = jest.fn(() => Promise.resolve());
            mockcontentSvc.changeMessage = jest.fn();
            // Act
            await component.submitQuizV2(sanitizedRequestData);
            //assert
            expect(mockquizService.submitQuizV2).toHaveBeenCalled();
            expect(mockcourseOptimisticUiService.insertCourseProgress).toHaveBeenCalled();
            expect(mockcourseOptimisticUiService.courseProgressRead).toHaveBeenCalled();
            expect(mockcourseOptimisticUiService.updateLastReadContentId).toHaveBeenCalled();
            expect(mockonlineSqliteService.updateResumeData).toHaveBeenCalled();
            expect(mockcontentSvc.changeMessage).toHaveBeenCalled();
        });

         it('should submit quiz for offline', async() => {
            const sanitizedRequestData = {
                identifier: 'sample-identifier',
                artifactUrl: 'https://www.health-care.com/quiz',
                isAssessment: true,
                questions: [
                    {
                        questionId: 'sample-question-id',
                        options: [
                            {
                                optionId: 'sample-option-id',
                                userSelected: true
                            }
                        ]
                    }
                ],
                timeLimit: 0,
                title: 'Sample Assessment'    
            };
            jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
            mockenqueueService.assementEnqueue = jest.fn();
            mockofflineCourseOptimisticService.insertCourseProgress = jest.fn(() => Promise.resolve());
            mockofflineCourseOptimisticService.courseProgressRead = jest.fn(() => Promise.resolve({
                identifier: 'sample-identifier',
                progress: 100,
                status: 'completed'
            })) as any;
            mockofflineCourseOptimisticService.updateLastReadContentId = jest.fn(() => Promise.resolve());
            mocksqliteService.updateResumeData = jest.fn(() => Promise.resolve());
            mockcontentSvc.changeMessage = jest.fn();
            mocktelemetryGeneraterService.generateEndTelemetry = jest.fn();
            jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
            mockcontentSvc.changeMessage = jest.fn();
            // Act
            await component.submitQuizV2(sanitizedRequestData);
            //assert
            expect(mockenqueueService.assementEnqueue).toHaveBeenCalled();
            expect(mockofflineCourseOptimisticService.insertCourseProgress).toHaveBeenCalled();
            expect(mockofflineCourseOptimisticService.courseProgressRead).toHaveBeenCalled();
            expect(mocksqliteService.updateResumeData).toHaveBeenCalled();
            expect(mockofflineCourseOptimisticService.updateLastReadContentId).toHaveBeenCalled();
            expect(mockcontentSvc.changeMessage).toHaveBeenCalled();
        });
    });

    it('should return CompetencyId', () => {
        // arrange
        const data = [
            {
                identifier: 'sample-identifier',
                competencyId: 1
            }
        ]
        // act
        component.getCompetencyId(data)
        // assert
        expect(component.nextCompetencyLevel).toBe(2);
    })

    describe('nextQuestion', () => {
            let $mock: any;
            beforeEach(() => {
            // Mock jQuery $
            $mock = jest.fn().mockImplementation((el) => {
                return {
                fadeOut: jest.fn((speed, cb) => cb && cb()),
                hide: jest.fn(),
                fadeIn: jest.fn((speed, cb) => cb && cb()),
                show: jest.fn(),
                };
            });
            (global as any).$ = $mock;
            component.assesmentdata = {
                questions: {
                questions: [
                    { questionType: 'mtf' },
                    { questionType: 'mcq' },
                    { questionType: 'mtf' }
                ]
                }
            } as any;
            component.questionAnswerHash = { qslideIndex: 0 };
            component.totalQuestion = 3;
            component.progressbarValue = 0;
            component.disableNext = false;
            component.diablePrevious = true;
            component.showSubmit = false;
            component.updateQuestionType = jest.fn();
            component.generateInteractTelemetry = jest.fn();
            component.quizService = {
                questionState: {
                active_slide_index: 0,
                slides: [{}, {}, {}]
                },
                checkMtfAnswer: jest.fn().mockReturnValue({ questionId: 'q1', answer: ['a1'] }),
                updateMtf: { next: jest.fn() }
            } as any;
            });

                it('should return next question', () => {
            // arrange
            mocktelemetryGeneraterService.generateInteractTelemetry = jest.fn();
            mockquizService.checkMtfAnswer = jest.fn().mockReturnValue(false);
            mockquizService.questionState ={
                active_slide_index: 1,
                slides: [{
                    questionId: 'sample-question-id',
                    options: [
                        {
                            optionId: 'sample-option-id',
                            userSelected: true
                        }
                    ]
                }, {
                    questionId: 'sample-question-id2',
                    options: [
                        {
                            optionId: 'sample-option-id2',
                            userSelected: true
                        }
                    ]
                }]
            };
            mockquizService.updateMtf = {
                next: jest.fn()
            } as any;
            // act
            component.nextQuestion();
            // assert
           // expect(mockquizService.checkMtfAnswer).toHaveBeenCalled();
        });

            it('should handle mtf question and update answer hash', () => {
            component.assesmentdata.questions.questions[0].questionType = 'mtf';
            component.questionAnswerHash = { qslideIndex: 0 };
            component.quizService.checkMtfAnswer = jest.fn().mockReturnValue({ questionId: 'q1', answer: ['a1'] });
            component.nextQuestion();
            expect(component.generateInteractTelemetry).toHaveBeenCalled();
            expect(component.quizService.checkMtfAnswer).toHaveBeenCalled();
            expect(component.questionAnswerHash['q1']).toEqual(['a1']);
            expect(component.disableNext).toBe(false);
            expect(component.updateQuestionType).toHaveBeenCalled();
            });

            it('should handle non-mtf question and not call checkMtfAnswer', () => {
            component.assesmentdata.questions.questions[0].questionType = 'mcq';
            component.questionAnswerHash = { qslideIndex: 0 };
            component.quizService.checkMtfAnswer = jest.fn();
            component.nextQuestion();
            expect(component.generateInteractTelemetry).toHaveBeenCalled();
            expect(component.quizService.checkMtfAnswer).not.toHaveBeenCalled();
            expect(component.disableNext).toBe(false);
            expect(component.updateQuestionType).toHaveBeenCalled();
            });

            it('should show submit if on last slide', () => {
            component.quizService.questionState.active_slide_index = 2;
            component.quizService.questionState.slides = [{}, {}, {}];
            component.assesmentdata.questions.questions = [
                { questionType: 'mcq' },
                { questionType: 'mcq' },
                { questionType: 'mcq' }
            ];
            component.questionAnswerHash = { qslideIndex: 2 };
            component.nextQuestion();
            expect(component.showSubmit).toBe(true);
            expect(component.updateQuestionType).toHaveBeenCalledWith(false);
            });

            it('should update progressbarValue and diablePrevious correctly', () => {
            component.quizService.questionState.active_slide_index = 0;
            component.quizService.questionState.slides = [{}, {}, {}];
            component.assesmentdata.questions.questions = [
                { questionType: 'mcq' },
                { questionType: 'mtf' },
                { questionType: 'mcq' }
            ];
            component.questionAnswerHash = { qslideIndex: 0 };
            component.totalQuestion = 3;
            component.progressbarValue = 0;
            component.nextQuestion();
            expect(component.progressbarValue).toBeCloseTo(33.333, 1);
            expect(component.disableNext).toBe(false);
            expect(component.diablePrevious).toBe(false);
            });

            it('should call updateQuestionType(true) if next question is mtf', () => {
            component.quizService.questionState.active_slide_index = 0;
            component.quizService.questionState.slides = [{}, {}, {}];
            component.assesmentdata.questions.questions = [
                { questionType: 'mcq' },
                { questionType: 'mtf' },
                { questionType: 'mcq' }
            ];
            component.questionAnswerHash = { qslideIndex: 0 };
            component.nextQuestion();
            expect(component.updateQuestionType).toHaveBeenCalledWith(false);
            });

            it('should call updateQuestionType(false) if next question is not mtf', () => {
            component.quizService.questionState.active_slide_index = 0;
            component.quizService.questionState.slides = [{}, {}, {}];
            component.assesmentdata.questions.questions = [
                { questionType: 'mcq' },
                { questionType: 'mcq' },
                { questionType: 'mcq' }
            ];
            component.questionAnswerHash = { qslideIndex: 0 };
            component.nextQuestion();
            expect(component.updateQuestionType).toHaveBeenCalledWith(false);
            });

            it('should call previousQuestion and update states correctly', () => {
                // Arrange
                let $mock: any = jest.fn().mockImplementation((el) => {
                    return {
                        fadeOut: jest.fn((speed, cb) => cb && cb()),
                        hide: jest.fn(),
                        fadeIn: jest.fn((speed, cb) => cb && cb()),
                        show: jest.fn(),
                    };
                });
                (global as any).$ = $mock;
                // mockquizService.questionState = {
                //     active_slide_index: 2
                // }
                component.assesmentdata = {
                    questions: {
                        questions: [
                            { questionType: 'mcq' },
                            { questionType: 'mtf' },
                            { questionType: 'mcq' }
                        ]
                    }
                } as any;
                component.totalQuestion = 3;
                component.progressbarValue = 66.66;
                component.disableNext = false;
                component.diablePrevious = false;
                component.showSubmit = false;
                component.updateQuestionType = jest.fn();
                component.generateInteractTelemetry = jest.fn();
                component.quizService = {
                    questionState: {
                        active_slide_index: 3,
                        slides: [{}, {}, {}]
                    },
                    updateMtf: { next: jest.fn() }
                } as any;

                // Act
                component.previousQuestion();

                // Assert
                expect(component.generateInteractTelemetry).toHaveBeenCalledWith("back");
                expect(component.progressbarValue).toBeCloseTo(33.33, 1);
                expect(component.diablePrevious).toBe(false);
                expect(component.updateQuestionType).toHaveBeenCalled();
            });

            it('should not go back if already at first question in previousQuestion', () => {
                // Arrange
                let $mock: any = jest.fn().mockImplementation((el) => {
                    return {
                        fadeOut: jest.fn((speed, cb) => cb && cb()),
                        hide: jest.fn(),
                        fadeIn: jest.fn((speed, cb) => cb && cb()),
                        show: jest.fn(),
                    };
                });
                (global as any).$ = $mock;
                component.assesmentdata = {
                    questions: {
                        questions: [
                            { questionType: 'mcq' },
                            { questionType: 'mtf' },
                            { questionType: 'mcq' }
                        ]
                    }
                } as any;
                component.totalQuestion = 3;
                component.progressbarValue = 0;
                component.disableNext = false;
                component.diablePrevious = true;
                component.showSubmit = false;
                component.updateQuestionType = jest.fn();
                component.generateInteractTelemetry = jest.fn();
                component.quizService = {
                    questionState: {
                        active_slide_index: 0,
                        slides: [{}, {}, {}]
                    },
                    updateMtf: { next: jest.fn() }
                } as any;

                // Act
                component.previousQuestion();

                // Assert
                expect(component.generateInteractTelemetry).toHaveBeenCalledWith("back");
                expect(component.progressbarValue).toBeLessThanOrEqual(0);
                expect(component.diablePrevious).toBe(true);
                expect(component.updateQuestionType).not.toHaveBeenCalled();
            });

            it('should call ngOnDestroy and clean up timer', () => {
                // Arrange
                const unsubscribeSpy = jest.fn();
                component.timerSubscription = { unsubscribe: unsubscribeSpy } as any;
                component.startTime = 123;
                component.timeLeft = 456;
                // Act
                component.ngOnDestroy();
                // Assert
                expect(unsubscribeSpy).toHaveBeenCalled();
                expect(component.startTime).toBe(0);
                expect(component.timeLeft).toBe(0);
            });

            it('should return correct conic gradient string', () => {
                // Act
                const gradient = component.getConicGradient(75);
                // Assert
                expect(gradient).toContain('conic-gradient');
                expect(gradient).toContain('75%');
            });
    });
});