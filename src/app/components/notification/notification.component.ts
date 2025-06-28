import { Component, Inject, OnDestroy, OnInit, ViewChild, Renderer2 } from "@angular/core";
import { SafeHtml } from "@angular/platform-browser";
import { Socket, io } from "socket.io-client";
import { AuthService } from "sunbird-sdk";
import {Events} from '../../../util/events';
import { AppGlobalService, CommonUtilService, Environment, ImpressionSubtype, ImpressionType, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from "../../../services";
import { LocalStorageService } from "../../../app/manage-learn/core";
import { Router } from "@angular/router";
import { IonItemSliding } from '@ionic/angular';
import { buildConfig } from '../../../../configurations/configuration';
@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent implements OnInit, OnDestroy {
  @ViewChild('slidingItem') slidingItem!: IonItemSliding;
  dropdownContent = false;
  readNotificationList: any = [];
  unReadNotificationList: any = [];
  allnotificationList: any = [];
  access_token = '';
  user_id = '';
  message: SafeHtml;
  image: string;
  socket: Socket;
  loader: any;
  constructor(
    @Inject('AUTH_SERVICE') public authService: AuthService,
    private events: Events,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private storage: LocalStorageService,
    private router: Router,
    private renderer: Renderer2,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {}

  async ngOnInit() {
    this.loader = await this.commonUtilService.getLoader();
    this.loader.present();
    await this.getAccessToken()
    this.getReadNotifications();
    if (!(this.socket && this.socket.connected)) {
      await this.connectSocket();
    }
    await this.getNotification();
  }

  openDailog() {
    this.dropdownContent = !this.dropdownContent;
  }

  handleAction(message: string) {
    this.dropdownContent = !this.dropdownContent;
    switch(message) {
      case 'read':
        if (this.unReadNotificationList.length) {
         this.socket.emit('markAllAsRead', { userId: this.user_id });
        this.unReadNotificationList = this.unReadNotificationList.map((elem) => ({ ...elem, status: 'read' }));
        this.readNotificationList = [...this.readNotificationList, ...this.unReadNotificationList];
        this.storage.setLocalStorage('readNotificationLists', {userId: this.user_id, notifications :this.readNotificationList});
        this.unReadNotificationList = [];
        this.appGlobalService.setNumberOfNotifications(0); 
        this.events.publish("notificationCountUpdated", 0);
        this.setAllNotificationList();
        }
        break;
      case 'clear': 
        this.allnotificationList = [];
        if (this.readNotificationList.length) {
          this.readNotificationList = [];
          this.storage.setLocalStorage('readNotificationLists', {userId: this.user_id, notifications :this.readNotificationList});
          this.appGlobalService.setNumberOfNotifications(0); 
        }
        if (this.unReadNotificationList.length) {
          this.unReadNotificationList = [];
          this.appGlobalService.setNumberOfNotifications(0); 
        }
        this.events.publish("notificationCountUpdated", 0);
        break;
        default:  
        break;
    }
  }

 async getAccessToken() {
    const session = await this.authService.getSession().toPromise();
    this.user_id = session.userToken;
    this.access_token = session.access_token;
    return session.access_token;
  }

  async getNotification() {
    this.socket.emit('getNotifications', { userId: this.user_id });
    this.socket.on('notificationsData', async (data) => {
      try {
        this.appGlobalService.setNumberOfNotifications(data?.notificationData?.length);
        this.events.publish("notificationCountUpdated", data?.notificationData?.length);
        const notifications: [] = data.notificationData.map((e: any) => {
          e.data = JSON.parse(e.data);
          return e;
        });
        this.unReadNotificationList = notifications;
        if (this.loader) {
          await this.loader.dismiss();
        }
      } catch (error) {
        if (this.loader) {
          await this.loader.dismiss();
        }
      }
      this.setAllNotificationList();
    });
  }

  getReadNotifications() {
    this.storage.getLocalStorage('readNotificationLists').then(
      (data) => {
        if (data && data.notifications && data.userId === this.user_id) {
          this.readNotificationList = data.notifications;
        }
    });
  }

  getNotificationTime(createdOn){
  let createdDate = new Date(createdOn);
  let currentDate = new Date();
  let timeDifference: number = currentDate.getTime() - createdDate.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;
  const oneMinute = 60 * 1000;
  const days = Math.floor(timeDifference / oneDay);
  const hours = Math.floor((timeDifference % oneDay) / oneHour);
  const minute = Math.floor((timeDifference % oneHour) / oneMinute);
  const time = (days > 0 ? `${days}d` : (hours > 0 ? `${hours}hr` : `${minute}mins`));
  return time;
  }

  async connectSocket() {
    const url = `wss://${buildConfig.SITEPATH}`;;
    const token = this.access_token ? this.access_token : await this.getAccessToken();
     this.socket = io(url, { 
      auth: { token},
      path: '/apis/socket.io/'
    });
    this.socket.on('connect', () => {
      console.log(`Connected to the server with ID: ${this.socket.id}`);
  });

  }

  async readNotification(item: any) {
    if (!this.socket || !this.socket.connected) {
      await this.connectSocket();
    }
    if (item.status === 'read') {
      this.generateInteractTelemetry(item, 'already-read');
      this.notificationAction(item);
      return;
    }
   this.generateInteractTelemetry(item, 'read');
   this.socket.emit('markAsRead', { notificationId: item.id, userId: this.user_id });
    // update locally
    this.appGlobalService.setNumberOfNotifications(this.unReadNotificationList.length - 1);
    this.events.publish("notificationCountUpdated", this.unReadNotificationList.length - 1);

    this.readNotificationList.push({ ...item, status: 'read' });
    this.storage.setLocalStorage('readNotificationLists', {userId: this.user_id, notifications :this.readNotificationList});
    this.unReadNotificationList = this.unReadNotificationList.filter((elem) => elem.id !== item.id);
    this.setAllNotificationList();
    await this.notificationAction(item);
  }

  async notificationAction(item: any) {
    if (this.dropdownContent) {
      this.closeDailog();
    }
    if (item.data && item.data.actionData) {
      if (item.data.actionData.actionType.includes('course') || item.data.actionData.actionType.includes('certificate')) {
        let url = `/app/toc/` + `${item.data.actionData.identifier}` + `/overview`;
        this.router.navigate([url], { replaceUrl: true })
      } else if (item.data.actionData.actionType.includes('other')) {
        // navigation for other actions
      }
    }
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket disconnected');
    }
  }

  async deleteNotification(item: any) {
    if (item?.status === 'read') {
      this.readNotificationList = this.readNotificationList.filter((ele) => ele.id !== item.id );
      this.storage.setLocalStorage('readNotificationLists', {userId: this.user_id, notifications :this.readNotificationList});
    } else {
      this.unReadNotificationList = this.unReadNotificationList.filter((ele) => ele.id !== item.id );
        this.socket.emit('markAsRead', { notificationId: item.id, userId: this.user_id });
      this.events.publish("notificationCountUpdated", this.unReadNotificationList.length - 1);
    }
    this.generateInteractTelemetry(item, 'delete');
    this.setAllNotificationList();
  }

  setAllNotificationList() {
    this.generateImpressionTelemetry();
    if (this.readNotificationList.length || this.unReadNotificationList.length) {
      this.allnotificationList = [...this.readNotificationList, ...this.unReadNotificationList];
      this.allnotificationList.sort((a, b) => new Date(b.createdon).getTime() - new Date(a.createdon).getTime());
      return;
    }
  }

  ngAfterViewInit() {
    this.renderer.listen('document', 'click', (event: Event) => {
      if (this.slidingItem) {
        this.slidingItem.closeOpened();
      }
    });
  }

  closeDailog() {
    if (this.dropdownContent) {
    this.dropdownContent = false;
    }
  }

  generateImpressionTelemetry() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.PAGE_LOADED,
      '',
      PageId.NOTIFICATION,
      Environment.NOTIFICATION,
    )
  }

  generateInteractTelemetry(item, action) {
    const values = new Map();
    values['notificationId'] = item?.id;
    values['action'] = action;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      `${action}-clicked`,
      Environment.NOTIFICATION,
      PageId.NOTIFICATION
    );
  }

}
