import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-profile-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile-form.html'
})
export class EditProfileForm {
  private fb = inject(FormBuilder);

  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,}$')]], 
    avatarUrl: ['']
  });

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched(); 
      return; 
    }

    console.log('Datos listos para enviar:', this.profileForm.value);
    alert('¡Perfil actualizado con éxito!'); 
  }
}