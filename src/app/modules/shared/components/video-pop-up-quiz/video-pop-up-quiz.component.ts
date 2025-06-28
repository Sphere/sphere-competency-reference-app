import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ScreenOrientation } from "@awesome-cordova-plugins/screen-orientation/ngx";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

// Constants
const LAYOUT_BREAKPOINT = 768;

// Enums
enum LayoutDirection {
  Column = "columnView",
  Row = "rowView",
}

enum QuizResult {
  Correct = "Correct-answer",
  Wrong = "Wrong-answer",
}

// Interfaces
interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

interface QuizOption {
  text: string;
  isCorrect: boolean;
  answerInfo?: string
}

interface DialogData {
  questions: QuizQuestion[];
}

interface QuizState {
  currentIndex: number;
  showAnswerInfo: boolean;
  showReset: boolean;
  resultMessage: QuizResult | null;
  selectedOption: QuizOption | null;
  layoutDirection: LayoutDirection;
}

@Component({
  selector: "app-video-pop-up-quiz",
  templateUrl: "./video-pop-up-quiz.component.html",
  styleUrls: ["./video-pop-up-quiz.component.scss"],
})
export class VideoPopUpQuizComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly initialState: QuizState = {
    currentIndex: 0,
    showAnswerInfo: false,
    showReset: false,
    resultMessage: null,
    selectedOption: null,
    layoutDirection: LayoutDirection.Column,
  };

  state: QuizState = { ...this.initialState };
  answers: QuizOption[] = [];
  readonly LayoutDirection = LayoutDirection;
  readonly QuizResult = QuizResult;

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: DialogData,
    private readonly dialogRef: MatDialogRef<VideoPopUpQuizComponent>,
    private readonly screenOrientation: ScreenOrientation,
    private readonly snackBar: MatSnackBar
  ) {
    this.initializeAnswers();
  }

  // Getters
  get currentQuestion(): QuizQuestion {
    return this.data.questions[this.state.currentIndex];
  }

  get isFirstQuestion(): boolean {
    return this.state.currentIndex === 0;
  }

  get isLastQuestion(): boolean {
    return this.state.currentIndex === this.data.questions.length - 1;
  }

  get showNextButton(): boolean {
    return !this.isLastQuestion && !this.state.showAnswerInfo;
  }

  get showSubmitButton(): boolean {
    return this.isLastQuestion && !this.state.showAnswerInfo;
  }

  get showContinueButton(): boolean {
    return this.state.showAnswerInfo;
  }

  // Lifecycle hooks
  ngOnInit(): void {
    this.initializeScreenOrientation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Event handlers
  onOptionSelected(option: QuizOption): void {
    this.state.selectedOption = option;
    console.log("here", this.state.selectedOption);
    this.state.resultMessage = option.isCorrect
      ? QuizResult.Correct
      : QuizResult.Wrong;
    this.answers[this.state.currentIndex] = option;
    console.log("Option Selected:", option);
    this.state.selectedOption = option;
    console.log("State Updated:", this.state.selectedOption);
  }

  onNavigate(direction: "next" | "previous"): void {
    this.state.showAnswerInfo = false;
    const increment = direction === "next" ? 1 : -1;

    if (this.canNavigate(direction)) {
      this.state.currentIndex += increment;
      this.state.selectedOption = this.answers[this.state.currentIndex] || null;
    }
  }

  onSubmit(): void {
    if (!this.state.selectedOption) return;

    this.state.showAnswerInfo = true;
    this.state.showReset = this.state.resultMessage === QuizResult.Wrong;
  }

  onReset(): void {
    const currentLayout = this.state.layoutDirection;
    this.state = {
      ...this.initialState,
      layoutDirection: currentLayout,
    };
    this.initializeAnswers();
  }

  onContinue(): void {
    this.closeDialog("submit", { answers: this.answers });
  }

  onSkip(): void {
    this.closeDialog("skip");
  }

  onClose(): void {
    this.closeDialog("close");
  }

  // Private methods
  private initializeAnswers(): void {
    this.answers = Array(this.data.questions.length).fill(null);
  }

  private initializeScreenOrientation(): void {
    this.updateLayout(this.screenOrientation.type);
    this.screenOrientation
      .onChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateLayout(this.screenOrientation.type);
      });
  }

  private updateLayout(orientation: string): void {
    this.state.layoutDirection = orientation.toLowerCase().includes("landscape")
      ? LayoutDirection.Row
      : LayoutDirection.Column;
  }

  private canNavigate(direction: "next" | "previous"): boolean {
    return (
      (direction === "next" && !this.isLastQuestion) ||
      (direction === "previous" && !this.isFirstQuestion)
    );
  }

  private closeDialog(event: string, data?: any): void {
    this.dialogRef.close({ event, ...data });
  }

  // Utils
  trackByFn(index: number, item: QuizOption): string {
    return `${index}-${item.text}`;
  }

  getResultIcon(result: QuizResult): string {
    return result === QuizResult.Correct
      ? "../../../../../assets/icons/charm_tick.png"
      : "../../../../../assets/icons/wrong_red_icon.png";
  }
}
