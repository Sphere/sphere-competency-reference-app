import { SortByPipe } from './sortby/sortby.pipe';
import { NgModule } from '@angular/core';
import { FileSizePipe } from './file-size/file-size';
import { CommonModule, DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    FileSizePipe,
    SortByPipe
  ],
  imports: [CommonModule],
  exports: [FileSizePipe,
    SortByPipe,
  ],
  providers: [DatePipe]
})
export class PipesModule {
}
