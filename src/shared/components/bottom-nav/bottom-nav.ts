import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-registry';

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
    { label: 'Inicio', path: '/home', icon: 'store' },
    { label: 'Catálogo', path: '/catalog', icon: 'cup' },
    { label: 'Carrito', path: '/cart', icon: 'shopping-bag' },
    { label: 'Beneficios', path: '/rewards', icon: 'tag' },
  ];
}
