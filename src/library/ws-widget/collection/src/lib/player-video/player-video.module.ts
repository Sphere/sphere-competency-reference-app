import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlayerVideoComponent } from './player-video.component'
import { BtnFullscreenModule } from '../btn-fullscreen/btn-fullscreen.module'

@NgModule({
    declarations: [PlayerVideoComponent],
    imports: [
        CommonModule,
        BtnFullscreenModule
    ],
    exports: [PlayerVideoComponent]
})
export class PlayerVideoModule { }
