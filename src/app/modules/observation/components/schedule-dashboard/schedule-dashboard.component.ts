import { Component, Input, OnInit } from '@angular/core';
import { ObservationService } from '../../services/observation.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { RouterLinks } from '../../../../../app/app.constant';

@Component({
  selector: 'app-schedule-dashboard',
  templateUrl: './schedule-dashboard.component.html',
  styleUrls: ['./schedule-dashboard.component.scss'],
})
export class ScheduleDashboardComponent implements OnInit {

  @Input() firstName?: any;
  public displayConfigStart = {
    button: true,
    buttonName: "START NOW"
  }
  public displayConfigoverdue = {
    button: true,
    buttonName: "START NOW",
    sechdule: true
  }
  public displayConfigupComing = {
    arrowbtn: true,
    btnNavigation: `${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`,
    sechdule: true,
    activeTab: 'mentee'
  }
  showAllSchedules: boolean = false;
  presentScheduleList: any = []
  overdueScheduleList: any = []
  upComingScheduleList: any = []


  constructor(
    public userObserSvc: ObservationService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.getSechdules(this.configSvc.userProfile.userId)
  }

  getSechdules(userId) {
    this.userObserSvc.getAllSechedules(userId).subscribe((res) => {
      console.log("all schedules", res)
      const sameDayData = res.map(user => user.sameDay || []).flat();
      const overdueData = res.map(user => user.overdue || []).flat();
      const upcoming = res.map(user => user.upcoming || []).flat();
      console.log("Same Day Data:", sameDayData);
      console.log("Overdue Data:", overdueData);

      this.presentScheduleList = this.getFormatedData(sameDayData);
      this.overdueScheduleList = this.getFormatedData(overdueData);
      this.upComingScheduleList = this.getFormatedData(upcoming);
    })
  }

  toggleShowAllSchedules() {
    this.showAllSchedules = !this.showAllSchedules;
  }

  getFormatedData(data){
    const formatData = data.map(({ mentoring_relationship_id, mentor_id, mentee_id, mentee_name, mentee_contact_info, mentoring_observations }) => {
      return mentoring_observations.map(({ solution_id, solution_name, scheduled_on, observationData, attempted_count }) => ({
        mentoring_relationship_id,
        mentor_id,
        mentee_id,
        mentee_name,
        mentee_contact_info,
        solution_id,
        solution_name: observationData.solution_name,
        scheduled_on: this.getFormatDate(scheduled_on),
        name: mentee_name ,
        designation: observationData.solution_name,
        competency_data: observationData.competency_data,
        duration: observationData.duration,
        attempted_count
      }));
    }).flat();
    
    return formatData
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
