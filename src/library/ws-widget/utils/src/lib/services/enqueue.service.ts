import { Inject, Injectable } from "@angular/core";
import { QueData,QueRequest } from "../interfaces/enquee.model";
import appsConfig from 'assets/configurations/apps.json';
import { AuthService, DeviceInfo } from '@project-sunbird/sunbird-sdk'
import { ApiUtilsService } from "../../../../../../app/manage-learn/core";



@Injectable({
  providedIn: 'root'
})
export class EnqueueService {

  constructor(
    @Inject('AUTH_SERVICE') public authService: AuthService,
    public apiUtils: ApiUtilsService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
  ) { }
  
  public enqueue(
    contentId: string,
    courseId: string,
    batchId: string,
    status: number,
    progress: number,
    body?:any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authService.getSession().toPromise()
        .then((session) => {
          const queData: QueData = {
            request: {
              userId: session.userToken ? session.userToken : '',
              contents: [
                {
                  userId: session.userToken ? session.userToken : '',
                  contentId: contentId,
                  courseId: courseId,
                  batchId: batchId,
                  status: status,
                  completionPercentage: progress
                }
              ]
            }
          };
  
      const request = {
        body: body ? body : {},
        type: "PATCH",
        host: "https://sphere.aastrika.org",
        path: "/apis/public/v8/mobileApp/kong/course/v1/content/state/update",
        serializer: "json",
        withBearerToken: true,
        withUserToken: false,
        headers: {
          "Authorization": `Bearer ${appsConfig.API.secret_key}`,
          "X-Authenticated-User-Token": session?.access_token || '',
          "X-App-Id": this.apiUtils.appName,
          "X-Device-Id": this.deviceInfo.getDeviceID(),
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        parameters: {}
      };
  
      const queRequest: QueRequest = {
        msg_id: "75d43cc2-1507-4ade-8dc3-2fb7a3fb9ceb",
        priority: 1,
        timestamp: 1699868448390,
        data: JSON.stringify(queData),
        item_count: 1,
        config: "{\"shouldPublishResult\":true}",
        type: "course_progress",
        request: JSON.stringify(request)
      };
  
          sbsync.enqueue(
            queData,
            queRequest,
            true,
            (queRes) => {
              console.log('_queRes-', queRes);
              resolve(queRes); 
            },
            (queError) => {
              console.log('_queError-', queError);
              reject(queError); 
            }
          );
        })
        .catch((error) => {
          console.error('Error getting session:', error);
          reject(error); 
        });
    });
  }

  public assementEnqueue(
    contentId: string,
    courseId: string,
    batchId: string,
    body?:any
  ): Promise<any> {
    let requestBody = body? body:[]
    return new Promise((resolve, reject) => {
      this.authService.getSession().toPromise()
        .then((session) => {
          const queData: any = {
            ...requestBody
          };
  
      const request = {
        body: body ? {...body, passPercentage: 70} : {},
        type: "POST",
        host: "https://sphere.aastrika.org",
        path: "/apis/public/v8/mobileApp/submitAssessment",
        serializer: "json",
        withBearerToken: true,
        withUserToken: false,
        headers: {
          "Authorization": `Bearer ${appsConfig.API.secret_key}`,
          "X-Authenticated-User-Token": session?.access_token || '',
          "X-App-Id": this.apiUtils.appName,
          "X-Device-Id": this.deviceInfo.getDeviceID(),
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        parameters: {}
      };
  
      const queRequest: QueRequest = {
        msg_id: "75d43cc2-1507-4ade-8dc3-2fb7a3fb9ceb",
        priority: 1,
        timestamp: 1699868448390,
        data: JSON.stringify(queData),
        item_count: 1,
        config: "{\"shouldPublishResult\":true}",
        type: "course_progress",
        request: JSON.stringify(request)
      };
          sbsync.enqueue(
            queData,
            queRequest,
            true,
            (queRes) => {
              console.log('_queRes-', queRes);
              resolve(queRes); 
            },
            (queError) => {
              console.log('_queError-', queError);
              reject(queError); 
            }
          );
        })
        .catch((error) => {
          console.error('Error getting session:', error);
          reject(error); 
        });
    });
  }
  public scromEnqueue(
    body?:any
  ): Promise<any> {
    let requestBody = body? body:[]
    return new Promise((resolve, reject) => {
      this.authService.getSession().toPromise()
        .then((session) => {
          const queData: any = {
            ...requestBody
          };
  
      const request = {
        body: body ? {...body} : {},
        type: "POST",
        host: "https://sphere.aastrika.org",
        path: "/apis/public/v8/mobileApp/v2/updateProgress",
        serializer: "json",
        withBearerToken: true,
        withUserToken: false,
        headers: {
          "Authorization": `Bearer ${appsConfig.API.secret_key}`,
          "X-Authenticated-User-Token": session?.access_token || '',
          "X-App-Id": this.apiUtils.appName,
          "X-Device-Id": this.deviceInfo.getDeviceID(),
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        parameters: {}
      };
  
      const queRequest: QueRequest = {
        msg_id: "75d43cc2-1507-4ade-8dc3-2fb7a3fb9ceb",
        priority: 1,
        timestamp: 1699868448390,
        data: JSON.stringify(queData),
        item_count: 1,
        config: "{\"shouldPublishResult\":true}",
        type: "course_progress",
        request: JSON.stringify(request)
      };
  
          sbsync.enqueue(
            queData,
            queRequest,
            true,
            (queRes) => {
              console.log('_queRes-', queRes);
              resolve(queRes); 
            },
            (queError) => {
              console.log('_queError-', queError);
              reject(queError); 
            }
          );
        })
        .catch((error) => {
          console.error('Error getting session:', error);
          reject(error); 
        });
    });
  }
}
