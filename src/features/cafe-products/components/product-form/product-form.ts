import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormField, form, max, maxLength, min, minLength, pattern, required } from '@angular/forms/signals';
import { Icon } from '../../../../shared/components/icon/icon';
import { CategoryOption, CreateProductRequest, ProductDto } from '../../../catalog/types/product.dto';

interface ProductFormModel {
  name: string;
  description: string;
  price: number;
  awardedPoints: number;
  categoryId: string;
  image: string;
  tags: string;
  state: boolean;
}

@Component({
  selector: 'app-product-form',
  imports: [FormField, Icon],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
  host: { class: 'block' },
})
export class ProductForm {
  readonly isSaving = input<boolean>(false);
  readonly categories = input<CategoryOption[]>([]);
  readonly productToEdit = input<ProductDto | null>(null);

  readonly save = output<{ request: CreateProductRequest & { state?: boolean }; id?: string }>();
  readonly cancel = output<void>();

  attemptedSubmit = signal(false);

  formModel = signal<ProductFormModel>({
    name: '',
    description: '',
    price: 1500,
    awardedPoints: 60,
    categoryId: '',
    image: '',
    tags: '',
    state: true,
  });

  productForm = form(this.formModel, (f) => {
    required(f.name, { message: 'El nombre del producto es obligatorio.' });
    minLength(f.name, 2, { message: 'El nombre debe tener al menos 2 caracteres.' });
    maxLength(f.name, 50, { message: 'El nombre no puede superar los 50 caracteres.' });
    pattern(f.name, /^[\p{L}\s]+$/u, { message: 'El nombre solo puede contener letras y espacios.' });

    maxLength(f.description, 100, { message: 'La descripción no puede superar los 100 caracteres.' });

    required(f.price, { message: 'El precio es obligatorio.' });
    min(f.price, 500, { message: 'El precio debe ser de al menos $500.' });
    max(f.price, 50000, { message: 'El precio no puede superar los $50.000.' });

    required(f.awardedPoints, { message: 'Los puntos que otorga son obligatorios.' });
    min(f.awardedPoints, 50, { message: 'Debe otorgar al menos 50 puntos.' });
    max(f.awardedPoints, 3000, { message: 'No puede otorgar más de 3.000 puntos.' });

    required(f.categoryId, { message: 'Debes seleccionar una categoría.' });

    required(f.image, { message: 'La URL de la imagen es obligatoria.' });
    maxLength(f.image, 500, { message: 'La URL no puede superar los 500 caracteres.' });

    maxLength(f.tags, 300, { message: 'Las etiquetas no pueden superar los 300 caracteres.' });
  });

  isEditing = computed(() => !!this.productToEdit());

  nameError = computed(() => this.productForm.name().errors()[0]?.message ?? null);

  descriptionError = computed(() => {
    const raw = this.formModel().description.trim();
    if (raw.length > 0 && raw.length < 5) {
      return 'La descripción debe tener al menos 5 caracteres.';
    }
    if (raw.length > 0 && !/^[\p{L}\d\s]+$/u.test(raw)) {
      return 'La descripción solo puede contener letras y números.';
    }
    return this.productForm.description().errors()[0]?.message ?? null;
  });

  priceError = computed(() => this.productForm.price().errors()[0]?.message ?? null);

  awardedPointsError = computed(() => this.productForm.awardedPoints().errors()[0]?.message ?? null);

  categoryError = computed(() => {
    // The category cannot change after creation, so it only needs a value when creating.
    if (this.isEditing()) {
      return null;
    }
    if (!this.formModel().categoryId) {
      return 'Debes seleccionar una categoría.';
    }
    return this.productForm.categoryId().errors()[0]?.message ?? null;
  });

  imageError = computed(() => this.productForm.image().errors()[0]?.message ?? null);

  tagsError = computed(() => this.productForm.tags().errors()[0]?.message ?? null);

  isFormValid = computed(() => {
    return (
      !this.nameError() &&
      !this.descriptionError() &&
      !this.priceError() &&
      !this.awardedPointsError() &&
      !this.categoryError() &&
      !this.imageError() &&
      !this.tagsError()
    );
  });

  constructor() {
    effect(() => {
      const toEdit = this.productToEdit();
      if (toEdit) {
        this.formModel.set({
          name: toEdit.name,
          description: toEdit.description ?? '',
          price: toEdit.price,
          awardedPoints: toEdit.awardedPoints ?? 60,
          categoryId: toEdit.categoryId ?? '',
          image: toEdit.image ?? '',
          tags: toEdit.tags ? toEdit.tags.join(', ') : '',
          state: toEdit.state,
        });
      } else {
        const firstCategory = this.categories()[0]?.categoryId ?? '';
        this.formModel.set({
          name: '',
          description: '',
          price: 1500,
          awardedPoints: 60,
          categoryId: firstCategory,
          image: '',
          tags: '',
          state: true,
        });
      }
      this.attemptedSubmit.set(false);
    });

    effect(() => {
      const cats = this.categories();
      if (cats.length > 0 && !this.formModel().categoryId && !this.productToEdit()) {
        this.formModel.update((m) => ({ ...m, categoryId: cats[0].categoryId }));
      }
    });
  }

  toggleState(): void {
    this.formModel.update((m) => ({ ...m, state: !m.state }));
  }

  onCategoryChange(categoryId: string): void {
    this.formModel.update((m) => ({ ...m, categoryId }));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.attemptedSubmit.set(true);

    if (!this.isFormValid() || this.isSaving()) {
      return;
    }

    const model = this.formModel();
    const rawTags = model.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const request: CreateProductRequest & { state?: boolean } = {
      name: model.name.trim(),
      description: model.description.trim() || null,
      price: Number(model.price),
      awardedPoints: Number(model.awardedPoints),
      categoryId: model.categoryId,
      image: model.image.trim(),
      // An empty list clears the tags; the backend keeps them when the field is missing.
      tags: rawTags,
      state: model.state,
    };

    const toEdit = this.productToEdit();
    this.save.emit({
      request,
      id: toEdit?.externalId,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
