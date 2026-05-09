import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Livro } from '../../models/livro.model';
import { LivroService } from '../../services/livro.service';

@Component({
  selector: 'app-livro-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './livro-form.html',
  styleUrl: './livro-form.css'
})
export class LivroFormComponent implements OnInit {
  form!: FormGroup;
  editando = false;
  livroId?: number;
  carregando = false;
  erro = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly livroService: LivroService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.criarFormulario();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editando = true;
      this.livroId = Number(id);
      this.carregarLivro(this.livroId);
    }
  }

  criarFormulario(): void {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      autor: ['', [Validators.required, Validators.minLength(3)]],
      ano: [new Date().getFullYear(), [Validators.required, Validators.min(1)]],
      preco: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  carregarLivro(id: number): void {
    this.carregando = true;
    this.erro = '';

    this.livroService.buscarPorId(id).subscribe({
      next: (livro) => {
        this.form.patchValue(livro);
        this.carregando = false;
      },
      error: (erro) => {
        this.erro = 'Livro nao encontrado.';
        this.carregando = false;
        console.error(erro);
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const livro: Livro = this.form.value;
    this.carregando = true;
    this.erro = '';

    const requisicao = this.editando
      ? this.livroService.atualizar(this.livroId!, livro)
      : this.livroService.criar(livro);

    requisicao.subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (erro) => {
        this.erro = 'Erro ao salvar livro.';
        this.carregando = false;
        console.error(erro);
      }
    });
  }

  voltarParaLista(): void {
    this.router.navigate(['/']);
  }
}
