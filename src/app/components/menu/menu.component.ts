import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ProfileCard {
  route: string;
  name: string;
  title: string;
}

@Component({
    selector: 'app-menu',
    imports: [RouterLink],
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
    }
  ];

  ngOnInit(): void {
    document.body.classList.add('menu-theme');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('menu-theme');
  }
}
