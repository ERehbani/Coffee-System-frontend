import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { CartButton } from '../../../cart/components/cart-button/cart-button';
import { Cafe } from '../../model/cafe.model';
import { CafeService } from '../../services/cafe.service';
import { CafeCard } from '../cafe-card/cafe-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, Icon, CafeCard, CartButton],
  templateUrl: './home.html',
  host: { class: 'block' },
})
export class Home implements OnInit {
  cafes = signal<Cafe[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  filterState = signal<'all' | 'open'>('all');

  filteredCafes = computed(() => {
    let list = this.cafes();

    if (this.filterState() === 'open') {
      list = list.filter((c) => c.state);
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return list;
    }

    return list.filter(
      (cafe) =>
        cafe.name.toLowerCase().includes(query) ||
        cafe.address.toLowerCase().includes(query) ||
        (cafe.description && cafe.description.toLowerCase().includes(query))
    );
  });

  openCafesCount = computed(() => {
    return this.cafes().filter((c) => c.state).length;
  });

  constructor(private cafeService: CafeService) {}

  ngOnInit(): void {
    this.cafeService.getAll().subscribe({
      next: (data) => {
        this.cafes.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('error loading cafes:', error);
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  setFilterState(state: 'all' | 'open'): void {
    this.filterState.set(state);
  }
}
