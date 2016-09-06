import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MyAppModule } from './app.module';

enableProdMode();
const platform = platformBrowserDynamic();
platform.bootstrapModule(MyAppModule);