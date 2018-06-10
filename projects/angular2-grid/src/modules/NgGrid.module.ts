import { NgModule } from '@angular/core';
import { NgGrid } from '../directives/NgGrid';
import { NgGridItem } from '../directives/NgGridItem';
import { NgGridPlaceholder } from '../components/NgGridPlaceholder';

@NgModule({
  declarations:     [ NgGrid, NgGridItem, NgGridPlaceholder ],
  entryComponents:  [ NgGridPlaceholder ],
  exports:          [ NgGrid, NgGridItem ]
})
export class NgGridModule {}