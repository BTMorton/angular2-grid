// Standard module imports
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

// Application component
import { NgGridModule } from './modules/NgGrid.module';
import { MyAppComponent }  from './app.component';

@NgModule({
  imports: [ BrowserModule, FormsModule, NgGridModule ],
  declarations: [ MyAppComponent ],
  providers: [],
  bootstrap: [ MyAppComponent ]
})
export class MyAppModule { }