import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ProfileCard {
  route: string;
  name: string;
  title: string;
  cta?: string;
}

@Component({
    selector: 'app-menu',
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './menu.component.html'
})
export class MenuComponent implements OnInit, OnDestroy {
  profiles: ProfileCard[] = [
    {
      route: '/sergio',
      name: 'Sergio Parissi Reyes',
      title: 'Desarrollador .NET Senior & Especialista Sitecore · EPAM Systems · Azure · IA'
    },
    {
      route: '/dafne',
      name: 'Dafne Cuevas',
      title: 'Coordinadora de Operaciones · Logística & Administración · Grupo Xcaret'
    },
    {
      route: '/giovanna',
      name: 'Giovanna Parissi Reyes',
      title: 'Ingeniera Civil · Supervisora de Obra · Residente · Gran Hyatt Puerto Cancún'
    },
    {
      route: '/teresina',
      name: 'Teresina Parissi Reyes',
      title: 'Lic. Administración · Maestra en Alta Gerencia e Inteligencia Estratégica'
    },
    {
      route: '/misfinanzas',
      name: 'MisFinanzas',
      title: 'App de control de gastos y ahorro · Android · Kotlin & Firebase · Proyecto propio',
      cta: 'Ver proyecto →'
    }
  ];

  ngOnInit(): void {
    document.body.classList.add('menu-theme');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('menu-theme');
  }
}
