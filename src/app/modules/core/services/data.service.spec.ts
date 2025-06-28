// GET request returns successful response with status 200 and valid body
import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";
import { DataService } from "./data.service";
import * as jwt_decode from "jwt-decode";
import * as moment from "moment";
jest.mock('jwt-decode');
describe("DataService", () => {
  let service: DataService;
  let mockHttp: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    };
    mockAuthService = {
      getSession: jest.fn(),
      refreshSession: jest.fn(),
    };
    service = new DataService(mockHttp as HttpClient, mockAuthService as any);
    service.baseUrl = "http://test.com";
  });

  it("should return success response when GET request returns status 200", () => {
    const mockResponse = {
      body: {
        status: 200,
        data: "test data",
      },
    };

    mockHttp.get.mockReturnValue(of(mockResponse));

    service.get({ url: "/test" }).subscribe((response) => {
      expect(response).toEqual(mockResponse.body);
    });
  });

  it("should return error response when GET request fails", () => {
    const mockResponse = {
      body: {
        status: 500,
        message: "Internal Server Error",
      },
    };

    mockHttp.get.mockReturnValue(of(mockResponse));

    service.get({ url: "/test" }).subscribe(
      () => {},
      (error) => {
        expect(error).toEqual(mockResponse.body);
      }
    );
  });

  it('should return success response when POST request is successful', () => {
    const mockHttp = {
      post: jest.fn()
    };
    const mockAuthService = {
      getSession: jest.fn().mockReturnValue(of(null))
    };
    const service = new DataService(mockHttp as any, mockAuthService as any);
    service.baseUrl = 'http://test.com';

    const mockResponse = {
      status: 200,
      data: 'test data'
    };

    mockHttp.post.mockReturnValue(of(mockResponse));

    service.post({url: '/test', data: {test: 'data'}}).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should throw error when POST request fails', () => {
    const mockHttp = {
      post: jest.fn()
    };
    const mockAuthService = {
      getSession: jest.fn().mockReturnValue(of(null))
    };
    const service = new DataService(mockHttp as any, mockAuthService as any);
    service.baseUrl = 'http://test.com';

    const mockErrorResponse = {
      status: 400,
      error: 'Bad Request'
    };

    mockHttp.post.mockReturnValue(of(mockErrorResponse));

    service.post({url: '/test', data: {}}).subscribe(
      () => {},
      error => {
        expect(error).toEqual(mockErrorResponse);
      }
    );
  });

  it('should refresh token when it is about to expire', () => {
    const mockToken = {
      access_token: 'mockAccessToken'
    };
    const decodedToken = {
      exp: moment().add(1, 'hour').unix()
    };
    mockAuthService.getSession.mockReturnValue(of(mockToken));
    mockAuthService.refreshSession.mockReturnValue(of({}));
    (jwt_decode as jest.Mock).mockReturnValue(decodedToken);
    service.checkTokenValidation().subscribe(() => {
      expect(mockAuthService.refreshSession).toHaveBeenCalled();
      
    });
  });
  it('should throw error when DELETE request returns non-OK response code', () => {
    const mockHttp = {
      delete: jest.fn()
    };
    const mockAuthService = {};
    const service = new DataService(mockHttp as any, mockAuthService as any);
    service.baseUrl = 'http://test.com';

    const mockErrorResponse = {
      body: {
        responseCode: 'ERROR',
        error: 'Something went wrong'
      }
    };

    mockHttp.delete.mockReturnValue(of(mockErrorResponse));

    service.delete({url: '/test'}).subscribe(
      () => {},
      error => {
        expect(error).toEqual(mockErrorResponse.body);
      }
    );
  });

  it("should return success response when DELETE request is successful", () => {
    const mockResponse = {
      body: {
        responseCode: "OK",
        data: "test data",
      },
    };

    mockHttp.delete.mockReturnValue(of(mockResponse));

    service.delete({ url: "/test" }).subscribe((response) => {
      expect(response).toEqual(mockResponse.body);
    });
  });

  it("should return error response when DELETE request fails", () => {
    const mockResponse = {
      body: {
        responseCode: "ERROR",
        message: "Delete failed",
      },
    };

    mockHttp.delete.mockReturnValue(of(mockResponse));

    service.delete({ url: "/test" }).subscribe(
      () => {},
      (error) => {
        expect(error).toEqual(mockResponse.body);
      }
    );
  });
  it("should return success response when GET request returns status 200", () => {
    const mockHttp = {
      get: jest.fn(),
    };
    const mockAuthService = {};
    const service = new DataService(mockHttp as any, mockAuthService as any);
    service.baseUrl = "http://test.com";
  
    const mockResponse = {
      body: {
        status: 200,
        data: "test data",
      },
    };
  
    mockHttp.get.mockReturnValue(of(mockResponse));
  
    service.get({ url: "/test" }).subscribe((response) => {
      expect(response).toEqual(mockResponse.body);
    });
  });
  it("should return success response when POST request is successful", () => {
    const mockHttp = {
      post: jest.fn(),
    };
    const mockAuthService = {
      getSession: jest.fn().mockReturnValue(of(null)),
    };
    const service = new DataService(mockHttp as any, mockAuthService as any);
    service.baseUrl = "http://test.com";
  
    const mockResponse = {
      status: 200,
      data: "test data",
    };
  
    mockHttp.post.mockReturnValue(of(mockResponse));
  
    service
      .post({ url: "/test", data: { test: "data" } })
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });
  });
  it('should return empty observable when token is missing or null', () => {
    const mockAuthService = {
      getSession: jest.fn().mockReturnValue(of(null))
    };
    const dataService = new DataService(mockHttp as HttpClient, mockAuthService as any);

    dataService.checkTokenValidation().subscribe(result => {
      expect(result).toEqual({});
    });

    expect(mockAuthService.getSession).toHaveBeenCalled();
  });
  it('should refresh token when it expires in less than 2 hours', () => {
    const mockAuthService = {
      getSession: jest.fn().mockReturnValue(of({
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkelFFNjdiRmxRN0V2eUF3Tktndmk1X2ZQR0dsVUVKOGEyMnFlZ1R0TFU0In0.eyJqdGkiOiI0MzdkYTJlMC01Y2RmLTQ5MDYtOWVmYi0zYWNkNGJhNDAwN2EiLCJleHAiOjE3Mzc2MTA2MjMsIm5iZiI6MCwiaWF0IjoxNzM1MDE4NjIzLCJpc3MiOiJodHRwczovL3NwaGVyZS5hYXN0cmlrYS5vcmcvYXV0aC9yZWFsbXMvc3VuYmlyZCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJmOjkwN2I1YzY0LTFkNzktNDRkYi1iM2I1LWVjMTI5ZDU3ZjQyMToyYzUwODkxYi00Njg0LTRhYjQtOWYwMi0xY2NjNGVhMmNkODciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJwb3J0YWwiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI1ZDBmN2UzMC1hYzgzLTQyYjUtYmQ3Ni1lNzlmMTI2ZWJjOWYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYWRtaW4tc3BoZXJlLmFhc3RyaWthLm9yZyIsImh0dHBzOi8vb3JnLXNwaGVyZS5hYXN0cmlrYS5vcmciLCJodHRwczovY2JwLXNwaGVyZS5hYXN0cmlrYS5vcmciLCJodHRwczovL3NwaGVyZS5hYXN0cmlrYS5vcmcvKiIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiIiwibmFtZSI6ImJucmMgb25lIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYm5yY29uZV9iZ2FoIiwiZ2l2ZW5fbmFtZSI6ImJucmMiLCJmYW1pbHlfbmFtZSI6Im9uZSIsImVtYWlsIjoidGUqKioqKioqKkB5b3BtYWlsLmNvbSJ9.bukHlBGW8Mp8FdA25X25HaqR-iV_RTRDNzEbLAnI5Dtanh_EsK4tdjxjsG47WQnlcJT7fGsJV906rJsBdX8Im7WLCuHJ_pczSOmF42otv-t8lqm6sjn2Ems815QwMrbC8TMrPHZdgomILBnIjhioBgaaObQWHQI0OKSV0fLAiOuvVMwh8FNQJ0xBEvefIAHwCOtLEo3anIq7A9wgzt4m-0bF1rTGrBBt204oVn7MIwCVQJmLY_r0ceKQ3FNUJ_fwZWEVPoDBt8K-ld9Agg3S5lo1QQiyiPZ03jnW0xXLpANWJNy8moDA1CwQ956NVktXhfzChPtjxOZnKp4OIge09g'
      })),
      refreshSession: jest.fn().mockReturnValue(of({}))
    };

    const mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn()
    };

    const dataService = new DataService(mockHttpClient as any, mockAuthService as any);

    const decodedToken = {
      exp: moment().add(1, 'hour').unix()
    };

    (jwt_decode as jest.Mock).mockReturnValue(decodedToken);

    dataService.checkTokenValidation().subscribe(() => {
      expect(mockAuthService.refreshSession).toHaveBeenCalled();
    });
  });
});


