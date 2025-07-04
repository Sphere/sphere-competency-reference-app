import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { NsAppToc } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import { ViewerUtilService } from '../../../../../../../../../project/ws/viewer/src/lib/viewer-util.service';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonUtilService } from '../../../../../../../../../services/common-util.service';
import { TranslateService } from '@ngx-translate/core'
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx'
import { NsContent } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model';
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { WidgetContentService } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service';
import { viewerRouteGenerator } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/viewer-route-util';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
declare var cordova;
@Component({
  selector: 'ws-app-toc-content-card',
  templateUrl: './app-toc-content-card.component.html',
  styleUrls: ['./app-toc-content-card.component.scss'],
})
export class AppTocContentCardComponent implements OnInit, OnChanges {
  @Input() content: NsContent.IContent | null = null
  @Input() expandAll = false
  @Input() rootId!: string
  @Input() rootContentType!: string
  @Input() forPreview = false
  @Input() batchId!: string
  @Output() expandChild = new EventEmitter<any>()
  @Input() references = false
  disabledNode = false
  contentId!: string
  hasContentStructure = false
  resourceContentType: any
  enumContentTypes = NsContent.EDisplayContentTypes
  contentStructure: NsAppToc.ITocStructure = {
    assessment: 0,
    course: 0,
    handsOn: 0,
    interactiveVideo: 0,
    learningModule: 0,
    other: 0,
    pdf: 0,
    podcast: 0,
    quiz: 0,
    video: 0,
    webModule: 0,
    webPage: 0,
    youtube: 0,
  }
  defaultThumbnail = ''
  viewChildren = false
  greenTickIcon = '/fusion-assets/images/green-checked3.svg'
  redTickIcon = '/fusion-assets/images/red-tick.svg';
  public isDownloading = false;

  iconMapping: { [key: string]: string } = {
    pdf: '../../../../../../../../../assets/imgs/PDF.svg',
    video: '../../../../../../../../../assets/imgs/Video.svg',
    link: '../../../../../../../../../assets/imgs/Link.svg',
    audio: '../../../../../../../../../assets/imgs/Audio.svg'
  };

  constructor(
    private viewSvc: ViewerUtilService,
    private configSvc: ConfigurationsService,
    private route: ActivatedRoute,
    private router: Router,
    private tocSvc: AppTocService,
    private contentSvc: WidgetContentService,
    private file: File,
    private http: HTTP,
    public matSnackBar: MatSnackBar,
    public commonUtilService: CommonUtilService,
    private translate: TranslateService,
    private iab: InAppBrowser
  ) {
  }

  ngOnInit() {
    this.evaluateImmediateChildrenStructure()
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
    this.route.queryParams.subscribe((params: Params) => {
      this.batchId = params['batchId']
      this.contentId = params['contentId']
    })
    this.disabledNode = this.tocSvc.getNode();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      if (property === 'expandAll') {
        this.viewChildren = this.expandAll
      }
    }
  }

  setConfirmDialogStatus(percentage:any){
    this.contentSvc.showConformation = percentage
  }

  resourceContentTypeFunct(type: any) {
    if (type === 'application/vnd.ekstep.content-collection') {
      this.resourceContentType = 'Topic'
    } else if (type === 'application/pdf') {
      this.resourceContentType = 'PDF'
    } else if (type === 'application/quiz' || type === 'application/json') {
      this.resourceContentType = 'Assessment'
    } else if (type === 'application/html' || type === 'application/vnd.ekstep.html-archive') {
      this.resourceContentType = 'Scorm'
    } else if (type === 'application/x-mpegURL' || type === 'video/mp4') {
      this.resourceContentType = 'Video'
    } else if (type === 'audio/mpeg') {
      this.resourceContentType = 'Audio'
    } else if (type === 'video/x-youtube' || type === 'text/x-url' || type === 'application/web-module') {
      this.resourceContentType = 'Link'
    } else { this.resourceContentType = 'Course' }
  }

  reDirect(content: any) {
    // tslint:disable-next-line:max-line-length
    const url = `${content.url}?primaryCategory=${content.queryParams.primaryCategory}&collectionId=${content.queryParams.collectionId}&collectionType=${content.queryParams.collectionType}&batchId=${content.queryParams.batchId}`
    this.router.navigateByUrl(`${url}`)
  }
  get isCollection(): boolean {
    if (this.content) {
      this.resourceContentTypeFunct(this.content.mimeType)
      if (this.content.mimeType === NsContent.EMimeTypes.COLLECTION) {
        const filteredData = this.content.children.filter((data: any) => {
          // tslint:disable-next-line: no-non-null-assertion
          return data!.completionPercentage < 100 || data!.completionPercentage === undefined
        })
        if (filteredData.length > 0) {
          this.content['incomplete'] = true
        } else {
          this.content['incomplete'] = false
        }
        return true
      }
    }
    return false
  }
  get isResource(): boolean {
    if (this.content) {
      return (
        this.content.contentType === 'Resource' || this.content.contentType === 'Knowledge Artifact'
      )
    }
    return false
  }
  get resourceLink(): { url: string; queryParams: { [key: string]: any } } {
    if (this.content) {
      return viewerRouteGenerator(
        this.content.identifier,
        this.content.mimeType,
        this.rootId,
        this.rootContentType,
        this.forPreview,
        this.content.primaryCategory,
        this.batchId
      )
    }
    return { url: '', queryParams: {} }
  }
  private evaluateImmediateChildrenStructure() {
    // if (this.content && this.content.children.length) {
    if (this.content && this.content.children && this.content.children.length) {
      this.content.children.forEach((child: NsContent.IContent) => {
        if (child.contentType === NsContent.EContentTypes.COURSE) {
          this.contentStructure.course += 1
        } else if (child.contentType === NsContent.EContentTypes.KNOWLEDGE_ARTIFACT) {
          this.contentStructure.other += 1
        } else if (child.contentType === NsContent.EContentTypes.MODULE) {
          this.contentStructure.learningModule += 1
        } else if (child.contentType === NsContent.EContentTypes.RESOURCE) {
          switch (child.mimeType) {
            case NsContent.EMimeTypes.HANDS_ON:
              this.contentStructure.handsOn += 1
              break
            case NsContent.EMimeTypes.MP3:
              this.contentStructure.podcast += 1
              break
            case NsContent.EMimeTypes.MP4:
            case NsContent.EMimeTypes.M3U8:
              this.contentStructure.video += 1
              break
            case NsContent.EMimeTypes.INTERACTION:
              this.contentStructure.interactiveVideo += 1
              break
            case NsContent.EMimeTypes.PDF:
              this.contentStructure.pdf += 1
              break
            case NsContent.EMimeTypes.HTML:
              this.contentStructure.webPage += 1
              break
            case NsContent.EMimeTypes.QUIZ:

              this.contentStructure.assessment += 1

              break
            case NsContent.EMimeTypes.WEB_MODULE:
              this.contentStructure.webModule += 1
              break
            case NsContent.EMimeTypes.YOUTUBE:
              this.contentStructure.youtube += 1
              break
            default:
              this.contentStructure.other += 1
              break
          }
        }
      })
    }
    for (const key in this.contentStructure) {
      if (this.contentStructure[key] > 0) {
        this.hasContentStructure = true
      }
    }
  }

  get contextPath() {
    return {
      contextId: this.rootId,
      contextPath: this.rootContentType,
      batchId: this.batchId,
    }
  }

  public progressColor(content: number) {
    // tslint:disable
    if (content <= 30) {
      return '#D13924'
    } else if (content > 30 && content <= 70) {
      return '#E99E38'
    } else {
      return '#1D8923'
    }
    // tslint:enable
  }

  public contentTrackBy(_index: number, content: NsContent.IContent) {
    if (!content) {
      return null
    }
    return content.identifier
  }

  expandView() {
    this.expandChild.emit(true)
  }

  downloadResource(content: any) {
    console.log(content)
    
    let filename;
    filename = content.name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    if (content.mimeType == 'application/pdf') {
      filename = `${content.name}.pdf`;
      this.downloadOtherContent(content.mimeType, filename, content)
    }
    else if (content.mimeType == 'video/mp4') {
      filename = `${filename}.mp4`;
      this.downloadVedio(content.mimeType, filename, content)
    }

  }

  async downloadVedio(type, name, content) {
    this.isDownloading = true;
    const url = content.artifactUrl
    let finalRes:any = null;
    let that = this;
    let myPromise = new Promise(function(resolve) {
      that.viewSvc.downloadContent(url).subscribe(
        (res) =>{
          console.log("File dowloaded successfully video -", res)
         if(res.type == 4){
          finalRes = res;
          resolve(true)
         }
        },(err)=>{
          this.isDownloading = false;
        });
      });
    

    myPromise.then(function () {
      if(finalRes){
        const folderPath = cordova.file.externalRootDirectory
        const downloadDirectory = `${folderPath}Download/`;
        that.writeToFile(downloadDirectory, name, finalRes.body);
      }else{
        this.isDownloading = false;
      }
    });
  }

  downloadOtherContent(type, name, content){
    this.isDownloading = true;
    const url = content.artifactUrl
    this.http.sendRequest(url, { method: "get", responseType: "arraybuffer" }).then(
      httpResponse => {
        let downloadedFile = new Blob([httpResponse.data], { type: type });
        if (downloadedFile){
          const folderPath = cordova.file.externalRootDirectory
          const downloadDirectory = `${folderPath}Download/`;
          this.writeToFile(downloadDirectory, name, downloadedFile);
        } else{
          this.isDownloading = false;
        }
      }
    ).catch(err => {
      this.isDownloading = false;
    })
  }
  writeToFile(downloadDirectory, filename, downloadedFile) {
    this.file.writeFile(downloadDirectory, filename, downloadedFile, { replace: true})
      .then((res) => {
        this.isDownloading = false;
        this.matSnackBar.open(this.translate.instant('DOWNLOADED_SUCCESSFULLY'))
      })
      .catch((err) => {
        this.isDownloading = false;
      });
  }
  handleRefrenceNavigation(link:any,content:any){
    if(link){
      if(content.type ==='pdf'){
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(content.link)}&embedded=true`;
        const browser = this.iab.create(googleDocsUrl, '_blank', {
          location: 'yes',
          toolbar: 'yes',
          enableViewportScale: 'yes',
          zoom: 'yes',
          hidden: 'no'
        });
      }else if (content.type === 'link') {
        const browser: any = this.iab.create(link, '_blank');
        browser.on('loaderror').subscribe(event => {
          console.error('InAppBrowser loaderror:', event);
        });
      }
      else if(content.type ==='video') {
        const videoData = {
          url: content.link,
          disableTelemetry: true,
          contentIdentifier:this.contentId
        };
        let url = `app/reference/`+ `video`
        this.router.navigate([url], { state: { videoData } });
      }
    }
  }
}
