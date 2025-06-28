import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../../../../../app/modules/observation/services/observation.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { Environment, ImpressionType, PageId, TelemetryGeneratorService } from '../../../../../services';

@Component({
  selector: 'app-learner-observation-schedule',
  templateUrl: './learner-observation-schedule.component.html',
  styleUrls: ['./learner-observation-schedule.component.scss'],
})
export class LearnerObservationScheduleComponent implements OnInit {
  ScheduleList: any[] = [];
  public noResultData: any = {
    'message': 'No result found',
  }
  constructor(public userObserSvc: ObservationService,
    private configSvc: ConfigurationsService,
    private telemetryGeneratorService: TelemetryGeneratorService) {}

  ngOnInit() {
    this.getSechdules();
  }
  public isAPIInprogress = true;

  getSechdules() {
    this.isAPIInprogress = true;
    const userId =this.configSvc.userProfile.userId;
    this.generateImpressionEvent();
    this.userObserSvc.getAllMenteSechedules(userId).subscribe((res) => {
      console.log("all schedules", res);
      const sameDayData = res.flatMap(user => user.sameDay || []);
      const overdueData = res.flatMap(user => user.overdue || []);
      this.ScheduleList = this.mapToScheduleList(sameDayData);
      console.log("only today", this.ScheduleList);
      const overdueScheduleList = this.mapToScheduleList(overdueData);
      console.log("overdue schedules", overdueScheduleList);
      setTimeout(() => {
        this.isAPIInprogress = false;
      }, 2000);
    });
  }

  private mapToScheduleList(data: any[]): any[] {
    return data.map(day => ({
      mentoring_relationship_id: day.mentoring_relationship_id,
      mentor_id: day.mentor_id,
      mentee_id: day.mentee_id,
      mentee_name: day.mentee_name,
      mentee_contact_info: day.mentee_contact_info,
      solution_id: day.mentoring_observations?.[0]?.solution_id || null,
      solution_name: day.mentoring_observations?.[0]?.observationData.solution_name || null,
      scheduled_on: this.getFormatDate( day.mentoring_observations?.[0]?.scheduled_on) || null,
      name: day.mentee_name,
      designation: day.mentoring_observations?.[0]?.observationData.solution_name || null,
      competency_data: day.mentoring_observations?.[0]?.observationData.competency_data || null,
    }));
  }


  getFormatDate(data) {

    const date = new Date(data);
    // Extract day, month, and year from the Date object
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Months are zero-based, so add 1
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  generateImpressionEvent() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      'observation',
      PageId.OBSERVATION,
      Environment.USER
    )
  }
}
