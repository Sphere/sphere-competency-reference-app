import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit, OnChanges {
  @Input() value: number;
  @Input() radius?: number = 30;
  @Output() crossClick = new EventEmitter<any>();
  circumference = 100;
  dashoffset: any;

  constructor() {
    this.progress(0);
  }

  ngOnInit() {
    this.progress(this.value);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value.currentValue !== changes.value.previousValue) {
      this.progress(changes.value.currentValue);
    }
  }

  private progress(value: number) {
    const progress = value / 100;
    this.dashoffset = this.circumference * (progress - 1);
  }
  handleCrossClick(event: any) {
    console.log(event)
    event.stopPropagation(); 
    this.crossClick.emit({'cancel':true});
  }
}