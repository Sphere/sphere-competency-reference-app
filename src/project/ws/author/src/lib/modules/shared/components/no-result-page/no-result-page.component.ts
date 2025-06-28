import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-no-result-page',
  templateUrl: './no-result-page.component.html',
  styleUrls: ['./no-result-page.component.scss'],
})
export class NoResultPageComponent implements OnInit {

  @Input() data?: any
  @Input() title?: string
  @Input() languagePreferred?: any

  message: string;

  constructor() { }

  ngOnInit() {
    this.setMessage();
  }

  setMessage() {
    this.title = this.title ? this.title : 'NO_RESULT_FOUND'
  }

}
