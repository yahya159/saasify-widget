import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './@core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';
import { SignupModule } from './@shared/signup/signup.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    StoreModule.forRoot({}, {}),
    HttpClientModule,

    // new module
    SignupModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
