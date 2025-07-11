import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LanguageDialogComponent } from './language-dialog.component'

describe('LanguageDialogComponent', () => {
  let component: LanguageDialogComponent
  let fixture: ComponentFixture<LanguageDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LanguageDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
