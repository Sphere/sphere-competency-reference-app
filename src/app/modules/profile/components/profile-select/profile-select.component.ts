import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import {MatSnackBar} from '@angular/material/snack-bar'
import { IMAGE_MAX_SIZE, IMAGE_SUPPORT_TYPES } from '@ws/author/src/lib/constants/upload'
import { LoaderService } from '@ws/author'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { constructReq } from '../request-util';
// import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { ImageCropComponent } from '../../../../../library/ws-widget/utils/src/lib/components/image-crop/image-crop.component'


@Component({
  selector: 'ws-profile-select',
  templateUrl: './profile-select.component.html',
  styleUrls: ['./profile-select.component.scss'],
})
export class ProfileSelectComponent implements OnInit {
  imageTypes = IMAGE_SUPPORT_TYPES
  photoUrl!: string | ArrayBuffer | null
  createUserForm: UntypedFormGroup
  userProfileData!: any
  userID: any
  userImg: any = '';
  base64Img = '';
  // cameraOptions: CameraOptions = {
  //   quality: 100,
  //   destinationType: this.camera.DestinationType.DATA_URL,
  //   encodingType: this.camera.EncodingType.JPEG,
  //   mediaType: this.camera.MediaType.PICTURE,
  //   allowEdit: true
  // }

  // gelleryOptions: CameraOptions = {
  //   quality: 100,
  //   sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  //   destinationType: this.camera.DestinationType.DATA_URL,
  //   allowEdit: true
  // }


  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>

  imgJson = [
    { url: '../../../../../assets/imgs/Group 205.png' },
    { url: '../../../../../assets/imgs/Group 206.png' },
    { url: '../../../../../assets/imgs/Group 211.png' },
    { url: '../../../../../assets/imgs/Group 212.png' },
    { url: '../../../../../assets/imgs/Group 213.png' },
  ]

  constructor(public dialogRef: MatDialogRef<ProfileSelectComponent>,
    private snackBar: MatSnackBar,
    private userProfileSvc: UserProfileService,
    private configSvc: ConfigurationsService,
    private dialog: MatDialog,
    private loader: LoaderService,
    // private camera: Camera
  ) {
    this.createUserForm = new UntypedFormGroup({
      photo: new UntypedFormControl('', []),
    })
  }

  ngOnInit() {
    this.getUserDetails()
  }

  closeDialog() {
    this.dialogRef.close()
  }

  openCamera() {
    // this.camera.getPicture(this.cameraOptions).then((imgData) => {
    //   console.log('image data =>  ', imgData);
    //   this.base64Img = 'data:image/jpeg;base64,' + imgData;
    //   this.userImg = this.base64Img;
    // }, (err) => {
    //   console.log(err);
    // })
  }

  openGallery() {
    const formdata = new FormData()
    // this.camera.getPicture(this.gelleryOptions).then(async (imgData) => {
    //   console.log('image data =>  ', imgData);
    //   this.base64Img = 'data:image/jpeg;base64,' + imgData;
    //   const base64Response = await fetch(`data:image/jpeg;base64,${imgData}`);
    //   const blobimg = await base64Response.blob();
    //   this.userImg = blobimg;


    //   const dialogRef = this.dialog.open(ImageCropComponent, {
    //     width: '70%',
    //     data: {
    //       isRoundCrop: true,
    //       imageFile: this.userImg,
    //       width: 265,
    //       height: 150,
    //       isThumbnail: true,
    //       imageFileName: "nnn",
    //     },
    //   })

    //   dialogRef.afterClosed().subscribe({
    //     next: async (result: any) => {
    //       if (result) {
    //         // Convert the object to a Blob     
    //         const blob = new Blob([JSON.stringify(result)], { type: 'image/jpeg' });
    //         // Create a new File instance      
    //         const file = new File([blob], 'data.json', { type: 'application/json' });

    //         formdata.append('content', blob, "nnn");
    //         console.log(typeof (result))
    //         // formdata.append('content', result, "nnn")
    //         this.loader.changeLoad.next(true)
    //         const reader = new FileReader()
    //         reader.readAsDataURL(blob)
    //         reader.onload = _event => {
    //           this.photoUrl = reader.result
    //           this.createUserForm.controls['photo'].setValue(this.photoUrl)
    //           this.onSubmit(this.createUserForm)
    //         }
    //       }
    //     },
    //   })

    // }, (err) => {
    //   console.log(err);
    // })



  }

  uploadProfileImg(file: File) {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (
      !(
        IMAGE_SUPPORT_TYPES.indexOf(
          `.${fileName
            .toLowerCase()
            .split('.')
            .pop()}`,
        ) > -1
      )
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.size > IMAGE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    const dialogRef = this.dialog.open(ImageCropComponent, {
      width: '70%',
      data: {
        isRoundCrop: true,
        imageFile: file,
        width: 265,
        height: 150,
        isThumbnail: true,
        imageFileName: fileName,
      },
    })

    dialogRef.afterClosed().subscribe({
      next: (result: File) => {
        if (result) {
          formdata.append('content', result, fileName)
          this.loader.changeLoad.next(true)
          const reader = new FileReader()
          reader.readAsDataURL(result)
          reader.onload = _event => {
            this.photoUrl = reader.result
            this.createUserForm.controls['photo'].setValue(this.photoUrl)
            this.onSubmit(this.createUserForm)
          }
        }
      },
    })
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
          }
        })
    }
  }

  selectProfile(img: any) {
    this.createUserForm.controls['photo'].setValue(img)
    this.onSubmit(this.createUserForm)
  }

  onSubmit(form: any) {
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const profileRequest = constructReq(form.value, this.userProfileData)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: profileRequest,
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          this.userProfileSvc._updateuser.next('true')
          this.dialogRef.close()
        }
      })
  }
}
