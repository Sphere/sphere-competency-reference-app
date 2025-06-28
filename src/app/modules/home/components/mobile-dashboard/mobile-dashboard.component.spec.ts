import { OverlayContainer } from "@angular/cdk/overlay";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { AuthService } from "@project-sunbird/sunbird-sdk";
import { ContentCorodovaService } from "../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service";
import { WidgetUserService } from "../../../../../library/ws-widget/collection/src/lib/_services/widget-user.service";
import { ConfigurationsService } from "../../../../../library/ws-widget/utils/src/public-api";
import { CommonUtilService, TelemetryGeneratorService } from "../../../../../services";
import { Events } from "../../../../../util/events";
import { UserService } from "../../services/user.service";
import {MobileDashboardComponent} from "./mobile-dashboard.component";
import { ConfigService as CompetencyConfiService } from '../../../../../app/competency/services/config.service'
import { of, throwError } from "rxjs";

jest.mock('../../../../../assets/configurations/mobile-home.json', () => ({
  __esModule: true,
  default: {
    userLoggedInSection: { title: 'Welcome User' },
    topCertifiedCourseIdentifier: 'certified-101',
    featuredCourseIdentifier: 'featured-202'
  }
}));
import publicConfig from '../../../../../assets/configurations/mobile-home.json';
import { result } from "lodash";
import { error } from "console";


jest.mock('../../../core/services/cordova-http.service', () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
    }
  };
});

describe('MobileDashboardComponent', () => {
    let mobileDashboardComponent: MobileDashboardComponent;
    const mockauthService: Partial<AuthService> = {};
    const mockconfigSvc: Partial<ConfigurationsService> = {};
    const mockuserSvc: Partial<WidgetUserService> = {};
    const mockContentSvc: Partial<ContentCorodovaService> = {};
    const mockrouter: Partial<Router> = {
        navigateByUrl: jest.fn()
    };
    const mockuserHomeSvc: Partial<UserService> = {};
    const mockcommonUtilService: Partial<CommonUtilService> = {
         removeLoader: jest.fn(() => Promise.resolve())
    };
    const mockCompetencyConfiService: Partial<CompetencyConfiService> = {};
    const mocksanitizer: Partial<DomSanitizer> = {};
    const mockoverlayContainer: Partial<OverlayContainer> = {};
    const mockevents: Partial<Events> = {};
    const mockdialog: Partial<MatDialog> = {};
    const mocktelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    localStorage.setItem('orgValue', 'nhsrc');

    beforeAll(() => {
        mobileDashboardComponent = new MobileDashboardComponent(
            mockconfigSvc as ConfigurationsService,
                mockuserSvc as WidgetUserService,
                mockContentSvc as ContentCorodovaService,
                mockrouter as Router,
                mockuserHomeSvc as UserService,
                mockauthService as AuthService,
                mockcommonUtilService as CommonUtilService,
                mockCompetencyConfiService as CompetencyConfiService,
                mocksanitizer as DomSanitizer,
                mockoverlayContainer as OverlayContainer,
                mockevents as Events,
                mockdialog as MatDialog,
                mocktelemetryGeneratorService as TelemetryGeneratorService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    })

    it('should be created a instance of MobileDashboardComponent', () => {
        expect(mobileDashboardComponent).toBeTruthy();
    })

    describe('ngOnInit', () => {
        it('should be invoked ngOnInit for tab', async() => {
            // arrange
            const dialogRefMock = {
                close: jest.fn()
            }
            mockdialog.getDialogById = jest.fn((id) => {
                if (id === 'confirmModal') {
                  return dialogRefMock
                } else if(id === 'assessmentModel') {
                  return dialogRefMock
                }
                return null
            }) as any;
            mockcommonUtilService.isTablet = jest.fn(() => true);
            mockuserHomeSvc.getCompetencyData = jest.fn().mockResolvedValue({
              currentOrgId: "do-1234",
              nhsrc: {
                "ANM-BIHAR":{
                    name: "ANM-BIHAR",
                    description: "Description 1",
                    image: "https://example.com/image1.jpg",
                    url: "https://example.com/url1",
                    type: "video",
                    channelId: "nhsrc",
                    sourceName: "YouTube",
                    defaultLanguage: "en",
                    competency: [{
                      name: "Competency 1",
                      description: "Description 1",
                      image: "https://example.com/image1.jpg",
                      url: "https://example.com/url1",
                      type: "video",
                      channelId: "nhsrc",
                      sourceName: "YouTube",
                      defaultLanguage: "en",
                      id: "competency-1",
                      data: {
                        additionalProperties: {
                          competencyLevelDescription: [{
                            description: "Description 1",
                            level: "Level 1",
                            image: "https://example.com/image1.jpg",
                            url: "https://example.com/url1",
                            name: 'Competency Level 1',
                            course: [{
                              identifier: 'do-1234',
                              name: 'course-1',
                            }]
                          }],
                        },
                        id: "competency-1",
                      }
                    }]
                  },
              },
            }) as any;
            mockuserHomeSvc.getActiveRole = jest.fn(() => Promise.resolve({role: 'DO', orgId: 'nhsrc'}));
            mockconfigSvc.userProfile = {
                rootOrgId: 'nhsrc',
                userId: 'do-1234',
                firstName: 'do',
                lastName: '1234',
                profileData: {
                    userId: 'uid',
                    professionalDetails: [{
                        designation: 'ANM-BIHAR',
                        department: 'Department 1',
                        state: 'State 1',
                        district: 'District 1',
                        block: 'Block 1'
                    }]
                }
            } as any;
            mockuserSvc.fetchCourseRemommendationv = jest.fn(() => of([{
                result: {
                    courses: [
                        {
                            identifier: 'do-1234',
                            name: 'course-1',
                            isAvailableLocally: true
                        }
                    ]
                }
            }])) as any;
            mockuserHomeSvc.getOrgData = jest.fn(() => Promise.resolve(({orgId: 'nhsrc', 
              orgNames: [{
                channelId: 'nhsrc',
                startVideo: {
                  url: 'https://www.youtube.com/watch?v=1234',
                  type: 'video'
                }
              }],
            }))) as any;
            mocksanitizer.bypassSecurityTrustResourceUrl = jest.fn(() => 'https://www.youtube.com/watch?v=1234');
            mockContentSvc.getHomeStaticContent = jest.fn(() => of({
              departments: [
                {
                  name: 'Department 1',
                  description: 'Description 1',
                  image: 'https://example.com/image1.jpg',
                  url: 'https://example.com/url1',
                  type: 'video',
                  channelId: 'nhsrc',
                  sourceName: 'YouTube',
                  defaultLanguage: 'en'
                },
                {
                  name: 'Department 2',
                  description: 'Description 2',
                  image: 'https://example.com/image2.jpg',
                  url: 'https://example.com/url2',
                  type: 'video',
                  channelId: '1235',
                  sourceName: 'YouTube'
                }
              ]
            }));
            mockcommonUtilService.addLoader = jest.fn(() => Promise.resolve());
            mockauthService.getSession = jest.fn(() => of({
                userId: 'do-1234',
                userToken: '1234',
            })) as any;
            mockuserHomeSvc.userRead = jest.fn(() => Promise.resolve());
            mockuserHomeSvc.updateValue$ = of({
                userId: 'do-1234',
                userToken: '1234',
            }) as any;
            mockCompetencyConfiService.setConfig = jest.fn(() => Promise.resolve());
            mockuserSvc.fetchUserBatchList = jest.fn(() => of([
              {
                result: {
                  courses: [
                    {
                      identifier: 'do-1234',
                      name: 'course-1',
                      isAvailableLocally: true
                    }
                  ]
                }
              }
            ])) as any;
            mobileDashboardComponent.designation = 'anm-bihar';
            mockuserHomeSvc.getCompetencyCourseIdentifier = jest.fn(() => of({
                competencyLevelDescription: [{
                    description: 'Description 1',
                    level: 'Level 1',
                    image: 'https://example.com/image1.jpg',
                    url: 'https://example.com/url1',
                    name: 'Competency Level 1',
                    course: [{
                        identifier: 'do-1234',
                        name: 'course-1',
                    }]
                }],
                competencyLevel: 'Level 1',
                competencyLevelImage: 'https://example.com/image1.jpg',
                result: {
                  content: [{
                    identifier: 'do-1234',
                    name: 'course-1',
                    contentType: 'Course',
                    subTitle: 'Course Subtitle',
                    description: 'Course Description',
                    creator: 'Course Creator',
                    duration: '10 hours',
                    childNodes: [{
                      identifier: 'do-1234',
                      name: 'course-1'}],
                    batches: [{
                      batchId: 'do-1234'}],
                    competencies_v1: JSON.stringify({
                      competencyId: 'competency-1',
                      competencyLevel: 'Level 1',
                      competencyName: 'Competency Level 1',
                    })
                  }]
                }
            })) as any;
            mockuserHomeSvc.getAshaProgress = jest.fn(() => of({
              data: [{
                competencyid: 'competency-1',
                completionpercentage: 80,
                passFailStatus: 'pass',
                attemptcount: 1,
                contentType: 'Course'
              }]
            }));
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            //act
            await mobileDashboardComponent.ngOnInit();
            //assert
            expect(mobileDashboardComponent).toBeTruthy();
            expect(mobileDashboardComponent.isTablet).toBe(true);
            expect(mockuserHomeSvc.getCompetencyData).toHaveBeenCalled();
            expect(mockuserHomeSvc.getActiveRole).toHaveBeenCalled();
            expect(mockuserHomeSvc.getOrgData).toHaveBeenCalled();
            expect(mobileDashboardComponent.homeFeature).toEqual(publicConfig.userLoggedInSection);
            expect(mobileDashboardComponent.topCertifiedCourseIdentifier).toEqual(publicConfig.topCertifiedCourseIdentifier);
            expect(mobileDashboardComponent.featuredCourseIdentifier).toEqual(publicConfig.featuredCourseIdentifier);
            expect(mockCompetencyConfiService.setConfig).toHaveBeenCalled();
            expect(mockuserSvc.fetchUserBatchList).toHaveBeenCalled();
            expect(mockuserHomeSvc.getCompetencyCourseIdentifier).toHaveBeenCalled();
            expect(mockuserSvc.fetchCourseRemommendationv).toHaveBeenCalled();
            expect(mockuserHomeSvc.getAshaProgress).toHaveBeenCalled();
        });

        it('should be invoked ngOnInit for mobile and start video is not there', async() => {
             // arrange
            const dialogRefMock = {
                close: jest.fn()
            }
            mockdialog.getDialogById = jest.fn((id) => {
                if (id === 'confirmModal') {
                  return dialogRefMock
                } else if(id === 'assessmentModel') {
                  return dialogRefMock
                }
                return null
            }) as any;
            mockcommonUtilService.isTablet = jest.fn(() => false);
            mockuserHomeSvc.getCompetencyData = jest.fn().mockResolvedValue({
              currentOrgId: "do-1234",
              nhsrc: {
                "ANM-BIHAR":{
                    name: "ANM-BIHAR",
                    description: "Description 1",
                    image: "https://example.com/image1.jpg",
                    url: "https://example.com/url1",
                    type: "video",
                    channelId: "nhsrc",
                    sourceName: "YouTube",
                    defaultLanguage: "en",
                    competency: [{
                      name: "Competency 1",
                      description: "Description 1",
                      image: "https://example.com/image1.jpg",
                      url: "https://example.com/url1",
                      type: "video",
                      channelId: "nhsrc",
                      sourceName: "YouTube",
                      defaultLanguage: "en",
                      id: "competency-1",
                      data: {
                        additionalProperties: {
                          competencyLevelDescription: [{
                            description: "Description 1",
                            level: "Level 1",
                            image: "https://example.com/image1.jpg",
                            url: "https://example.com/url1",
                            name: 'Competency Level 1',
                            course: [{
                              identifier: 'do-1234',
                              name: 'course-1',
                            }]
                          }],
                        },
                        id: "competency-1",
                      }
                    }]
                  },
              },
            }) as any;
            mockuserHomeSvc.getActiveRole = jest.fn(() => Promise.resolve({role: 'DO', orgId: 'nhsrc'}));
             mockconfigSvc.userProfile = {
                rootOrgId: 'nhsrc',
                userId: 'do-1234',
                firstName: 'do',
                lastName: '1234',
                profileData: {
                    userId: 'uid',
                    professionalDetails: [{
                        designation: 'ANM-BIHAR',
                        department: 'Department 1',
                        state: 'State 1',
                        district: 'District 1',
                        block: 'Block 1'
                    }]
                }
            } as any;
            mockuserSvc.fetchCourseRemommendationv = jest.fn(() => throwError({
                error: {
                    params: {
                        err: 'error'
                    }
                }
            }));
            mockuserHomeSvc.getOrgData = jest.fn(() => Promise.resolve(({orgId: 'nhsrc', 
              orgNames: [{
                channelId: 'nhsrc',
                startVideo: undefined
              }],
            }))) as any;
            mocksanitizer.bypassSecurityTrustResourceUrl = jest.fn(() => 'https://www.youtube.com/watch?v=1234');
            mockContentSvc.getHomeStaticContent = jest.fn(() => of({
              departments: [
                {
                  name: 'Department 1',
                  description: 'Description 1',
                  image: 'https://example.com/image1.jpg',
                  url: 'https://example.com/url1',
                  type: 'video',
                  channelId: 'nhsrc',
                  sourceName: 'YouTube',
                  defaultLanguage: 'en'
                },
                {
                  name: 'Department 2',
                  description: 'Description 2',
                  image: 'https://example.com/image2.jpg',
                  url: 'https://example.com/url2',
                  type: 'video',
                  channelId: '1235',
                  sourceName: 'YouTube'
                }
              ]
            }));
            mockcommonUtilService.addLoader = jest.fn(() => Promise.resolve());
            mockauthService.getSession = jest.fn(() => of({
                userId: 'do-1234',
                userToken: '1234',
            })) as any;
            mockuserHomeSvc.userRead = jest.fn(() => Promise.resolve());
            mockuserHomeSvc.updateValue$ = of({
                userId: 'do-1234',
                userToken: '1234',
            }) as any;
            mockCompetencyConfiService.setConfig = jest.fn(() => Promise.resolve());
            mockuserSvc.fetchUserBatchList = jest.fn(() => of([
              {
                result: {
                  courses: [
                    {
                      identifier: 'do-1234',
                      name: 'course-1',
                      isAvailableLocally: true
                    }
                  ]
                }
              }
            ])) as any;
            mobileDashboardComponent.designation = 'anm-bihar';
            mockuserHomeSvc.getCompetencyCourseIdentifier = jest.fn(() => of({
                competencyLevelDescription: [{
                    description: 'Description 1',
                    level: 'Level 1',
                    image: 'https://example.com/image1.jpg',
                    url: 'https://example.com/url1',
                    name: 'Competency Level 1',
                    course: [{
                        identifier: 'do-1234',
                        name: 'course-1',
                    }]
                }],
                competencyLevel: 'Level 1',
                competencyLevelImage: 'https://example.com/image1.jpg',
                result: {
                  content: [{
                    identifier: 'do-1234',
                    name: 'course-1',
                    contentType: 'Course',
                    subTitle: 'Course Subtitle',
                    description: 'Course Description',
                    creator: 'Course Creator',
                    duration: '10 hours',
                    childNodes: [{
                      identifier: 'do-1234',
                      name: 'course-1'}],
                    batches: [{
                      batchId: 'do-1234'}],
                    competencies_v1: JSON.stringify({
                      competencyId: 'competency-1',
                      competencyLevel: 'Level 1',
                      competencyName: 'Competency Level 1',
                    })
                  }]
                }
            })) as any;
            mockuserHomeSvc.getAshaProgress = jest.fn(() => throwError({
              error: {
                params: {
                  err: 'error'
                }
              }
            }));
            //act
            await mobileDashboardComponent.ngOnInit();
            //assert
            expect(mobileDashboardComponent).toBeTruthy();
            expect(mobileDashboardComponent.isTablet).toBe(false);
            expect(mockuserHomeSvc.getCompetencyData).toHaveBeenCalled();
            expect(mockuserHomeSvc.getActiveRole).toHaveBeenCalled();
            expect(mockuserHomeSvc.getOrgData).toHaveBeenCalled();
            expect(mobileDashboardComponent.homeFeature).toEqual(publicConfig.userLoggedInSection);
            expect(mobileDashboardComponent.topCertifiedCourseIdentifier).toEqual(publicConfig.topCertifiedCourseIdentifier);
            expect(mobileDashboardComponent.featuredCourseIdentifier).toEqual(publicConfig.featuredCourseIdentifier);
            expect(mockCompetencyConfiService.setConfig).toHaveBeenCalled();
            expect(mockuserSvc.fetchUserBatchList).toHaveBeenCalled();
            expect(mockuserHomeSvc.getCompetencyCourseIdentifier).toHaveBeenCalled();
            expect(mockuserSvc.fetchCourseRemommendationv).toHaveBeenCalled();
        });
        
    });

    describe('fetchCompetencyData', () => {
    it('should successfully fetch JSON data from the S3 URL', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ testData: 'test' })
      });
      mocktelemetryGeneratorService.generateErrorTelemetry = jest.fn();
      await mobileDashboardComponent.fetchCompetencyData();
  
      // Assertions
      expect(global.fetch).toHaveBeenCalledWith('https://aastar-app-assets.s3.ap-south-1.amazonaws.com/learnerPath.config.json');
      expect(mobileDashboardComponent.competencyHomeData).toEqual({ testData: 'test' });
    });

    it('should parse the JSON response correctly', async () => {
      const mockJsonData = {
        sections: [{ id: 1, title: 'Section 1' }],
        config: { version: '1.0' },
        metadata: { lastUpdated: '2023-01-01' }
      };
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue(mockJsonData)
      });
      mocktelemetryGeneratorService.generateErrorTelemetry = jest.fn();
      await mobileDashboardComponent.fetchCompetencyData();
  
      // Assertions
      expect(mobileDashboardComponent.competencyHomeData).toBeTruthy();
    });

       it('should parse the JSON response correctly for error', async () => {
      const mockJsonData = {
        sections: [{ id: 1, title: 'Section 1' }],
        config: { version: '1.0' },
        metadata: { lastUpdated: '2023-01-01' }
      };
      global.fetch = jest.fn().mockRejectedValue({
        ok: false,
        json: jest.fn().mockResolvedValue(mockJsonData)
      });
      mocktelemetryGeneratorService.generateErrorTelemetry = jest.fn();
      await mobileDashboardComponent.fetchCompetencyData();
      // Assertions
      expect(mobileDashboardComponent.competencyHomeData).toBeTruthy;
    });
  });

  describe("getOrgName", () => {
    it("should return the org name if it exists in the orgNames array", async() => {
      const orgId = "nhsrc";
      const orgNames = [
        { channelId: "nhsrc", name: "NH-SRC" },
        { channelId: "other-org", name: "Other Org" },
      ];
      mockconfigSvc.userProfile = {
        rootOrgId: "nhsrc",
        userId: "do-1234",
        firstName: "do",
        lastName: "1234",
        profileData: {
          userId: "uid",
          professionalDetails: [
            {
              designation: "ANM-BIHAR",
              department: "Department 1",
              state: "State 1",
              district: "District 1",
              block: "Block 1",
            },
          ],
        },
      } as any;
      mockuserHomeSvc.getOrgData = jest.fn(() =>
        Promise.resolve({
          orgId: "nhsrc",
          orgNames: [
            {
              channelId: "nhsrc",
              startVideo: {
                url: "https://www.youtube.com/watch?v=1234",
                type: "video",
              },
            },
          ],
        })
      ) as any;
      mockuserHomeSvc.getCompetencyData = jest.fn().mockResolvedValue({
        currentOrgId: "do-1234",
        nhsrc: {
          "ANM-BIHAR": {
            name: "ANM-BIHAR",
            description: "Description 1",
            image: "https://example.com/image1.jpg",
            url: "https://example.com/url1",
            type: "video",
            channelId: "nhsrc",
            sourceName: "YouTube",
            defaultLanguage: "en",
            competency: [
              {
                name: "Competency 1",
                description: "Description 1",
                image: "https://example.com/image1.jpg",
                url: "https://example.com/url1",
                type: "video",
                channelId: "nhsrc",
                sourceName: "YouTube",
                defaultLanguage: "en",
                id: "competency-1",
                data: {
                  additionalProperties: {
                    competencyLevelDescription: [
                      {
                        description: "Description 1",
                        level: "Level 1",
                        image: "https://example.com/image1.jpg",
                        url: "https://example.com/url1",
                        name: "Competency Level 1",
                        course: [
                          {
                            identifier: "do-1234",
                            name: "course-1",
                          },
                        ],
                      },
                    ],
                  },
                  id: "competency-1",
                },
              },
            ],
          },
        },
      }) as any;
      mocksanitizer.bypassSecurityTrustResourceUrl = jest.fn(
        () => "https://www.youtube.com/watch?v=1234"
      );
      await mobileDashboardComponent.getOrgName();
      expect(mockuserHomeSvc.getOrgData).toHaveBeenCalled();
      expect(mockuserHomeSvc.getCompetencyData).toHaveBeenCalled();
      expect(mocksanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled();
    });

    it("should return undefined if the org name does not exist in the orgNames array", async () => {
      const orgId = "non-existent-org";
      const orgNames = [
        { channelId: "nhsrc", name: "NH-SRC" },
        { channelId: "other-org", name: "Other Org" },
      ];
      mockconfigSvc.userProfile = {
        rootOrgId: "nhsrc",
        userId: "do-1234",
        firstName: "do",
        lastName: "1234",
        profileData: {
          userId: "uid",
          professionalDetails: [
            {
              designation: "ANM-BIHAR",
              department: "Department 1",
              state: "State 1",
              district: "District 1",
              block: "Block 1",
            },
          ],
        },
      } as any;
      mockuserHomeSvc.getOrgData = jest.fn(() =>
        Promise.resolve({
          orgId: "nhsrc",
          orgNames: [
            {
              channelId: "nhsrc",
              startVideo: {
                url: "https://www.youtube.com/watch?v=1234",
                type: "video",
              },
            },
          ],
        })
      ) as any;
      mockuserHomeSvc.getCompetencyData = jest.fn().mockResolvedValue({
        currentOrgId: "do-1234",
        nhsrc: {
          "ANM-BIHAR": {
            name: "ANM-BIHAR",
            description: "Description 1",
            image: "https://example.com/image1.jpg",
            url: "https://example.com/url1",
            type: "video",
            channelId: "nhsrc",
            sourceName: "YouTube",
            defaultLanguage: "en",
            competency: [
              {
                name: "Competency 1",
                description: "Description 1",
                image: "https://example.com/image1.jpg",
                url: "https://example.com/url1",
                type: "video",
                channelId: "nhsrc",
                sourceName: "YouTube",
                defaultLanguage: "en",
                id: "competency-1",
                data: {
                  additionalProperties: {
                    competencyLevelDescription: [
                      {
                        description: "Description 1",
                        level: "Level 1",
                        image: "https://example.com/image1.jpg",
                        url: "https://example.com/url1",
                        name: "Competency Level 1",
                        course: [
                          {
                            identifier: "do-1234",
                            name: "course-1",
                          },
                        ],
                      },
                    ],
                  },
                  id: "competency-1",
                },
              },
            ],
          },
        },
      }) as any;
      mocksanitizer.bypassSecurityTrustResourceUrl = jest.fn(
        () => "https://www.youtube.com/watch?v=1234"
      );
      await mobileDashboardComponent.getOrgName();
      expect(mockuserHomeSvc.getOrgData).toHaveBeenCalled();
      expect(mockuserHomeSvc.getCompetencyData).toHaveBeenCalled();
      expect(mocksanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled();
    });
  });

  describe("getAshaDataOld", () => {
    it("should return the competency data for Asha", async () => {
      mockuserHomeSvc.getRoleWiseData = jest.fn(() =>
        of({
          response: [
            {
              position: "GNM",
              competency: {
                id: "competency-1",
              },
            },
          ],
        })
      );
      mockuserHomeSvc.getCompetencyCourseIdentifier = jest.fn(() =>
        of({
          competencyLevelDescription: [
            {
              description: "Description 1",
              level: "Level 1",
              image: "https://example.com/image1.jpg",
              url: "https://example.com/url1",
              name: "Competency Level 1",
              course: [
                {
                  identifier: "do-1234",
                  name: "course-1",
                },
              ],
            },
          ],
          competencyLevel: "Level 1",
          competencyLevelImage: "https://example.com/image1.jpg",
          result: {
            content: [
              {
                identifier: "do-1234",
                name: "course-1",
                contentType: "Course",
                subTitle: "Course Subtitle",
                description: "Course Description",
                creator: "Course Creator",
                duration: "10 hours",
                childNodes: [
                  {
                    identifier: "do-1234",
                    name: "course-1",
                  },
                ],
                batches: [
                  {
                    batchId: "do-1234",
                  },
                ],
                competencies_v1: JSON.stringify({
                  competencyId: "competency-1",
                  competencyLevel: "Level 1",
                  competencyName: "Competency Level 1",
                }),
              },
            ],
          },
        })
      ) as any;
      mockuserHomeSvc.getAshaProgress = jest.fn(() =>
        of({
          data: [
            {
              competencyid: "competency-1",
              completionpercentage: 80,
              passFailStatus: "pass",
              attemptcount: 1,
              contentType: "Course",
            },
          ],
        })
      );
      await mobileDashboardComponent.getAshaDataOld();
      // Assertions
      expect(mockuserHomeSvc.getRoleWiseData).toHaveBeenCalled();
      expect(mockuserHomeSvc.getCompetencyCourseIdentifier).toHaveBeenCalled();
      expect(mockuserHomeSvc.getAshaProgress).toHaveBeenCalled();
    });

    it("should handle error part for getAshaProgress", async () => {
      mockuserHomeSvc.getRoleWiseData = jest.fn(() =>
        of({
          response: [
            {
              position: "GNM",
              competency: {
                id: "competency-1",
              },
            },
          ],
        })
      );
      mockuserHomeSvc.getCompetencyCourseIdentifier = jest.fn(() =>
        of({
          competencyLevelDescription: [
            {
              description: "Description 1",
              level: "Level 1",
              image: "https://example.com/image1.jpg",
              url: "https://example.com/url1",
              name: "Competency Level 1",
              course: [
                {
                  identifier: "do-1234",
                  name: "course-1",
                },
              ],
            },
          ],
          competencyLevel: "Level 1",
          competencyLevelImage: "https://example.com/image1.jpg",
          result: {
            content: [
              {
                identifier: "do-1234",
                name: "course-1",
                contentType: "Course",
                subTitle: "Course Subtitle",
                description: "Course Description",
                creator: "Course Creator",
                duration: "10 hours",
                childNodes: [
                  {
                    identifier: "do-1234",
                    name: "course-1",
                  },
                ],
                batches: [
                  {
                    batchId: "do-1234",
                  },
                ],
                competencies_v1: JSON.stringify({
                  competencyId: "competency-1",
                  competencyLevel: "Level 1",
                  competencyName: "Competency Level 1",
                }),
              },
            ],
          },
        })
      ) as any;
      mockuserHomeSvc.getAshaProgress = jest.fn(() =>
        throwError({
          error: 'error',
        })
      );
      await mobileDashboardComponent.getAshaDataOld();
      // Assertions
      expect(mockuserHomeSvc.getRoleWiseData).toHaveBeenCalled();
      expect(mockuserHomeSvc.getCompetencyCourseIdentifier).toHaveBeenCalled();
      expect(mockuserHomeSvc.getAshaProgress).toHaveBeenCalled();
    });

     it("should handle error part for empty list", async () => {
      mockuserHomeSvc.getRoleWiseData = jest.fn(() =>
        of({
          response: [
            {
              position: "GNM",
              competency: {
                id: "competency-1",
              },
            },
          ],
        })
      );
      mockuserHomeSvc.getCompetencyCourseIdentifier = jest.fn(() =>
        of({
          competencyLevelDescription: [
            {
              description: "Description 1",
              level: "Level 1",
              image: "https://example.com/image1.jpg",
              url: "https://example.com/url1",
              name: "Competency Level 1",
              course: [
                {
                  identifier: "do-1234",
                  name: "course-1",
                },
              ],
            },
          ],
          competencyLevel: "Level 1",
          competencyLevelImage: "https://example.com/image1.jpg",
          result: {
            content: [
              {
                identifier: "do-1234",
                name: "course-1",
                contentType: "Course",
                subTitle: "Course Subtitle",
                description: "Course Description",
                creator: "Course Creator",
                duration: "10 hours",
                childNodes: [
                  {
                    identifier: "do-1234",
                    name: "course-1",
                  },
                ],
                batches: [
                  {
                    batchId: "do-1234",
                  },
                ],
                competencies_v1: undefined,
              },
            ],
          },
        })
      ) as any;
      mockuserHomeSvc.getAshaProgress = jest.fn(() =>
        throwError({
          error: 'error',
        })
      );
      await mobileDashboardComponent.getAshaDataOld();
      // Assertions
      expect(mockuserHomeSvc.getRoleWiseData).toHaveBeenCalled();
      expect(mockuserHomeSvc.getCompetencyCourseIdentifier).toHaveBeenCalled();
      expect(mockuserHomeSvc.getAshaProgress).toHaveBeenCalled();
    });
  });

  describe('userLanguage', () => {
    it('should set userLanguage for preferences', () => {
      const res = {
        profileDetails: {
          preferences: { language: 'hi' },
          profileReq: {
            personalDetails: {
              firstname: 'do',
            }
          }
        }
      };
      mockcommonUtilService.updateAppLanguage = jest.fn();
      mobileDashboardComponent.userLanguage(res);
      expect(mobileDashboardComponent.defaultLang).toBe('hi');
      expect(mockcommonUtilService.updateAppLanguage).toHaveBeenCalledWith('hi');
    });
  });

  describe('formatFeaturedCourseResponse', () => {
    it('should format the response correctly', () => {
      const response = {
        result: {
          content: [
            {
              identifier: 'do-1234',
              name: 'course-1',
              contentType: 'Course',
              subTitle: 'Course Subtitle',
              description: 'Course Description',
              creator: 'Course Creator',
              duration: '10 hours',
              childNodes: [
                {
                  identifier: 'do-1234',
                  name: 'course-1'
                }
              ],
              batches: [
                {
                  batchId: 'do-1234'
                }
              ]
            }
          ]
        }
      };
     mobileDashboardComponent.formatFeaturedCourseResponse(response);
    });
  });

  describe('formatFeaturedCourseResponse', () => {
    it('should format the response correctly', () => {
      const response = {
        result: {
          content: [
            {
              identifier: 'do-1234',
              name: 'course-1',
              contentType: 'Course',
              subTitle: 'Course Subtitle',
              description: 'Course Description',
              creator: 'Course Creator',
              duration: '10 hours',
              childNodes: [
                {
                  identifier: 'do-1234',
                  name: 'course-1'
                }
              ],
              batches: [
                {
                  batchId: 'do-1234'
                }
              ]
            }
          ]
        }
      };
      mobileDashboardComponent.featuredCourseIdentifier = 'do-1234';
     mobileDashboardComponent.formatFeaturedCourseResponse(response);
    });
    it('should handle error case', () => {
      const response = {
        result: {
          content: []
        }
      };
     mobileDashboardComponent.formatFeaturedCourseResponse(response);
    }
    );
  })

  describe('formatemyCoursesResponse', () => {
    it('should format the response correctly', () => {
      const response = {
        result: {
          content: [
            {
              identifier: 'do-1234',
              name: 'course-1',
              contentType: 'Course',
              subTitle: 'Course Subtitle',
              description: 'Course Description',
              creator: 'Course Creator',
              duration: '10 hours',
              completionPercentage: 50,
              dateTime: 1234567890,
              childNodes: [
                {
                  identifier: 'do-1234',
                  name: 'course-1'
                }
              ],
              batches: [
                {
                  batchId: 'do-1234'
                }
              ]
            }
          ]
        }
      };
     mobileDashboardComponent.formatmyCourseResponse(response);
    });
  }); 

  describe('formatTopCertifiedCourseResponse', () => {
    it('should format the response correctly', () => {
      const response = {
        result: {
          content: [
            {
              identifier: 'do-1234',
              name: 'course-1',
              contentType: 'Course',
              subTitle: 'Course Subtitle',
              description: 'Course Description',
              creator: 'Course Creator',
              duration: '10 hours',
              childNodes: [
                {
                  identifier: 'do-1234',
                  name: 'course-1'
                }
              ],
              batches: [
                {
                  batchId: 'do-1234'
                }
              ]
            }
          ]
        }
      };
     mobileDashboardComponent.formatTopCertifiedCourseResponse(response);
    });
    it('should handle error case', () => {
      const response = {
        result: {
          content: []
        }
      };
     mobileDashboardComponent.formatTopCertifiedCourseResponse(response);
    }
    );
  })

  it('should invoked raiseTelemetry', () => {
    const identifier = 'do-1234';
    mockrouter.navigateByUrl = jest.fn(() => Promise.resolve(true));
    mobileDashboardComponent.raiseTelemetry(identifier);
    expect(mockrouter.navigateByUrl).toHaveBeenCalled();
  })

  it('should invoked openIframe', () => {
    const video = {
      videoIndex: 0
    }
    mockrouter.navigate =jest.fn(() => Promise.resolve(true));
    mobileDashboardComponent.openIframe(video);
    expect(mockrouter.navigate).toHaveBeenCalled();
  })

  it('should be navigate to view all courses', () => {
    mockcommonUtilService.addLoader = jest.fn(() => Promise.resolve());
    mockrouter.navigateByUrl = jest.fn(() => Promise.resolve(true));
    mobileDashboardComponent.naviagateToviewAllCourse();
    expect(mockcommonUtilService.addLoader).toHaveBeenCalled();
    expect(mockrouter.navigateByUrl).toHaveBeenCalled();
  });

  it('should be update nav bar for learner', () => {
    mockuserHomeSvc.setRole = jest.fn();
    mockevents.publish = jest.fn();
    mobileDashboardComponent.learner();
    //assert
    expect(mobileDashboardComponent.roleSelected).toBe('learner');
    expect(mockuserHomeSvc.setRole).toHaveBeenCalledWith('learner');
    expect(mockevents.publish).toHaveBeenCalledWith('updatePrimaryNavBarConfig');
  })

  it('should be update nav bar', () => {
    mockuserHomeSvc.setRole = jest.fn();
    mockevents.publish = jest.fn();
    mobileDashboardComponent.mentor();
    //assert
    expect(mobileDashboardComponent.roleSelected).toBe('mentor');
    expect(mockuserHomeSvc.setRole).toHaveBeenCalledWith('mentor');
    expect(mockevents.publish).toHaveBeenCalledWith('updatePrimaryNavBarConfig');
  });

  it('should stopPropagation', () => {
    const event = {
      stopPropagation: jest.fn()  
    } as any;
    mobileDashboardComponent.stopPropagation(event);
  })

  describe('preventCloseOnClickOut', () => {
    it('should set preventCloseOnClickOut to true', () => {
      mockoverlayContainer.getContainerElement = jest.fn(() => ({
          classList: {
            add: jest.fn(),
            remove: jest.fn()
          }
      })) as any;
      mobileDashboardComponent.preventCloseOnClickOut();
      expect(mockoverlayContainer.getContainerElement ).toHaveBeenCalled();
    });
  })

  describe('allowCloseOnClickOut', () => {
    it('should set allowCloseOnClickOut to true', () => {
      mockoverlayContainer.getContainerElement = jest.fn(() => ({
          classList: {
            add: jest.fn(),
            remove: jest.fn()
          }
      })) as any;
      mobileDashboardComponent.allowCloseOnClickOut();
      expect(mockoverlayContainer.getContainerElement ).toHaveBeenCalled();
    });
  })

  it('should close menu', () => {
    const event = {
      closeMenu: jest.fn()  
    } as any;
    mobileDashboardComponent.closeMenu(event);
  })

  it('should invoke openVideoPopup', () => {
    const data = {
      url: 'https://www.youtube.com/watch?v=1234',
      type: 'video'
    };
    mockdialog.open = jest.fn(() => ({
      afterClosed: jest.fn(() => of(true))
    })) as any;
    mocksanitizer.bypassSecurityTrustResourceUrl = jest.fn(() => 'https://www.youtube.com/watch?v=1234');
    mobileDashboardComponent.openVideoPopup(data);
    expect(mockdialog.open).toHaveBeenCalled();
  })

  it('should unsubscribe from all subscriptions', () => {
    mobileDashboardComponent.ngOnDestroy();
  });
})
