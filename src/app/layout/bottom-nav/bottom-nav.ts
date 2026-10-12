import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/ui/icon/icon';
import { IconName } from '../../shared/ui/icon/icon-registry';

interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: IconName;
}

@Component({
  imports: [RouterLink, RouterLinkActive, Icon],
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.html',
})
export class BottomNav {
  protected readonly items: readonly NavItem[] = [
    { label: 'Loyalty', path: '/dashboard', icon: 'coffee' },
    { label: 'Catalog', path: '/catalog', icon: 'cup' },
    { label: 'Cart', path: '/cart', icon: 'shopping-bag' },
    { label: 'Rewards', path: '/rewards', icon: 'tag' },
  ];
}
