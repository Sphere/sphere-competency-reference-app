import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-learner-observation-dashboard',
  templateUrl: './learner-observation-dashboard.component.html',
  styleUrls: ['./learner-observation-dashboard.component.scss'],
})
export class LearnerObservationDashboardComponent implements OnInit {
  showbackButton = true
  showLogOutIcon = false
  trigerrNavigation = true
  constructor() { }

  ngOnInit() {}

}
