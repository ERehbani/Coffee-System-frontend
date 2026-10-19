import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { Cafe } from '../../model/cafe.model';
import { CafeService } from '../../services/cafe.service';
import { CafeCard } from '../cafe-card/cafe-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, Icon, CafeCard],
  templateUrl: './home.html',
  host: { class: 'block' },
})
export class Home implements OnInit {
  cafes = signal<Cafe[]>([]);
  searchQuery = signal('');
  selectedCafe = signal<Cafe | null>(null);
  isLoading = signal(true);

  filteredCafes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.cafes();
    }

    return this.cafes().filter(
      (cafe) =>
        cafe.name.toLowerCase().includes(query) ||
        cafe.address.toLowerCase().includes(query)
    );
  });

  constructor(private cafeService: CafeService) {}

  ngOnInit(): void {
    this.cafeService.getAll().subscribe({
      next: (data) => {
        this.cafes.set(data);
        if (data.length > 0 && !this.selectedCafe()) {
          this.selectedCafe.set(data[0]);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('error:', error);
        this.isLoading.set(false);
      },
    });
  }

  onSelectCafe(cafe: Cafe): void {
    this.selectedCafe.set(cafe);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }
}
