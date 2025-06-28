import { CordovaHttpService } from "./cordova-http.service";
import { of } from "rxjs";
import { HTTPResponse } from "@awesome-cordova-plugins/http/ngx";
import { ToastService } from "../../../../app/manage-learn/core/services/toast/toast.service";
import { ModalController } from "@ionic/angular";
import { ApiUtilsService } from "../../../../app/manage-learn/core/services/api-utils.service";
import appsConfig from "../../../../assets/configurations/apps.json";
import jwt_decode from "jwt-decode";
import * as moment from "moment";
jest.mock("../../../../assets/configurations/apps.json", () => ({
  default: {
    API: {
      secret_key: "test_token",
    },
  },
}));
jest.mock("jwt-decode", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./cordova-http.service', () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
      setHeaders = jest.fn();
    }
  };
});

describe("CordovaHttpService", () => {
  let service: CordovaHttpService;
  let authServiceMock: any;
  let utilityServiceMock: any;
  let toastServiceMock: any;
  let modalControllerMock: any;
  let apiUtilsMock: any;
  let ionicHttpMock: any;

  beforeEach(() => {
    authServiceMock = {
      getSession: jest.fn().mockReturnValue(of({ access_token: "test_token" })),
      refreshSession: jest.fn().mockReturnValue(of({})),
    };

    utilityServiceMock = {
      getBuildConfigValue: jest
        .fn()
        .mockResolvedValue("https://test-base-url.com"),
    };

    toastServiceMock = {
      showMessage: jest.fn(),
    };

    modalControllerMock = {};

    apiUtilsMock = {};

    ionicHttpMock = {
      setDataSerializer: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    service = new CordovaHttpService(
      {} as any,
      toastServiceMock as ToastService,
      modalControllerMock as ModalController,
      authServiceMock,
      {} as any,
      {} as any,
      apiUtilsMock as ApiUtilsService,
      ionicHttpMock,
      utilityServiceMock
    );
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should set headers correctly", () => {
    const session = { access_token: "test_token" };
    jest.spyOn(authServiceMock, "getSession").mockReturnValue(of(session));
    const headers = service.setHeaders(session);
    expect(headers["Authorization"]).toBe(`Bearer ${session.access_token}`);
    expect(headers["X-authenticated-user-token"]).toBe("test_token");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("should validate token and refresh if needed", () => {
    jest
      .spyOn(authServiceMock, "getSession")
      .mockReturnValue(of({ access_token: "test_token" }));
    jest.spyOn(authServiceMock, "refreshSession").mockReturnValue(of({}));

    service.checkTokenValidation().subscribe(() => {
      expect(authServiceMock.getSession).toHaveBeenCalled();
    });
  });

  it("should handle GET request", () => {
    const requestParams = { url: "/test", payload: {} };
    jest
      .spyOn(service, "checkTokenValidation")
      .mockReturnValue(of({ access_token: "test_token" }));
    jest.spyOn(service.ionicHttp, "get").mockResolvedValue({
      data: JSON.stringify({ success: true }),
      status: 200,
      headers: {},
      url: "/test",
    } as HTTPResponse);

    service.get(requestParams).subscribe((response) => {
      expect(response.success).toBe(true);
    });
  });

  it("should handle POST request", () => {
    const requestParams = { url: "/test", payload: {} };
    jest
      .spyOn(service, "checkTokenValidation")
      .mockReturnValue(of({ access_token: "test_token" }));
    jest.spyOn(service.ionicHttp, "post").mockResolvedValue({
      data: JSON.stringify({ success: true }),
      status: 200,
      headers: {},
      url: "/test",
    } as HTTPResponse);

    service.post(requestParams).subscribe((response) => {
      expect(response.success).toBe(true);
    });
  });

  it("should handle PATCH request", () => {
    const requestParams = { url: "/test", payload: {} };
    jest
      .spyOn(service, "checkTokenValidation")
      .mockReturnValue(of({ access_token: "test_token" }));
    jest.spyOn(service.ionicHttp, "patch").mockResolvedValue({
      data: JSON.stringify({ success: true }),
      status: 200,
      headers: {},
      url: "/test",
    } as HTTPResponse);

    service.patch(requestParams).subscribe((response) => {
      expect(response.success).toBe(true);
    });
  });

  it("should handle DELETE request", () => {
    const requestParams = { url: "/test" };
    jest
      .spyOn(service, "checkTokenValidation")
      .mockReturnValue(of({ access_token: "test_token" }));
    jest.spyOn(service.ionicHttp, "delete").mockResolvedValue({
      data: JSON.stringify({ success: true }),
      status: 200,
      headers: {},
      url: "/test",
    } as HTTPResponse);

    service.delete(requestParams).subscribe((response) => {
      expect(response.success).toBe(true);
    });
  });

  it("should handle error correctly", () => {
    const result = { status: 400, message: "Bad Request" };
    const handleErrorSpy = jest.spyOn(service as any, "handleError");
    service["handleError"](result);
    expect(handleErrorSpy).toHaveBeenCalledWith(result);
  });

  it("should check base URL correctly", () => {
    const url = "/test";
    const baseUrl = "https://test-base-url.com";
    service.baseUrl = baseUrl;
    const result = service["checkBaseUrl"](url);
    expect(result).toBe(`${baseUrl}${url}`);
  });

  it("should handle token expiration correctly", () => {
    const expiredToken = { access_token: "expired_token" };
    jest.spyOn(authServiceMock, "getSession").mockReturnValue(of(expiredToken));
    jest
      .spyOn(authServiceMock, "refreshSession")
      .mockReturnValue(of({ access_token: "new_token" }));

    service.checkTokenValidation().subscribe(() => {
      expect(authServiceMock.refreshSession).toHaveBeenCalled();
    });
  });

  it("should handle token validation without session", (done) => {
    jest.spyOn(authServiceMock, "getSession").mockReturnValue(of(null));

    service.checkTokenValidation().subscribe((session) => {
      expect(session).toEqual({});
      done();
    });
  });
  it("should handle POST request with error", () => {
    const requestParams = { url: "/test", payload: {} };
    jest
      .spyOn(service, "checkTokenValidation")
      .mockReturnValue(of({ access_token: "test_token" }));
    jest
      .spyOn(service.ionicHttp, "post")
      .mockRejectedValue({ status: 400, message: "Bad Request" });

    service.post(requestParams).subscribe({
      error: (error) => {
        expect(error.status).toBe(400);
      },
    });
  });

  it("should handle DELETE request with error", () => {
    const requestParams = { url: "/test" };
    jest
      .spyOn(service, "checkTokenValidation")
      .mockReturnValue(of({ access_token: "test_token" }));
    jest
      .spyOn(service.ionicHttp, "delete")
      .mockRejectedValue({ status: 400, message: "Bad Request" });

    service.delete(requestParams).subscribe({
      error: (error) => {
        expect(error.status).toBe(400);
      },
    });
  });

  it("should handle error correctly for status 0", () => {
    const result = { status: 0, message: "Network Error" };
    const handleErrorSpy = jest.spyOn(service as any, "handleError");
    service["handleError"](result);
    expect(handleErrorSpy).toHaveBeenCalledWith(result);
  });

  it("should handle error correctly for status 401", () => {
    const result = { status: 401, message: "Unauthorized" };
    const handleErrorSpy = jest.spyOn(service as any, "handleError");
    service["handleError"](result);
    expect(handleErrorSpy).toHaveBeenCalledWith(result);
  });

  it("should handle error correctly for status 419", () => {
    const result = { status: 419, message: "Token Expired" };
    const handleErrorSpy = jest.spyOn(service as any, "handleError");
    service["handleError"](result);
    expect(handleErrorSpy).toHaveBeenCalledWith(result);
  });

  it("should handle error correctly for status 400", () => {
    const result = { status: 400, message: "Bad Request" };
    const handleErrorSpy = jest.spyOn(service as any, "handleError");
    service["handleError"](result);
    expect(handleErrorSpy).toHaveBeenCalledWith(result);
  });

  it("should handle error correctly for other statuses", () => {
    const result = { status: 500, message: "Internal Server Error" };
    const handleErrorSpy = jest.spyOn(service as any, "handleError");
    service["handleError"](result);
    expect(handleErrorSpy).toHaveBeenCalledWith(result);
  });
  it("should set headers correctly without session", () => {
    const headers = service.setHeaders(null);
    expect(headers["Authorization"]).toBe(
      `Bearer ${appsConfig.API.secret_key}`
    );
    expect(headers["X-authenticated-user-token"]).toBe(undefined);
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("should set headers correctly with additional headers", () => {
    const session = { access_token: "test_token" };
    const additionalHeaders = { "Custom-Header": "custom_value" };
    const headers = service.setHeaders(session, additionalHeaders);
    expect(headers["Authorization"]).toBe(
      `Bearer ${appsConfig.API.secret_key}`
    );
    expect(headers["X-authenticated-user-token"]).toBe("test_token");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["Custom-Header"]).toBe("custom_value");
  });

  it("should handle GET request with error", () => {
    const requestParams = { url: "/test", payload: {} };
    jest
      .spyOn(service, "checkTokenValidation")
      .mockReturnValue(of({ access_token: "test_token" }));
    jest
      .spyOn(service.ionicHttp, "get")
      .mockRejectedValue({ status: 400, message: "Bad Request" });

    service.get(requestParams).subscribe({
      error: (error) => {
        expect(error.status).toBe(400);
      },
    });
  });

  it("should handle PATCH request with error", () => {
    const requestParams = { url: "/test", payload: {} };
    jest
      .spyOn(service, "checkTokenValidation")
      .mockReturnValue(of({ access_token: "test_token" }));
    jest
      .spyOn(service.ionicHttp, "patch")
      .mockRejectedValue({ status: 400, message: "Bad Request" });

    service.patch(requestParams).subscribe({
      error: (error) => {
        expect(error.status).toBe(400);
      },
    });
  });
  it("should set headers correctly with session", () => {
    const session = { access_token: "test_token" };
    const headers = service.setHeaders(session);
    expect(headers["Authorization"]).toBe(
      `Bearer ${appsConfig.API.secret_key}`
    );
    expect(headers["X-authenticated-user-token"]).toBe("test_token");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("should set headers correctly without session", () => {
    const headers = service.setHeaders(null);
    expect(headers["Authorization"]).toBe(
      `Bearer ${appsConfig.API.secret_key}`
    );
    expect(headers["X-authenticated-user-token"]).toBe(undefined);
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("should set headers correctly with additional headers", () => {
    const session = { access_token: "test_token" };
    const additionalHeaders = { "Custom-Header": "custom_value" };
    const headers = service.setHeaders(session, additionalHeaders);
    expect(headers["Authorization"]).toBe(
      `Bearer ${appsConfig.API.secret_key}`
    );
    expect(headers["X-authenticated-user-token"]).toBe("test_token");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["Custom-Header"]).toBe("custom_value");
  });

  it("should set headers correctly without session and additional headers", () => {
    const headers = service.setHeaders(null, {
      "Custom-Header": "custom_value",
    });
    expect(headers["Authorization"]).toBe(
      `Bearer ${appsConfig.API.secret_key}`
    );
    expect(headers["X-authenticated-user-token"]).toBe(undefined);
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["Custom-Header"]).toBe("custom_value");
  });
  it("should validate token and refresh if needed", () => {
    const expiredToken = { access_token: "expired_token" };
    const newToken = { access_token: "new_token" };
    jest.spyOn(authServiceMock, "getSession").mockReturnValueOnce(of(expiredToken));
    jest.spyOn(authServiceMock, "refreshSession").mockReturnValue(of(newToken));
    jest.spyOn(authServiceMock, "getSession").mockReturnValueOnce(of(newToken));

    service.checkTokenValidation().subscribe((session) => {
      expect(authServiceMock.getSession).toHaveBeenCalledTimes(2);
      expect(authServiceMock.refreshSession).toHaveBeenCalled();
      expect(session).toEqual(newToken);
    });
  });

  it("should return session if token is valid", () => {
    const validToken = { access_token: "valid_token" };
    jest.spyOn(authServiceMock, "getSession").mockReturnValue(of(validToken));

    service.checkTokenValidation().subscribe((session) => {
      expect(authServiceMock.getSession).toHaveBeenCalledTimes(1);
      expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
      expect(session).toEqual(validToken);
    });
  });

  it("should return empty object if no session exists", (done) => {
    jest.spyOn(authServiceMock, "getSession").mockReturnValue(of(null));

    service.checkTokenValidation().subscribe((session) => {
      expect(authServiceMock.getSession).toHaveBeenCalledTimes(1);
      expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
      expect(session).toEqual({});
      done();
    });
  });

  it("should handle invalid JWT token by returning empty object", () => {
    const invalidToken = { access_token: "invalid.token" };
    (jwt_decode as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });
    jest.spyOn(authServiceMock, "getSession").mockReturnValue(of(invalidToken));

    service.checkTokenValidation().subscribe((result) => {
      expect(authServiceMock.getSession).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  it("should refresh session when token exists and has less than 2 hours until expiry", () => {
    const tokenExpiringSoon = { access_token: "expiring.token" };
    const mockDecodedToken = { exp: moment().add(1, "hours").unix() };
    const refreshedToken = { access_token: "refreshed.token" };

    (jwt_decode as jest.Mock).mockReturnValue(mockDecodedToken);

    jest
      .spyOn(authServiceMock, "getSession")
      .mockReturnValueOnce(of(tokenExpiringSoon))
      .mockReturnValueOnce(of(refreshedToken));
    jest.spyOn(authServiceMock, "refreshSession").mockReturnValue(of({}));

    service.checkTokenValidation().subscribe((result) => {
      expect(authServiceMock.getSession).toHaveBeenCalledTimes(2);
      expect(authServiceMock.refreshSession).toHaveBeenCalled();
      expect(result).toEqual(refreshedToken);
    });
  });

  it("should decode token, calculate expiry, and handle more than 2 hours until expiry", () => {
    const tokenValidLonger = { access_token: "valid.token" };
    const mockDecodedToken = { exp: moment().add(3, "hours").unix() };

    (jwt_decode as jest.Mock).mockReturnValue(mockDecodedToken);

    jest.spyOn(authServiceMock, "getSession").mockReturnValue(of(tokenValidLonger));

    service.checkTokenValidation().subscribe((result) => {
      expect(authServiceMock.getSession).toHaveBeenCalled();
      expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
      expect(result).toEqual(tokenValidLonger);
    });
  });

  it("should handle undefined tokens gracefully", () => {
    jest.spyOn(authServiceMock, "getSession").mockReturnValue(of(undefined));

    service.checkTokenValidation().subscribe((result) => {
      expect(authServiceMock.getSession).toHaveBeenCalled();
      expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  it("should gracefully handle null decoded token", () => {
    const nullDecodedToken = null;
    const mockToken = { access_token: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkelFFNjdiRmxRN0V2eUF3Tktndmk1X2ZQR0dsVUVKOGEyMnFlZ1R0TFU0In0.eyJqdGkiOiI0MzdkYTJlMC01Y2RmLTQ5MDYtOWVmYi0zYWNkNGJhNDAwN2EiLCJleHAiOjE3Mzc2MTA2MjMsIm5iZiI6MCwiaWF0IjoxNzM1MDE4NjIzLCJpc3MiOiJodHRwczovL3NwaGVyZS5hYXN0cmlrYS5vcmcvYXV0aC9yZWFsbXMvc3VuYmlyZCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJmOjkwN2I1YzY0LTFkNzktNDRkYi1iM2I1LWVjMTI5ZDU3ZjQyMToyYzUwODkxYi00Njg0LTRhYjQtOWYwMi0xY2NjNGVhMmNkODciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJwb3J0YWwiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI1ZDBmN2UzMC1hYzgzLTQyYjUtYmQ3Ni1lNzlmMTI2ZWJjOWYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYWRtaW4tc3BoZXJlLmFhc3RyaWthLm9yZyIsImh0dHBzOi8vb3JnLXNwaGVyZS5hYXN0cmlrYS5vcmciLCJodHRwczovY2JwLXNwaGVyZS5hYXN0cmlrYS5vcmciLCJodHRwczovL3NwaGVyZS5hYXN0cmlrYS5vcmcvKiIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiIiwibmFtZSI6ImJucmMgb25lIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYm5yY29uZV9iZ2FoIiwiZ2l2ZW5fbmFtZSI6ImJucmMiLCJmYW1pbHlfbmFtZSI6Im9uZSIsImVtYWlsIjoidGUqKioqKioqKkB5b3BtYWlsLmNvbSJ9.bukHlBGW8Mp8FdA25X25HaqR-iV_RTRDNzEbLAnI5Dtanh_EsK4tdjxjsG47WQnlcJT7fGsJV906rJsBdX8Im7WLCuHJ_pczSOmF42otv-t8lqm6sjn2Ems815QwMrbC8TMrPHZdgomILBnIjhioBgaaObQWHQI0OKSV0fLAiOuvVMwh8FNQJ0xBEvefIAHwCOtLEo3anIq7A9wgzt4m-0bF1rTGrBBt204oVn7MIwCVQJmLY_r0ceKQ3FNUJ_fwZWEVPoDBt8K-ld9Agg3S5lo1QQiyiPZ03jnW0xXLpANWJNy8moDA1CwQ956NVktXhfzChPtjxOZnKp4OIge09g" };

    (jwt_decode as jest.Mock).mockReturnValue(nullDecodedToken);

    jest.spyOn(authServiceMock, "getSession").mockReturnValue(of(mockToken));

    service.checkTokenValidation().subscribe((result) => {
      expect(authServiceMock.getSession).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });
  it("should return session when token has more than 2 hours until expiry", () => {
    const mockToken = { access_token: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkelFFNjdiRmxRN0V2eUF3Tktndmk1X2ZQR0dsVUVKOGEyMnFlZ1R0TFU0In0.eyJqdGkiOiI0MzdkYTJlMC01Y2RmLTQ5MDYtOWVmYi0zYWNkNGJhNDAwN2EiLCJleHAiOjE3Mzc2MTA2MjMsIm5iZiI6MCwiaWF0IjoxNzM1MDE4NjIzLCJpc3MiOiJodHRwczovL3NwaGVyZS5hYXN0cmlrYS5vcmcvYXV0aC9yZWFsbXMvc3VuYmlyZCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJmOjkwN2I1YzY0LTFkNzktNDRkYi1iM2I1LWVjMTI5ZDU3ZjQyMToyYzUwODkxYi00Njg0LTRhYjQtOWYwMi0xY2NjNGVhMmNkODciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJwb3J0YWwiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI1ZDBmN2UzMC1hYzgzLTQyYjUtYmQ3Ni1lNzlmMTI2ZWJjOWYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYWRtaW4tc3BoZXJlLmFhc3RyaWthLm9yZyIsImh0dHBzOi8vb3JnLXNwaGVyZS5hYXN0cmlrYS5vcmciLCJodHRwczovY2JwLXNwaGVyZS5hYXN0cmlrYS5vcmciLCJodHRwczovL3NwaGVyZS5hYXN0cmlrYS5vcmcvKiIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiIiwibmFtZSI6ImJucmMgb25lIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYm5yY29uZV9iZ2FoIiwiZ2l2ZW5fbmFtZSI6ImJucmMiLCJmYW1pbHlfbmFtZSI6Im9uZSIsImVtYWlsIjoidGUqKioqKioqKkB5b3BtYWlsLmNvbSJ9.bukHlBGW8Mp8FdA25X25HaqR-iV_RTRDNzEbLAnI5Dtanh_EsK4tdjxjsG47WQnlcJT7fGsJV906rJsBdX8Im7WLCuHJ_pczSOmF42otv-t8lqm6sjn2Ems815QwMrbC8TMrPHZdgomILBnIjhioBgaaObQWHQI0OKSV0fLAiOuvVMwh8FNQJ0xBEvefIAHwCOtLEo3anIq7A9wgzt4m-0bF1rTGrBBt204oVn7MIwCVQJmLY_r0ceKQ3FNUJ_fwZWEVPoDBt8K-ld9Agg3S5lo1QQiyiPZ03jnW0xXLpANWJNy8moDA1CwQ956NVktXhfzChPtjxOZnKp4OIge09g" };
    const mockDecodedToken = { exp: moment().add(3, "hours").unix() };
  
    (jwt_decode as jest.Mock).mockReturnValue(mockDecodedToken);
    authServiceMock.getSession.mockReturnValue(of(mockToken));
  
    service.checkTokenValidation().subscribe((result) => {
      expect(authServiceMock.getSession).toHaveBeenCalledTimes(1);
      expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
      expect(result).toEqual(mockToken);
    });
  });
  // Successfully retrieves token from preferences and sets authToken with Bearer prefix
  it("should set authToken with Bearer prefix when token is retrieved successfully", () => {
    const mockPreferences = {
      getString: jest.fn().mockReturnValue(of("test-token")),
    };
    service = new CordovaHttpService(
      {} as any,
      toastServiceMock as ToastService,
      modalControllerMock as ModalController,
      authServiceMock,
      {} as any,
      mockPreferences as any,
      apiUtilsMock as ApiUtilsService,
      ionicHttpMock,
      utilityServiceMock
    );
    service.getToken();

    expect(service.authToken).toBe("Bearer test-token");
  });
});
