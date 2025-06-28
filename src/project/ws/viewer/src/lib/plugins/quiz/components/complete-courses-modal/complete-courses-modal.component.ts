import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AudioService } from "../../../../../../../../../app/modules/home/services/audio.service";


@Component({
  selector: 'app-complete-courses-modal',
  templateUrl: './complete-courses-modal.component.html',
  styleUrls: ['./complete-courses-modal.component.scss'],
})
export class CompleteCoursesModalComponent implements OnInit,AfterViewInit {

  navigateNextCourse: boolean = true;
  nextLevel: Number = 0;
  constructor(
    public dialogRef: MatDialogRef<CompleteCoursesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
     private audioService: AudioService
  ) { }

  ngOnInit() {
    console.log("CompleteCoursesModalComponent", this.data, typeof this.data.navigateNextCourse)
    this.navigateNextCourse = this.data.navigateNextCourse
    this.nextLevel = Number(this.data.competencyLevel) + 1;

  }

  async ngAfterViewInit() {
    console.log("ngAfterViewInit called in CompleteCoursesModalComponent");
    // Play audio after the view is initialized
    console.log("navigateNextCourse from this.data:", this.data);
    console.log("navigateNextCourse from this.navigateNextCourse:", typeof this.navigateNextCourse);

    await this.playCompletionAudio();
  }
  async playCompletionAudio(): Promise<void> {
    if (!this.audioService.isReady()) {
      console.log("Audio service not ready.");
      return;
    }
    console.log("Audio service ready:", true);
    console.log("Audio initialization status:", this.audioService.getInitializationStatus());
  
    const lang = this.data.currentAshaCardData?.lang;
  
    if (!this.navigateNextCourse) {
      console.log("Inside FALSE block");  // Add this for confirmation
      const audioId = lang === 'en' ? 'competency_success_en' : 'competency_success_hi';
      this.audioService.playAudioById(audioId);
    }else if(this.data?.competencyLevel) {
      console.log("Inside TRUE block");  // Add this too
      this.audioService.playSuccessAudio(lang);
    }
  }
  

  goToAshaHome(){
    this.dialogRef.close({ event: 'CLOSE' })
  }

  startNextCourse(){


    this.dialogRef.close({ 
      event: 'STARTNEXTCOURSE',
      competencyId: this.data.competencyId,
      competencyLevel: this.data.competencyLevel,
      nextLevelId: this.data.nextLevelId



     })
  }

}
