import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgGrid, NgGridItem, NgGridItemConfig, NgGridItemEvent, NgGridPlaceholder } from '../main';

@NgModule({
  imports:          [ CommonModule, FormsModule ],
  declarations:     [ NgGrid, NgGridItem, NgGridPlaceholder ],
  entryComponents:  [ NgGridPlaceholder ],
  exports:          [ NgGrid, NgGridItem ]
})
export class NgGridModule {}