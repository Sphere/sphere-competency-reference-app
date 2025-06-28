import { NotificationComponent } from "./notification.component";
import { Router } from "@angular/router";
import { CommonUtilService, AppGlobalService, TelemetryGeneratorService, ImpressionType, PageId, Environment } from "../../../services";
import { Events } from "../../../util/events";
import { LocalStorageService } from "../../manage-learn/core";
import { AuthService } from "@project-sunbird/sunbird-sdk";
import { Renderer2 } from "@angular/core";
import { of } from "rxjs";
import { io } from "socket.io-client";
jest.mock('socket.io-client', () => ({
  io: jest.fn(), // Mocking the `io` function
}));

describe("NotificationComponent", () => {
  let component: NotificationComponent;

  const mockAuthService: Partial<AuthService> = {};
  const mockEvents: Partial<Events> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockAppGlobalService: Partial<AppGlobalService> = {};
  const mockStorage: Partial<LocalStorageService> = {};
  const mockRouter: Partial<Router> = {};
  const mockRenderer: Partial<Renderer2> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateImpressionTelemetry: jest.fn()
  };
  let socket: any;

  beforeAll(() => {
    component = new NotificationComponent(
      mockAuthService as AuthService,
      mockEvents as Events,
      mockCommonUtilService as CommonUtilService,
      mockAppGlobalService as AppGlobalService,
      mockStorage as LocalStorageService,
      mockRouter as Router,
      mockRenderer as Renderer2,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe('connectSocket', () => {
    let mockSocket: any;
    beforeEach(() => {
      component = new NotificationComponent(
        mockAuthService as AuthService,
        mockEvents as Events,
        mockCommonUtilService as CommonUtilService,
        mockAppGlobalService as AppGlobalService,
        mockStorage as LocalStorageService,
        mockRouter as Router,
        mockRenderer as Renderer2,
        mockTelemetryGeneratorService as TelemetryGeneratorService
      );
  
      // Mock socket implementation
      mockSocket = {
        on: jest.fn((_, cb) => cb({id: 'test-id'})),
        emit: jest.fn(),
        connect: jest.fn(),
      };
  
      (io as jest.Mock).mockReturnValue(mockSocket);
    });
    it('should connect to socket', async() => {
      // Arrange  
     component.access_token = 'test-token';
      jest.spyOn(global, 'setTimeout').mockImplementation();
      jest.useFakeTimers();
      // Act
      await component.connectSocket();
      // Assert 
      expect(io).toHaveBeenCalledWith("wss://sphere.aastrika.org", {
        auth: { token: 'test-token' },
        path: '/apis/socket.io/'
      });
    })
  })

  describe("getNotification", () => {
    it("should call getNotifications", async () => {
      // Arrange
      const emitMock = jest.fn(() => ({ notifications: [] }));
      const onMock = jest.fn((_, __) =>
        __({
          notificationData: [
            {
              userid: "0eb7e0aa-481a-4f00-a8be-f5173202507c",
              id: "45f38820-6c3a-436d-9ecb-d89f2f68190a",
              category: "event",
              createdby: "system",
              createdon: "2025-01-28T14:49:01.697Z",
              data: '{"type":"event","actionData":{"actionType":"certificateUpdate","title":"Normal Labour & Birth and AMTSL","description":"Congratulations! You have successfully completed the course","identifier":"do_1134170689871134721450","logo":"https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1134170689871134721450/artifact/do_1134172312759009281507_1637848523570_normallabourandbirthalt1620746178335.thumb.png"}}',
              expireon: "2025-02-04T14:49:01.697Z",
              priority: "medium",
              status: "unread",
              updatedby: "system",
              updatedon: "2025-01-28T14:49:01.697Z",
            },
          ],
        })
      );

      const socketMock = { emit: emitMock, on: onMock } as any;
      component.socket = socketMock;
      component.user_id = "test-user-123";
      mockAppGlobalService.setNumberOfNotifications = jest.fn();
      mockEvents.publish = jest.fn();
      component.loader = { present: jest.fn(), dismiss: jest.fn() } as any;
      // Act
      await component.getNotification();
      // Assert
      expect(socketMock.emit).toHaveBeenCalledWith("getNotifications", {
        userId: "test-user-123",
      });
      expect(socketMock.on).toHaveBeenCalledWith(
        "notificationsData",
        expect.any(Function)
      );
      expect(
        mockAppGlobalService.setNumberOfNotifications
      ).toHaveBeenCalledWith(1);
      expect(mockEvents.publish).toHaveBeenCalledWith(
        "notificationCountUpdated",
        1
      );
    });
  });

  describe("getReadNotifications", () => {
    it("should call getReadNotifications", () => {
      // arrange
      mockStorage.getLocalStorage = jest.fn(() => Promise.resolve({
        notifications: [
          {
            userid: "0eb7e0aa-481a-4f00-a8be-f5173202507c",
            id: "45f38820-6c3a-436d-9ecb-d89f2f68190a",
            category: "event",
            createdby: "system",
            createdon: "2025-01-28T14:49:01.697Z",
            data: '{"type":"event","actionData":{"actionType":"certificateUpdate","title":"Normal Labour & Birth and AMTSL","description":"Congratulations! You have successfully completed the course","identifier":"do_1134170689871134721450","logo":"https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1134170689871134721450/artifact/do_1134172312759009281507_1637848523570_normallabourandbirthalt1620746178335.thumb.png"}}',
            expireon: "2025-02-04T14:49:01.697Z",
            priority: "medium",
            status: "unread",
            updatedby: "system",
            updatedon: "2025-01-28T14:49:01.697Z",
          },
        ],
        userId: "test-user-123",
      }));
      component.user_id = "test-user-123";
      // act
      component.getReadNotifications();
      // assert
      expect(mockStorage.getLocalStorage).toHaveBeenCalledWith(
        "readNotificationLists"
      );  
    });
  });

  it('should be return the exact time as days, hours and minutes', () => {
    // Arrange
    const date = '2025-01-28T14:49:01.697Z';
    // Act
    const result = component.getNotificationTime(date);
    // Assert
    expect(result).toBeTruthy();
  });

  describe('readNotification', () => {
    it('should not call readNotification for read notification', async() => {
      // Arrange
      component.socket = undefined as any;
      jest.spyOn(component, 'connectSocket').mockResolvedValue();
      const item = {
        id: 'notification-id',
        name: 'notification-name',
        createdon: '2025-01-28T14:49:01.697Z',
        status: 'read'
      };
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      const emitMock = jest.fn();
      const socketMock = { emit: emitMock } as any;
      component.socket = socketMock;
      // Act
      await component.readNotification(item);
      // Assert
      expect(component.connectSocket).toHaveBeenCalled();
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      expect(emitMock).not.toHaveBeenCalled();
    })
    it('should call readNotification for unread notification', async() => {
      // Arrange
      component.socket = undefined as any;
      jest.spyOn(component, 'connectSocket').mockResolvedValue();
      const item = {
        "userid": "0eb7e0aa-481a-4f00-a8be-f5173202507c",
        "id": "5c781035-a57b-46d9-af3c-b7a0b3bbd72c",
        "category": "event",
        "createdby": "system",
        "createdon": "2025-01-28T14:49:13.637Z",
        "data": JSON.parse("{\"type\":\"event\",\"actionData\":{\"actionType\":\"courseUpdate\",\"title\":\"Infection Prevention\",\"description\":\"New Course Added\",\"identifier\":\"do_113789659935694848169\",\"logo\":\"https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1137914849112309761114/artifact/do_1137914849112309761114_1683530873281_combined1683530872216.png\"}}"),
        "expireon": "2025-02-04T14:49:13.637Z",
        "priority": "medium",
        "status": "unread",
        "updatedby": "system",
        "updatedon": "2025-01-28T14:49:13.637Z"
      }
      const emitMock = jest.fn();
      const socketMock = { emit: emitMock } as any;
      component.socket = socketMock;
      mockAppGlobalService.setNumberOfNotifications = jest.fn();
      mockEvents.publish = jest.fn();
      mockStorage.setLocalStorage = jest.fn();
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      // Act
      await component.readNotification(item);
      // Assert
      expect(component.connectSocket).toHaveBeenCalled();
      expect(emitMock).toHaveBeenCalledWith('markAsRead', { notificationId: '5c781035-a57b-46d9-af3c-b7a0b3bbd72c', userId: 'test-user-123' });
      expect(mockAppGlobalService.setNumberOfNotifications).toHaveBeenCalledWith(0);
      expect(mockEvents.publish).toHaveBeenCalledWith("notificationCountUpdated", 0);
      expect(mockStorage.setLocalStorage).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
    })

    it('should call readNotification for unread notification for other content', async() => {
      // Arrange
      jest.spyOn(component, 'connectSocket').mockResolvedValue();
      const item = {
        "userid": "0eb7e0aa-481a-4f00-a8be-f5173202507c",
        "id": "5c781035-a57b-46d9-af3c-b7a0b3bbd72c",
        "category": "event",
        "createdby": "system",
        "createdon": "2025-01-28T14:49:13.637Z",
        "data": JSON.parse("{\"type\":\"event\",\"actionData\":{\"actionType\":\"other\",\"title\":\"Infection Prevention\",\"description\":\"New Course Added\",\"identifier\":\"do_113789659935694848169\",\"logo\":\"https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1137914849112309761114/artifact/do_1137914849112309761114_1683530873281_combined1683530872216.png\"}}"),
        "expireon": "2025-02-04T14:49:13.637Z",
        "priority": "medium",
        "status": "unread",
        "updatedby": "system",
        "updatedon": "2025-01-28T14:49:13.637Z"
      }
      const emitMock = jest.fn();
      const socketMock = { emit: emitMock } as any;
      component.socket = socketMock;
      mockAppGlobalService.setNumberOfNotifications = jest.fn();
      mockEvents.publish = jest.fn();
      mockStorage.setLocalStorage = jest.fn();
      // Act
      await component.readNotification(item);
      // Assert
      expect(component.connectSocket).toHaveBeenCalled();
      expect(emitMock).toHaveBeenCalledWith('markAsRead', { notificationId: '5c781035-a57b-46d9-af3c-b7a0b3bbd72c', userId: 'test-user-123' });
      expect(mockAppGlobalService.setNumberOfNotifications).toHaveBeenCalledWith(0);
      expect(mockEvents.publish).toHaveBeenCalledWith("notificationCountUpdated", 0);
      expect(mockStorage.setLocalStorage).toHaveBeenCalled();
    })
  });

  describe('ngOnDestroy', () => {
    it('should disconnect the socket', () => {
      // Arrange
      component.socket = { disconnect: jest.fn(), on: jest.fn(), emit: jest.fn() } as any;
      // Act
      component.ngOnDestroy();
      // Assert
      expect(component.socket.disconnect).toHaveBeenCalled();
    })
  });

  describe('deleteNotification', () => { 
    it('should delete read notification', async() => {
      // Arrange
      const item = {
        "userid": "0eb7e0aa-481a-4f00-a8be-f5173202507c",
        "id": "5c781035-a57b-46d9-af3c-b7a0b3bbd72c",
        "category": "event",
        "createdby": "system",
        "createdon": "2025-01-28T14:49:13.637Z",  
        "expireon": "2025-02-04T14:49:13.637Z",
        "priority": "medium",
        "status": "read",
        "updatedby": "system",
        "updatedon": "2025-01-28T14:49:13.637Z"
      }
      mockStorage.setLocalStorage = jest.fn();
      // Act
      await component.deleteNotification(item);
      // Assert
      expect(mockStorage.setLocalStorage).toHaveBeenCalled();
    })

    it('should delete unread notification', async() => {
      // Arrange
      const item = {
        "userid": "0eb7e0aa-481a-4f00-a8be-f5173202507c",
        "id": "5c781035-a57b-46d9-af3c-b7a0b3bbd72c",
        "category": "event",
        "createdby": "system",
        "createdon": "2025-01-28T14:49:13.637Z",  
        "expireon": "2025-02-04T14:49:13.637Z",
        "priority": "medium",
        "status": "unread",
        "updatedby": "system",
        "updatedon": "2025-01-28T14:49:13.637Z"
      }
      component.socket = { emit: jest.fn() } as any;
      mockEvents.publish = jest.fn();
      // Act
      await component.deleteNotification(item);
      // Assert
      expect(mockEvents.publish).toHaveBeenCalled();  
    })
  });

  it('should positioned the notification list by invocked ngAfterViewInit', () => {
    // Arrange
    mockRenderer.listen = jest.fn((_, __, ___) => ___({})) as any;
    component.slidingItem = { closeOpened: jest.fn() } as any;
    // Act
    component.ngAfterViewInit();
    // Assert
    expect(mockRenderer.listen).toHaveBeenCalled();
  });

  it('should close the dropdown content', () => {
    // Arrange
    component.dropdownContent = true;
    // Act
    component.closeDailog();
    // Assert
    expect(component.dropdownContent).toBeFalsy();
  });

  it('should return access_token and set userId', async() => {
    // Arrange
    mockAuthService.getSession = jest.fn(() => of({ access_token: 'test-token', userToken: 'test-user-123' })) as any;
    // Act
    await component.getAccessToken();
    // Assert
    expect(component.access_token).toBe('test-token');
    expect(component.user_id).toBe('test-user-123');
    expect(mockAuthService.getSession).toHaveBeenCalled();
  })

  describe('handleAction', () => {
    it('should handle action as read all', () => {
      // Arrange
      const message = 'read'
      component.unReadNotificationList = [
        {
          "userid": "0eb7e0aa-481a-4f00-a8be-f5173202507c",
          "id": "5c781035-a57b-46d9-af3c-b7a0b3bbd72c",
          "category": "event",
          "createdby": "system",
          "createdon": "2025-01-28T14:49:13.637Z",
          "data": "{\"type\":\"event\",\"actionData\":{\"actionType\":\"courseUpdate\",\"title\":\"Infection Prevention\",\"description\":\"New Course Added\",\"identifier\":\"do_113789659935694848169\",\"logo\":\"https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1137914849112309761114/artifact/do_1137914849112309761114_1683530873281_combined1683530872216.png\"}}",
          "expireon": "2025-02-04T14:49:13.637Z",
          "priority": "medium",
          "status": "unread",
          "updatedby": "system",
          "updatedon": "2025-01-28T14:49:13.637Z"
        }
      ];
      const emitMock = jest.fn();
      const socketMock = { emit: emitMock } as any;
      component.socket = socketMock;
      mockStorage.setLocalStorage = jest.fn();
      mockAppGlobalService.setNumberOfNotifications = jest.fn();
      mockEvents.publish = jest.fn();
      // Act
      component.handleAction(message);
      // Assert
      expect(emitMock).toHaveBeenCalledWith('markAllAsRead', { userId: 'test-user-123' });
      expect(component.dropdownContent).toBeTruthy();
      expect(mockStorage.setLocalStorage).toHaveBeenCalled();
      expect(mockAppGlobalService.setNumberOfNotifications).toHaveBeenCalledWith(0);
      expect(mockEvents.publish).toHaveBeenCalledWith("notificationCountUpdated", 0);
      expect(component.unReadNotificationList).toEqual([]);
    });

    it('should handle action as clear', () => {
      // Arrange
      const message = 'clear'
      component.unReadNotificationList = [
        {
          "userid": "0eb7e0aa-481a-4f00-a8be-f5173202507c",
          "id": "5c781035-a57b-46d9-af3c-b7a0b3bbd72c",
          "category": "event",
          "createdby": "system",
          "createdon": "2025-01-28T14:49:13.637Z",
          "data": "{\"type\":\"event\",\"actionData\":{\"actionType\":\"courseUpdate\",\"title\":\"Infection Prevention\",\"description\":\"New Course Added\",\"identifier\":\"do_113789659935694848169\",\"logo\":\"https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1137914849112309761114/artifact/do_1137914849112309761114_1683530873281_combined1683530872216.png\"}}",
          "expireon": "2025-02-04T14:49:13.637Z",
          "priority": "medium",
          "status": "unread",
          "updatedby": "system",
          "updatedon": "2025-01-28T14:49:13.637Z"
        }
      ];
      component.readNotificationList = [
        {
          "userid": "0eb7e0aa-481a-4f00-a8be-f5173202507c",
          "id": "5c781035-a57b-46d9-af3c-b7a0b3bbd72c",
          "category": "event",
          "createdby": "system",
          "createdon": "2025-01-28T14:49:13.637Z",
          "data": "{\"type\":\"event\",\"actionData\":{\"actionType\":\"courseUpdate\",\"title\":\"Infection Prevention\",\"description\":\"New Course Added\",\"identifier\":\"do_113789659935694848169\",\"logo\":\"https://sunbirdcontent.s3-ap-south-1.amazonaws.com/content/do_1137914849112309761114/artifact/do_1137914849112309761114_1683530873281_combined1683530872216.png\"}}",
          "expireon": "2025-02-04T14:49:13.637Z",
          "priority": "medium",
          "status": "unread",
          "updatedby": "system",
          "updatedon": "2025-01-28T14:49:13.637Z"
        }
      ];
      mockStorage.setLocalStorage = jest.fn();
      mockAppGlobalService.setNumberOfNotifications = jest.fn();
      mockEvents.publish = jest.fn();
      // Act
      component.handleAction(message);
      // Assert
      expect(component.dropdownContent).toBeFalsy();
      expect(mockStorage.setLocalStorage).toHaveBeenCalled();
      expect(mockAppGlobalService.setNumberOfNotifications).toHaveBeenCalledWith(0);
      expect(mockEvents.publish).toHaveBeenCalledWith("notificationCountUpdated", 0);
      expect(component.unReadNotificationList).toEqual([]);
    });

    it('should handle action as default', () => {
      // Arrange
      const message = 'default'
      // Act
      component.handleAction(message);
      // Assert
      expect(component.dropdownContent).toBeTruthy();
    });
  });

  it('should open the dropdown content', () => {
    // Arrange
    component.dropdownContent = false;
    // Act
    component.openDailog();
    // Assert
    expect(component.dropdownContent).toBeTruthy();
  });

  it('should invoked ngOnInit', async() => {
    // Arrange
    mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({ present: jest.fn() })) as any;
    jest.spyOn(component, 'getAccessToken').mockResolvedValue('test-token');
    jest.spyOn(component, 'getReadNotifications').mockImplementation();
    jest.spyOn(component, 'connectSocket').mockResolvedValue();
    jest.spyOn(component, 'getNotification').mockImplementation();
    mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
    // Act
    await component.ngOnInit();
    // Assert
    expect(component.loader.present).toHaveBeenCalled();
    expect(component.getAccessToken).toHaveBeenCalled();
    expect(component.getReadNotifications).toHaveBeenCalled();
    expect(component.connectSocket).toHaveBeenCalled();
    expect(component.getNotification).toHaveBeenCalled();
  });
});
