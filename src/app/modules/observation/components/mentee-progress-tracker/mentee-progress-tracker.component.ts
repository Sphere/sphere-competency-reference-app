import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '../../../../../app/app.constant';
import { LocalStorageService } from '../../../../../app/manage-learn/core';
import { ObservationService } from '../../services/observation.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { CommonUtilService } from '../../../../../services';

@Component({
  selector: 'app-mentee-progress-tracker',
  templateUrl: './mentee-progress-tracker.component.html',
  styleUrls: ['./mentee-progress-tracker.component.scss'],
})
export class MenteeProgressTrackerComponent implements OnInit {
  public prevUrl = `${RouterLinks.MENTOR}/${RouterLinks.MENTEES_LIST}`
  public menteeData: any = {};
  public noResultData: any = {
    'message': 'No result found',
  }
  public selectedTab = 'inProgress';
  public activeTabIndex: any = '1';
  public displayConfigStart = {
    button: true,
    buttonName: "start"
  }
  public displayConfigProgress = {
    button: true,
    buttonName: "resume"
  }
  public displayConfigCompleted = {
    button: true,
    buttonName: "view"
  }
  public displayConfigMentee = {
    link: true,
    linkNavigation: `${RouterLinks.MENTOR}/${RouterLinks.VIEW_ATTEMPS}`,
  }
  public pendingObservationList: any = []
  public inProgressObservationList: any = []
  public completedObservationList: any = []
  public attemptedMenteeList: any = []
  public observationData:any = []
  mentorId: any;
  menteeId: any;
  displyData: {};

  constructor(
    private router: Router,
    public localStorage: LocalStorageService,
    public userObserSvc: ObservationService,
    private configSvc: ConfigurationsService,
    private commonUtilService: CommonUtilService,
  ) {
    const currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation && currentNavigation.extras) {
      if (currentNavigation.extras.state?.activeTab) {
        // this.mentorId = currentNavigation.extras.state?.cardData.mentor_id
        // this.menteeId = currentNavigation.extras.state?.mentee_id
        // this.localStorage.setLocalStorage('lastVisitedMenteeID', currentNavigation.extras.state?.mentee_id);
       
        // this.localStorage.setLocalStorage('mentorId', currentNavigation.extras.state?.cardData.mentor_id);
        if (currentNavigation.extras.state?.activeTab == 'mentee' ) {
          this.localStorage.setLocalStorage('lastVisitedDetails', {  mentorId: currentNavigation.extras.state?.cardData.mentor_id, menteeId: currentNavigation.extras.state?.mentee_id, });
          this.getObservationForMentee(currentNavigation.extras.state?.mentee_id);
          this.getAttempsOfMentee(currentNavigation.extras.state?.cardData.mentor_id, currentNavigation.extras.state?.mentee_id);
        }

        if(currentNavigation.extras.state?.activeTab == 'observation'){
          this.localStorage.setLocalStorage('lastVisitedDetails', {  mentorId: currentNavigation.extras.state?.cardData.mentor_id, solutionId: currentNavigation.extras.state?.cardData.id, name:currentNavigation.extras.state?.cardData.name  });
          // this.getObservationForMentee(currentNavigation.extras.state?.mentee_id);
          this.getAttempsOfObservation(currentNavigation.extras.state?.cardData.mentor_id, currentNavigation.extras.state?.cardData.id);
          this.observationData = {name:currentNavigation.extras.state?.cardData.name }
        }

      } else {
        this.fetchLastMenteeId();
      }
      // if (currentNavigation.extras.state?.activeTab) {
      //   this.selectedTab = currentNavigation.extras.state?.activeTab;
      //   switch (this.selectedTab) {
      //     case 'pending':
      //       this.activeTabIndex = "1";
      //       break;
      //     case 'completed':
      //       this.activeTabIndex = "2";
      //       break;
      //     case 'mentee':
      //       this.getAttempsOfMentee(currentNavigation.extras.state?.cardData.mentor_id, currentNavigation.extras.state?.mentee_id);
      //       break;
      //     default:
      //       this.activeTabIndex = "0";
      //       break;
      //   }
      // } else {
      //   this.selectedTab = 'pending';
      //   this.activeTabIndex = '1';
      // }
    } else {
      this.fetchLastMenteeId();
    }
  }

  fetchLastMenteeId() {
    this.localStorage.getLocalStorage(`lastVisitedDetails`).then(
      (lastVisitedDetails) => {
        if(lastVisitedDetails.menteeId){
          this.getObservationForMentee(lastVisitedDetails.menteeId);
          this.getAttempsOfMentee(lastVisitedDetails.mentorId, lastVisitedDetails.menteeId);
        }
        if(lastVisitedDetails.solutionId){
          // this.getObservationForMentee(lastVisitedDetails.menteeId);
          this.getAttempsOfObservation(lastVisitedDetails.mentorId,lastVisitedDetails.solutionId);
          this.observationData = lastVisitedDetails.name
        }
      },
      (error) => {
        this.router.navigate([this.prevUrl]);
      }
    )
  }

  getObservationForMentee(menteeID) {
    this.commonUtilService.addLoader();
    this.userObserSvc.getAllObservationForMentee(menteeID).subscribe(
      (_res) => {
        if (_res.data) {
          let menteeData = _res.data.find(_row => _row.mentor_id == this.configSvc.userProfile.userId);
          if (menteeData != undefined) {
            this.menteeData = menteeData;

            this.filterObservations();
            // this.getMenteeAttemps(menteeID);
          } else {
            this.router.navigate([this.prevUrl]);
          }
        } else {
          this.router.navigate([this.prevUrl]);
        }
      },
      (error) => {
        this.router.navigate([this.prevUrl]);
      }
    )
  }

  ngOnInit(): void {
    console.log("menteeData", this.menteeData)
    this.noResultData.message = this.commonUtilService.translateMessage('NO_RESULT_FOUND');
  }

  filterObservations() {
    this.pendingObservationList = [];
    this.inProgressObservationList = [];
    // this.completedObservationList = [];
    if (this.menteeData && this.menteeData.mentoring_observations) {
      this.menteeData.mentoring_observations.map((_menteeObserv) => {
        _menteeObserv.info = {
          mentoring_relationship_id: this.menteeData.mentoring_relationship_id,
          mentor_id: this.menteeData.mentor_id,
          mentor_name: this.menteeData.mentor_name,
          mentee_id: this.menteeData.mentee_id,
          mentee_name: this.menteeData.mentee_name,
          mentee_contact_info: this.menteeData.mentee_contact_info,
          mentee_designation: this.menteeData.mentee_designation,
        };
        const keys = _menteeObserv.observationData.competency_data.map(obj => Object.keys(obj));
        const competencyText = keys.join(', ');
        let _observation = { ..._menteeObserv, name: _menteeObserv.observationData.solution_name, designation: competencyText }

        if (_menteeObserv.otp_verification_status == null || _menteeObserv.otp_verification_status === '') {
          this.pendingObservationList.push({ ..._observation });
        }
        if (_menteeObserv.otp_verification_status == 'verified' && _menteeObserv.submission_status === '') {
          this.inProgressObservationList.push({ ..._observation });
        }

        this.displyData = {
          name: this.menteeData.mentee_name,
          mentee_contact_info: this.menteeData.mentee_contact_info
        }
        // if (_menteeObserv.otp_verification_status == 'verified' && _menteeObserv.submission_status !== '') {
        //   this.completedObservationList.push({ ..._observation });
        // }
      })
    }
  }

  navigateToMenteeList() {
    this.router.navigate([this.prevUrl]);
  }

  getMenteeAttemps(menteeID) {
    this.completedObservationList = [];
    let param = {
      mentor_id: this.configSvc.userProfile.userId,
      mentee_id: menteeID
    }
    this.userObserSvc.getMenteeAttemps(param).subscribe(
      (_res) => {
        if (_res && this.menteeData) {
          _res.map((_menteeObserv) => {
            _menteeObserv.info = {
              mentoring_relationship_id: this.menteeData.mentoring_relationship_id,
              mentor_id: this.menteeData.mentor_id,
              mentor_name: this.menteeData.mentor_name,
              mentee_id: this.menteeData.mentee_id,
              mentee_name: this.menteeData.mentee_name,
              mentee_contact_info: this.menteeData.mentee_contact_info,
              mentee_designation: this.menteeData.mentee_designation,
            };
            const keys = _menteeObserv.observationAttemptsMetaData.competency_data.map(obj => Object.keys(obj));
            const competencyText = keys.join(', ');
            let _observation = { ..._menteeObserv, name: _menteeObserv.observationAttemptsMetaData.solution_name, designation: competencyText }
            this.completedObservationList.push({ ..._observation });
          })
        } else {
          this.completedObservationList = [];
        }
      },
      (error) => {
        this.completedObservationList = [];
      }
    )
  }


  getAttempsOfMentee(mentorId, menteeId) {
    this.userObserSvc.getAttempsOfMentee(mentorId, menteeId).subscribe(
      (res) => {
        // Iterate through each solution
        for (const [solutionId, solutionData] of Object.entries(res.result as Record<string, any>)) {
          const attempts = solutionData.attempts || [];
          const formattedAttempts = attempts.map((attempt, index) => ({
            mentoring_relationship_id: attempt.mentoring_relationship_id,
            mentor_id: attempt.mentor_id,
            mentee_id: attempt.mentee_id,
            createdat: attempt.createdAt,
            createdAt: this.getFormatDate(attempt.createdAt),
            attempt_serial_number: attempt.attempt_serial_number,
            result_percentage: attempt.result_percentage,
            user_submission: attempt.user_submission,
            acquired_score: attempt.acquired_score,
            observationAttemptsMetaData: attempt.observationAttemptsMetaData,
            solution_id: attempt.solution_id,
            submission_id: attempt.submission_id,
            solution_name: attempt.observationAttemptsMetaData.solution_name || solutionData.solution_name,
            total_score: attempt.total_score,
            name: attempt.observationAttemptsMetaData.solution_name || solutionData.solution_name,
            attemptName: `Attempt ${index + 1}`,
            observation_id: attempt.observation_id,
            attempted_count: index + 1
          }));

          const lastAttempt = formattedAttempts[formattedAttempts.length - 1];
          const totalAttemps = formattedAttempts.length
          this.attemptedMenteeList.push({
            solutionId,
            mentee_name: solutionData.mentorMenteeInfo.mentee_name,
            mentee_contact_info: solutionData.mentorMenteeInfo.mentee_contact_info,
            solution_name: solutionData.solution_name,
            name: solutionData.solution_name,
            attemptList: formattedAttempts,
            attempt_serial_number: totalAttemps,
            lastCreatedAt: lastAttempt ? this.getFormatDate(lastAttempt.createdat) : 0,
            result_percentage: lastAttempt ? lastAttempt.result_percentage : 0,
            mentee_id: solutionData.attempts[0].mentee_id
          });

        }

        console.log("this.list", this.attemptedMenteeList)

      }

    )



  }

  getAttempsOfObservation(mentorId, solutionId) {
    this.userObserSvc.getAttempsOfObservations(mentorId, solutionId).subscribe(
      (res) => {
        // Iterate through each solution
        for (const [menteeId, menteeData] of Object.entries(res.result as Record<string, any>)) {
          const attempts = menteeData.attempts || [];
          const formattedAttempts = attempts.map((attempt, index) => ({
            mentoring_relationship_id: attempt.mentoring_relationship_id,
            mentor_id: attempt.mentor_id,
            mentee_id: attempt.mentee_id,
            createdat: attempt.createdAt,
            createdAt: this.getFormatDate(attempt.createdAt),
            attempt_serial_number: attempt.attempt_serial_number,
            result_percentage: attempt.result_percentage,
            user_submission: attempt.user_submission,
            acquired_score: attempt.acquired_score,
            observationAttemptsMetaData: attempt.observationAttemptsMetaData,
            solution_id: attempt.solution_id,
            submission_id: attempt.submission_id,
            solution_name: attempt.observationAttemptsMetaData.solution_name || menteeData.solution_name,
            total_score: attempt.total_score,
            name: attempt.observationAttemptsMetaData.solution_name || menteeData.solution_name,
            attemptName: `Attempt ${index + 1}`,
            observation_id: attempt.observation_id,
            attempted_count: index + 1
          }));

          const lastAttempt = formattedAttempts[formattedAttempts.length - 1];
          const totalAttemps = formattedAttempts.length
          this.attemptedMenteeList.push({
            menteeId,
            mentee_name: menteeData.mentorMenteeInfo.mentee_name,
            mentee_contact_info: menteeData.mentorMenteeInfo.mentee_contact_info,
            solution_name: menteeData.solution_name,
            name: menteeData.mentorMenteeInfo.mentee_name,
            attemptList: formattedAttempts,
            attempt_serial_number: totalAttemps,
            lastCreatedAt: lastAttempt ? this.getFormatDate(lastAttempt.createdat) : 0,
            result_percentage: lastAttempt ? lastAttempt.result_percentage : 0,
            mentee_id: menteeData.attempts[0].mentee_id
          });

          this.displyData={
            name:  menteeData.solution_name, 
          }
        }

        console.log("this.list", this.attemptedMenteeList)

        this.displyData ={...this.displyData, menteeCount: this.attemptedMenteeList.length}
      }

    )
  }


  getFormatDate(data) {

    const date = new Date(data);
    // Extract day, month, and year from the Date object
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Months are zero-based, so add 1
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }


} 
