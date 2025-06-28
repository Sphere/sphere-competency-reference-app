import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ObservationService } from '../../services/observation.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import { ObservationModalComponent } from '../observation-modal/observation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { IonDatetime } from '@ionic/angular';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import * as _ from 'lodash';

@Component({
  selector: 'app-schedule-observation',
  templateUrl: './schedule-observation.component.html',
  styleUrls: ['./schedule-observation.component.scss'],
})
export class ScheduleObservationComponent implements OnInit {

  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  observationSelected = new UntypedFormControl();
  observationOptions: any[];
  filteredOptions: Observable<any[]>;
  selectedOption: any;
  isMenteelist: boolean = false;
  menteeLists: any;
  isScheduleBtn: boolean = false;
  selectedDateTime;
  private isViewInitialized: boolean = false;
  submitList: any = [];

  // @ViewChild('picker') picker: MatDatepicker<Date>;
  @ViewChild('dateTimePicker') dateTimePicker: IonDatetime;
  enableSchedule: boolean = true

  ngAfterViewInit() {
    this.isViewInitialized = true;
  }
  constructor(
    public userObserSvc: ObservationService,
    private configSvc: ConfigurationsService,
    private dialog: MatDialog
  ) { 
    const currentDateTime = new Date();

    // Format the current date and time
    // this.selectedDateTime = moment().format('YYYY-MM-DDTHH:mm:ss');
  }

  ngOnInit() {

    this.getAllObservationList(this.configSvc.userProfile.userId);
  }


  displayFn(user?: any): string | undefined {
    return user ? user.name : undefined;
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();

    return this.observationOptions.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  getAllObservationList(userId) {
    this.userObserSvc.getObservationListMentor(userId).subscribe((res) => {
      console.log(res.solutionsList);
      let observationList = res.solutionsList;
      this.observationOptions = Object.entries(observationList).map(([id, name]) => ({ id, name }));
      console.log(this.observationOptions); // Check the content of observationOptions here

      // Update the filteredOptions observable
      this.filteredOptions = this.observationSelected.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filter(name) : this.observationOptions.slice())
      );
    });

    // console.log(this.observationOptions)
  }

  // Method to handle option selection
  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedOption = event.option.value;
    console.log('Selected option:', this.selectedOption);
    let param = {
      "menteeMentorDetails": {
        "mentor_id": this.configSvc.userProfile.userId
      },
      "filters": {
        "solution_id": this.selectedOption.id
      }
    }
    this.userObserSvc.getMentorsObservation(param).subscribe((_res) => {
      console.log("mentee list ", _res)
      if (_res.message === "SUCCESS") {
        this.isMenteelist = true;
        let _menteeLists = _res.data;

        this.menteeLists = _menteeLists.map((item) => {
          return {
            menteeId: item.mentee_id,
            mentorId: item.mentor_id,
            menteeName: item.mentee_name,
            solutionId: item.mentoring_observations.map(observation => observation.solution_id).join(', '),
            scheduledOn: item.mentoring_observations.map(observation => observation.scheduled_on).join(', '),
            displayDate: this.getFormatDate(item.mentoring_observations.map(observation => observation.scheduled_on).join(', ')),
            showDateTimePicker: false
          }
        })

        console.log("formated mentee list", this.menteeLists)

        this.isScheduleBtn = false
      }
    })


  }


  addEvent(event: CustomEvent, menteeData: any) {
    console.log(event, menteeData )
    let selectedDate = event;
    let timestamp =selectedDate.detail.value;
    let date = new Date(timestamp);
    let id = menteeData.menteeId

    // Convert to UTC format
    const submitformattedDate = date.toISOString();
    const displyFormat = this.getFormatDate(selectedDate.detail.value)

    console.log(submitformattedDate);
   
    menteeData.scheduledOn = submitformattedDate;

    this.submitList.push(menteeData);

    
    const updatedList = this.menteeLists.map(item => {
      if (item.menteeId.toString() === id) {
        item.displayDate = displyFormat; // Update scheduledOn with formatted date
      }
      return item;
    });

    // Update the original list with the updated list
    this.menteeLists = updatedList;
    this.isScheduleBtn = true

    console.log("mentee list after updated", this.submitList)
    this.enableSchedule = false 

  }

  getFormatDate(data) {

    let formatedDate;
    if(data != ""){
      const date = new Date(data);
    // Extract day, month, and year from the Date object
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // Months are zero-based, so add 1
    const year = date.getFullYear();

    // Extracting hour, minute, and AM/PM
    const hour = date.getHours() % 12 || 12; // Using modulo to get 12-hour format
    const minute = date.getMinutes();
    const period = date.getHours() < 12 ? 'AM' : 'PM'; // Determining if it's AM or PM

    formatedDate = `${day}-${month}-${year} | ${hour}:${minute} ${period}`;
    }else{
      formatedDate = ""
    }
    

    return formatedDate;
  }

  handleScheduleNow() {


    this.submitList.forEach(item => {
      delete item.showDateTimePicker;
      delete item.displayDate;
    });

    console.log("schedule", this.submitList)
    let param = {
      "solutionsList": this.submitList
    }
    this.userObserSvc.secheduleObservation(param).subscribe(
      (_res) => {
        console.log("after update", _res);
        if (_res.message == 'SUCCESS') {
          const dialogRef = this.dialog.open(ObservationModalComponent, {
            width: '100%',
            height: '100%',
            data: {
              type: 'schedule'
            },
            panelClass: 'result-observation'
          });
          dialogRef.afterClosed().subscribe(result => {
            this.clearData();
          })
        }
      }
    )
  }

  clearData() {
    this.menteeLists = []; // Reset the menteeLists array
    this.isScheduleBtn = false; // Reset the isScheduleBtn flag if needed
    this.observationSelected.setValue('');
    this.submitList = [];
    this.enableSchedule = true
  }

  
  // openDateTimePicker(mentee: any, dateTimePicker: any) {
  //   // mentee.showDateTimePicker = true;

  //   setTimeout(() => {
  //     // dateTimePicker.open()
  //     dateTimePicker.present();
  //   }, 50);
  // }


  openDateTimePicker(dateTimePicker: any) {
    dateTimePicker.present();
  }
  
  closeDateTimePicker(dateTimePicker: any) {
    dateTimePicker.dismiss();
  }
  

  openAutocompletePanel() {
    this.autocompleteTrigger.openPanel();
    this.submitList = [];
    this.enableSchedule = true
  }

  getCurrentDateTime(): string {
    // Get the current date and time
    const currentDate = new Date();
    
    // Set the minimum date to the current date and time
    return currentDate.toISOString();
  }






}
