import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLinks } from '../../../../../app/app.constant';
import { ObservationService } from '../../services/observation.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { CommonUtilService } from '../../../../../services';

@Component({
  selector: 'app-mentees-list',
  templateUrl: './mentees-list.component.html',
  styleUrls: ['./mentees-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class MenteesListComponent implements OnInit {
  @Input() showBackMentee? = true;
  public serchText = '';
  public displayConfigObservation = {
    arrowbtn: true,
    btnNavigation: `${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`,
    activeTab: 'observation'
  }
  public displayConfigMentee = {
    arrowbtn: true,
    btnNavigation: `${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`,
    activeTab: 'mentee'
  }

  public noResultData: any = {
    'message': 'No result found',
  }
  public mentieeList = []
  public menteeCount = 0;
  public observationList = []
  public observationCount = 0;

  public pendingCount = 0;
  public inProgressCount = 0;
  public completedCount = 0;

  constructor(
    public userObserSvc: ObservationService,
    private configSvc: ConfigurationsService,
    public commonUtilService: CommonUtilService
  ) { }

  ngOnInit() {
    this.getAllMentee(this.configSvc.userProfile.userId);
    this.getMentorsObservation();
    this.getObservationCount();
    this.noResultData.message =  this.commonUtilService.translateMessage('NO_RESULT_FOUND');
  }

  getAllMentee(uid) {
    this.commonUtilService.addLoader();
    this.userObserSvc.getAllMenteeForMentor(uid).subscribe((_res) => {
      let _menteeList = _res.data;
      this.mentieeList = _menteeList.map((_row) => {
        return { ..._row, name: _row.mentee_name, designation: _row.mentee_designation }
      });
      this.menteeCount = this.mentieeList.length;
    })
  }

  getMentorsObservation() {
    this.commonUtilService.addLoader();
    // let param = {
    //   "menteeMentorDetails": {
    //     "mentor_id": this.configSvc.userProfile.userId
    //   }
    // }
    this.userObserSvc.getObservationListMentor(this.configSvc.userProfile.userId).subscribe((_res) => {
      console.log(_res.solutionsList);
      
        let _observationList = _res.solutionsList;
        this.observationList = Object.entries(_observationList).map(([id, name]) => ({ id, name, mentor_id: this.configSvc.userProfile.userId }));
        console.log(this.observationList);
        this.observationCount = this.observationList.length;
      
    })
  }
  
  getObservationCount() {
    let param = {
      mentorId: this.configSvc.userProfile.userId
    }
    this.userObserSvc.getMentorObservationCount(param).subscribe((_res) => {
      if (_res && _res.data) {
        let _observationCounts = _res.data;
        this.pendingCount = _observationCounts.pending;
        this.inProgressCount = _observationCounts.inProgress;
        this.completedCount = _observationCounts.completed;
      }
    }, (error) => {

    })
  }


  onSearchChange($event){
    let search = this.serchText.trim();
    if(search){
      const result = this.mentieeList.filter(element => element.name.toLowerCase().indexOf(search.trim().toLowerCase()) !== -1);
      this.menteeCount = result.length;
    }else{
      this.menteeCount = this.mentieeList.length;
    }
  }
}