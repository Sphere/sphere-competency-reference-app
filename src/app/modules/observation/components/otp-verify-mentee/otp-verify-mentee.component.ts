import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ObservationService } from '../../services/observation.service';
import { RouterLinks } from '../../../../../app/app.constant';
import { CommonUtilService, Environment, ErrorCode, ErrorType, PageId, TelemetryGeneratorService } from '../../../../../services';

@Component({
  selector: 'app-otp-verify-mentee',
  templateUrl: './otp-verify-mentee.component.html',
  styleUrls: ['./otp-verify-mentee.component.scss'],
})
export class OtpVerifyMenteeComponent implements OnInit {
  isOtpCodeVerifed: boolean = false;
  verifyOtpForm: UntypedFormGroup;
  observationData: any;
  sendOtpInProgress = false;
  resendOtpInProgress = false;
  resendTimer = 600;
  resendTimerText = '10:00';
  interval: any = null;


  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    public userObserSvc: ObservationService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService
  ) {
    const currentNavigation = this.router.getCurrentNavigation();
    console.log("current navigation", currentNavigation )
    if (currentNavigation && currentNavigation.extras && currentNavigation.extras.state?.observationData) {
      this.observationData = currentNavigation.extras.state?.observationData;
      if (this.observationData) {
        this.sendOtp();
      }
    } else {
      this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.MENTEES_LIST}`]);
    }
    this.verifyOtpForm = this.fb.group({
      otp: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (!this.observationData) {
      this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.MENTEES_LIST}`]);
    }
  }

  sendOtp() {
    this.sendOtpInProgress = true;
    this.userObserSvc.sendOtp(this.observationData.mentee_id).subscribe((_res) => {
      this.sendOtpInProgress = false;
      this.generateInteractTelemetry('otp-send');
      this.startTimer();
    }, (error) => {
      this.generateErrorTelemetry(error);
    });
  }

  resendOtp() {
    this.resendOtpInProgress = true;
    this.userObserSvc.resendOtp(this.observationData.mentee_id).subscribe((_res) => {
      this.resendOtpInProgress = false;
      this.generateInteractTelemetry('otp-resend');
      this.startTimer();
    });
  }

  startTimer() {
    let self = this;
    this.interval = setInterval(() => {
      self.resendTimer--;
      if (self.resendTimer == 0) {
        clearInterval(self.interval);
        self.interval = null;
      }
      let minutes: any = Math.floor(self.resendTimer / 60);
      minutes = minutes.toString().padStart(2, '0');
      let seconds: any = self.resendTimer % 60;
      seconds = seconds.toString().padStart(2, '0');
      self.resendTimerText = minutes + ':' + seconds;
    }, 1000)
  }

  submitOtp() {
    if (this.verifyOtpForm.valid) {
      // Form is valid, do something with the form data
      this.sendOtpInProgress = true;
      this.generateInteractTelemetry('otp-submitted');
      this.verifyOtp(this.verifyOtpForm.value.otp);
    }
  }

  verifyOtp(otp) {
    let param = {
      mentor_id: this.observationData.mentor_id,
      mentee_id: this.observationData.mentee_id,
      otp: otp,
      solution_id: this.observationData.solution_id
    }
    console.log("verify", param)
    this.userObserSvc.observationOtpVerification(param).subscribe(
      (_res) => {
        // {message: 'Update successful', observation_id: '6583009795ce3d0008b8b827'}
        if (_res && _res.observation_id) {
          this.observationData.observation_id = _res.observation_id;
          this.addEntityToObservation();
          this.isOtpCodeVerifed = true;
        }
        this.commonUtilService.showToast(_res?.message || 'OTP verified successfully');
        this.sendOtpInProgress = false;
      },
      (error) => {
        this.sendOtpInProgress = false;
        this.generateErrorTelemetry(error);
        this.commonUtilService.showToast(error?.error || error?.message || "Something went wrong");
      }
    );
  }

  startObservation() {
    const navigationExtras: NavigationExtras = {
      state: {
        observationData: { ...this.observationData },
        canSubmit: true
      }
    };
    this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.OBSERVATION_ASSESSMENT}`], navigationExtras);
  }

  addEntityToObservation() {
    let param = {
      observation_id: this.observationData.observation_id,
      mentee_id: this.observationData.mentee_id
    }
    this.userObserSvc.addEntityToObservation(param).subscribe(() => { });
  }

  generateErrorTelemetry(error) {
    this.telemetryGeneratorService.generateErrorTelemetry(
      Environment.HOME,
      ErrorCode.ERR_USER_LOGIN,
      ErrorType.SYSTEM,
      PageId.LOGIN,
      JSON.stringify(error)
    );
  }

  generateInteractTelemetry(action) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      action,
      '',
      Environment.HOME,
      PageId.LOGIN
    );
  }

}
