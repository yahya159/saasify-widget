import { NgModule } from '@angular/core';
import { SignupComponent } from './components/signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@NgModule({
  declarations: [SignupComponent],
  providers: [],
  imports: [ReactiveFormsModule, CommonModule],
  exports: [SignupComponent],
})
export class SignupModule { }
