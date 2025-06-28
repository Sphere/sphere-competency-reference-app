import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-viwer-observation-questions',
  templateUrl: './viwer-observation-questions.component.html',
  styleUrls: ['./viwer-observation-questions.component.scss'],
})
export class ViwerObservationQuestionsComponent implements OnInit {

  @Input() question: any;
  @Input() questionIndex: any = 0;
  @Input() readOnly?: boolean = false;
  @Output() onValueChage = new EventEmitter();

  public inputValue: any = '';

  constructor() { }

  ngOnInit() {
    if (this.question.responseType === 'multiselect') {
      this.inputValue = this.question.options;
      let selected: any = [];
      if (this.question.value != '' && this.question.value != null && typeof this.question.value == 'object') {
        selected = this.question.value;
      }

      this.inputValue = this.inputValue.map((obj, index) => {
        return { ...obj, checked: (selected.indexOf(obj.value) < 0) ? false : true };
      });
    } else if (this.question.responseType === 'date') {
      let date = new Date(this.question.value);
      if (!isNaN(date.getTime())) {
        this.inputValue = date;
      } else {
        this.inputValue = '';
      }
    } else {
      this.inputValue = this.question.value;
    }
  }

  handleChange(event) {
    let self = this;
    setTimeout(() => {
      self.onValueChage.emit(self.inputValue);
    }, 1000);
  }
}
