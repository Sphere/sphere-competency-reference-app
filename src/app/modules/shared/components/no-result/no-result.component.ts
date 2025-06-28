import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-no-result',
  templateUrl: './no-result.component.html',
  styleUrls: ['./no-result.component.scss']
})
export class NoResultComponent implements OnInit {


  @Input() data?: any
  /**

   * no result message

  */
  message: string;

  constructor() { }

  ngOnInit() {
    this.setMessage();
  }

  setMessage() {

    this.message = _.get(this.data, 'message') ? _.get(this.data, 'message') : ' No result found'
  }

}
