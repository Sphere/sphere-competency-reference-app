import { Component, OnInit } from '@angular/core';
import { RouterLinks } from '../../../../../app/app.constant';
import { ObservationService } from '../../services/observation.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { CommonUtilService } from '../../../../../services';
import { error } from 'console';

@Component({
  selector: 'app-observation-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.scss'],
})
export class ObservationListComponent implements OnInit {

  public displayConfig = {
    arrowbtn: true,
    btnNavigation: `${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`,
    activeTab: 'inProgress'
  }
  public selectedTab = "pending"; //inProgress/pending/completed
  public activeIndex: any = 1; // 0/1/2
  public isApiInProgress = true;
  public observationList = [];

  public pendingCount = 0;
  public inProgressCount = 0;
  public completedCount = 0;
  public noResultData: any = {
    'message': 'No result found',
  }

  constructor(
    public userObserSvc: ObservationService,
    private configSvc: ConfigurationsService,
    public commonUtilService: CommonUtilService
  ) { }

  ngOnInit() {
    this.getObservationCount();
    this.getMentorsObservation();
    this.noResultData.message =  this.commonUtilService.translateMessage('NO_RESULT_FOUND');
  }

  getMentorsObservation() {
    let param = {
      "menteeMentorDetails": {
        "mentor_id": this.configSvc.userProfile.userId
      },
      "filters": {
        "otp_verification_status": (this.selectedTab == 'pending') ? '' : 'verified',
        "submission_status": (this.selectedTab == 'completed') ? 'submitted' : ''
      }
    }
    // this.commonUtilService.addLoader();
    this.isApiInProgress = true;
    this.observationList = [];
    this.userObserSvc.getMentorsObservation(param).subscribe((_res) => {
      this.isApiInProgress = false;
      if (_res && _res.data) {
        let _menteeList = _res.data;
        this.observationList = _menteeList.map((_row) => {
          return { ..._row, name: _row.mentee_name, designation: _row.mentee_designation }
        });
      }
    })
  }

  tabClick(event) {
    if (event.index != this.activeIndex) {
      this.activeIndex = event.index;
      switch (this.activeIndex) {
        case 0:
          this.selectedTab = "inProgress"; //inProgress/completed/pending
          break;
        case 1:
          this.selectedTab = "pending"; //inProgress/completed/pending
          break;
        case 2:
          this.selectedTab = "completed"; //inProgress/completed/pending
          break;
        default:
          this.selectedTab = "inProgress"; //inProgress/completed/pending
          this.activeIndex = 0;
          break;
      }
      this.displayConfig.activeTab = this.selectedTab;
      this.getMentorsObservation();
    }
  }

  getObservationCount() {
    let param = {
      mentorId: this.configSvc.userProfile.userId
    }
    this.userObserSvc.getMentorObservationCount(param).subscribe((_res) => {
      this.isApiInProgress = false;
      if (_res && _res.data) {
        let _observationCounts = _res.data;
        this.pendingCount = _observationCounts.pending;
        this.inProgressCount = _observationCounts.inProgress;
        this.completedCount = _observationCounts.completed;
      }
    }, (error) => {

    })
  }

}
