import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CartButton } from '../../../cart/components/cart-button/cart-button';
import {
  BENEFIT_FORMAT_CODES,
  BenefitFormatCode,
} from '../../../admin-benefit-types/types/benefit-format.model';
import { benefitFormatLabel } from '../../../admin-benefit-types/utils/benefit-format-labels';
import { Cafe } from '../../../home/model/cafe.model';
import { CafeService } from '../../../home/services/cafe.service';
import { ProfileRepository } from '../../../profile/services/profile.repository';
import { AvailableBenefit } from '../../model/available-benefit.model';
import { AvailableBenefitService } from '../../services/available-benefit.service';
import { isBenefitUnlocked } from '../../utils/benefit-access';
import { AvailableBenefitCard } from '../benefit-card/benefit-card';

@Component({
  selector: 'app-available-benefits',
  imports: [AvailableBenefitCard, CartButton],
  templateUrl: './available-benefits.html',
  host: { class: 'block' },
})
export class AvailableBenefits implements OnInit {
  private readonly benefitService = inject(AvailableBenefitService);
  private readonly cafeService = inject(CafeService);
  private readonly profileRepository = inject(ProfileRepository);

  benefits = signal<AvailableBenefit[]>([]);
  cafes = signal<Cafe[]>([]);
  clientTierPoints = signal<number | null>(null);
  isLoading = signal(true);
  hasError = signal(false);
  selectedCafeId = signal('');
  selectedType = signal<BenefitFormatCode | ''>('');

  readonly typeOptions = BENEFIT_FORMAT_CODES.map((code) => ({
    value: code,
    label: benefitFormatLabel(code),
  }));

  hasFilters = computed(() => this.selectedCafeId() !== '' || this.selectedType() !== '');

  unlockedCount = computed(() => {
    const clientPoints = this.clientTierPoints();
    if (clientPoints === null) {
      return null;
    }
    return this.benefits().filter((benefit) => isBenefitUnlocked(benefit, clientPoints)).length;
  });

  ngOnInit(): void {
    this.loadCafes();
    this.loadClientTier();
    this.loadBenefits();
  }

  loadBenefits(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.benefitService.getAvailable(this.selectedCafeId(), this.selectedType()).subscribe({
      next: (data) => {
        this.benefits.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  selectCafe(cafeId: string): void {
    this.selectedCafeId.set(cafeId);
    this.loadBenefits();
  }

  selectType(type: BenefitFormatCode | ''): void {
    this.selectedType.set(type);
    this.loadBenefits();
  }

  clearFilters(): void {
    this.selectedCafeId.set('');
    this.selectedType.set('');
    this.loadBenefits();
  }

  private loadCafes(): void {
    this.cafeService.getAll().subscribe({
      next: (data) => this.cafes.set(data),
    });
  }

  private loadClientTier(): void {
    this.profileRepository.getTierDetail().subscribe({
      next: (detail) => this.clientTierPoints.set(detail.currentTierThreshold),
    });
  }
}
