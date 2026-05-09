import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Livro } from '../../models/livro.model';
import { LivroService } from '../../services/livro.service';

@Component({
  selector: 'app-livro-list',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './livro-list.html',
  styleUrl: './livro-list.css'
})
export class LivroListComponent implements OnInit {
  livros: Livro[] = [];
  carregando = false;
  erro = '';

  constructor(private readonly livroService: LivroService) {}

  ngOnInit(): void {
    this.carregarLivros();
  }

  carregarLivros(): void {
    this.carregando = true;
    this.erro = '';

    this.livroService.listar().subscribe({
      next: (dados) => {
        this.livros = dados;
        this.carregando = false;
      },
      error: (erro) => {
        this.erro = 'Erro ao carregar livros.';
        this.carregando = false;
        console.error(erro);
      }
    });
  }

  excluir(id: number | undefined): void {
    if (!id) {
      return;
    }

    const confirmou = confirm('Deseja realmente excluir este livro?');

    if (!confirmou) {
      return;
    }

    this.livroService.excluir(id).subscribe({
      next: () => {
        this.carregarLivros();
      },
      error: (erro) => {
        this.erro = 'Erro ao excluir livro.';
        console.error(erro);
      }
    });
  }
}
