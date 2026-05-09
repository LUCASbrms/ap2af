import { Routes } from '@angular/router';
import { LivroFormComponent } from './components/livro-form/livro-form';
import { LivroListComponent } from './components/livro-list/livro-list';

export const routes: Routes = [
  { path: '', component: LivroListComponent },
  { path: 'novo', component: LivroFormComponent },
  { path: 'editar/:id', component: LivroFormComponent },
  { path: '**', redirectTo: '' }
];
