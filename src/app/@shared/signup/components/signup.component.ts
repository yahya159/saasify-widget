import { Component, ElementRef, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignupService } from 'src/app/@api/services/signup/signup.service';
import { UserSignUPDTO } from '../dto/user-signup.dto';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class SignupComponent implements OnInit {
  myForm!: FormGroup;
  invalidFields: Record<string, boolean> = {};
  
  private signupService = inject(SignupService);
  private el = inject(ElementRef);

  ngOnInit() {
    this.myForm = new FormGroup({
      username: new FormControl(null, [
        Validators.required,
        // alphabets regex
        Validators.pattern('^[a-zA-Z\\s\'-]+$')
      ]),
      firstname: new FormControl(null, [
        Validators.required,
        // alphabets regex
        Validators.pattern('^[a-zA-Z\\s\'-]+$')
      ]),
      lastname: new FormControl(null, [
        Validators.required,
      ]),
      email: new FormControl(null, [
        Validators.required,
        Validators.email
      ]),
      phone: new FormControl(null, [
        Validators.required,
        // phone regex
        Validators.pattern('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$')
      ]),
      streetAddr: new FormControl(null, [
        Validators.required,
      ]),
      streetAddr2: new FormControl(null, [
        Validators.required,
      ]),
      city: new FormControl(null, [
        Validators.required,
        // alphabets regex
        Validators.pattern('^[a-zA-Z\\s\'-]+$')
      ]),
      state: new FormControl(null, [
        Validators.required,
        // alphabets regex
        Validators.pattern('^[a-zA-Z\\s\'-]+$')
      ]),
      zipCode: new FormControl(null, [
        Validators.required,
        // zip code regex
        Validators.pattern('[0-9]{5}')
      ]),
    });
  }

  onFormSubmit(form: FormGroup) {
    this.invalidFields = {};

    // transform the form to WO
    const userSignUPDTO: UserSignUPDTO = {
      username: form.value.username,
      ////
      firstName: form.value.firstname,

      lastName: form.value.lastname,

      email: form.value.email,

      phoneNumber: form.value.phone,

      streetAddress: form.value.streetAddr,

      streetAddressTwo: form.value.streetAddr2,

      city: form.value.city,

      state: form.value.state,

      zipCode: Number(form.value.zipCode),

      password: "dump-data",

      //////////////

      plan: "	YZ-PLAN-1"
    }
    //
    if (form.valid) {
      this.signupService.Signup(userSignUPDTO).subscribe({
        next: () => {
          // Handle successful signup
        }
      });
    }
    else {
      this.showValidationPopups();
    }
  }
  showValidationPopups() {
    Object.keys(this.myForm.controls).forEach(controlName => {
      const control = this.myForm.get(controlName);

      if (control && control.invalid) {
        this.invalidFields[controlName] = true;
      }
      setTimeout(() => {

        this.invalidFields[controlName] = false;
      }, 4000)
    });
  }
}
