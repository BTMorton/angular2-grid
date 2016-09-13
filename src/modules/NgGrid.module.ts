import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgGrid, NgGridItem, NgGridItemConfig, NgGridItemEvent, NgGridPlaceholder } from '../main';

@NgModule({
  imports:          [ BrowserModule, CommonModule ],
  declarations:     [ NgGrid, NgGridItem, NgGridPlaceholder ],
  entryComponents:  [ NgGridPlaceholder ],
  exports:          [ NgGrid, NgGridItem ]
})
export class NgGridModule {}