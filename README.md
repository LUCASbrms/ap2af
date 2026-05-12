# Questões e Respostas — CRUD de Livros com Angular

---

## 1. Qual é a responsabilidade do componente?

O componente é responsável pela **camada de apresentação** da aplicação — ou seja, o que o usuário vê e com o que interage na tela.

Neste projeto temos três componentes principais:

- **`NavbarComponent`** → exibe o menu de navegação com os links "Livros" e "Novo Livro".
- **`LivroListComponent`** → exibe a tabela com os livros cadastrados e os botões de Editar e Excluir.
- **`LivroFormComponent`** → exibe o formulário para cadastrar ou editar um livro.

O componente **não** acessa a API diretamente. Ele delega essa responsabilidade ao service.

> **Resumo:** o componente cuida da tela (exibir dados, capturar cliques, mostrar erros).

---

## 2. Qual é a responsabilidade do service?

O service é responsável pela **comunicação com a API** e pela lógica de dados da aplicação.

Neste projeto, o `LivroService` centraliza todas as chamadas HTTP:

```ts
// src/app/services/livro.service.ts

listar()         // GET    /livros
buscarPorId(id)  // GET    /livros/:id
criar(livro)     // POST   /livros
atualizar(id)    // PUT    /livros/:id
excluir(id)      // DELETE /livros/:id
```

Os componentes (`LivroListComponent`, `LivroFormComponent`) injetam o service no construtor e chamam esses métodos. Assim, o componente não precisa saber nada sobre HTTP — só precisa usar o service.

> **Resumo:** o service cuida de buscar, enviar, atualizar e excluir dados via HTTP.

---

## 3. Para que serve o model?

O model define a **estrutura e tipagem dos dados** que a aplicação manipula.

Neste projeto, o model `Livro` está em:

```ts
// src/app/models/livro.model.ts

export interface Livro {
  id?: number;
  titulo: string;
  autor: string;
  ano: number;
  preco: number;
}
```

Com essa interface, o TypeScript sabe exatamente quais campos um livro possui e quais são seus tipos. Isso evita erros como tentar acessar `livro.nome` (campo que não existe) ou passar um texto onde se espera um número.

O model é usado no service (`Observable<Livro[]>`), nos componentes (`livros: Livro[] = []`) e nos formulários (`const livro: Livro = this.form.value`).

> **Resumo:** o model garante que os dados tenham sempre o formato correto em toda a aplicação.

---

## 4. Por que o campo `id` é opcional?

```ts
id?: number;
```

O `id` é opcional porque há dois momentos diferentes no ciclo de vida de um livro:

- **Ao cadastrar** um novo livro (`POST`), o objeto ainda não tem `id`. Quem gera esse valor é o json-server automaticamente, após salvar o registro no `db.json`.
- **Ao listar, editar ou excluir**, o livro já existe na API e sempre virá com o `id` preenchido.

Se o `id` fosse obrigatório, o TypeScript acusaria erro ao tentar criar um objeto `Livro` sem ele para enviar ao `criar()`. Tornando-o opcional (`?`), o mesmo model funciona para os dois casos.

> **Resumo:** ao cadastrar, o `id` ainda não existe — ele só é gerado pela API após salvar.

---

## 5. Qual método HTTP lista dados?

**`GET`**

O método `GET` busca dados do servidor sem modificar nada.

Neste projeto, ele é usado em dois momentos:

```ts
// Listar todos os livros
listar(): Observable<Livro[]> {
  return this.http.get<Livro[]>(this.apiUrl);
  // GET http://localhost:3000/livros
}

// Buscar um livro pelo id (usado na edição)
buscarPorId(id: number): Observable<Livro> {
  return this.http.get<Livro>(`${this.apiUrl}/${id}`);
  // GET http://localhost:3000/livros/1
}
```

---

## 6. Qual método HTTP cadastra dados?

**`POST`**

O método `POST` envia um novo objeto ao servidor para ser criado.

Neste projeto:

```ts
criar(livro: Livro): Observable<Livro> {
  return this.http.post<Livro>(this.apiUrl, livro);
  // POST http://localhost:3000/livros
  // Body: { titulo, autor, ano, preco }
}
```

O json-server recebe o objeto, gera um `id` automaticamente e salva no `db.json`.

---

## 7. Qual método HTTP atualiza dados?

**`PUT`**

O método `PUT` substitui um registro existente pelo objeto enviado no corpo da requisição.

Neste projeto:

```ts
atualizar(id: number, livro: Livro): Observable<Livro> {
  return this.http.put<Livro>(`${this.apiUrl}/${id}`, livro);
  // PUT http://localhost:3000/livros/1
  // Body: { titulo, autor, ano, preco }
}
```

O `id` vai na URL para identificar qual livro será substituído.

---

## 8. Qual método HTTP exclui dados?

**`DELETE`**

O método `DELETE` remove um registro do servidor.

Neste projeto:

```ts
excluir(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
  // DELETE http://localhost:3000/livros/1
}
```

O `id` vai na URL para identificar qual livro será excluído. Não há corpo na requisição.

---

## 9. Para que serve o `router-outlet`?

O `<router-outlet>` é o **espaço reservado** onde o Angular renderiza o componente correspondente à rota acessada no momento.

Neste projeto, ele está no `app.html`:

```html
<app-navbar />

<main>
  <router-outlet />
</main>
```

Dependendo da URL, o Angular substitui o `<router-outlet>` pelo componente correto:

| URL acessada                       | Componente renderizado   |
|------------------------------------|--------------------------|
| `http://localhost:4200/`           | `LivroListComponent`     |
| `http://localhost:4200/novo`       | `LivroFormComponent`     |
| `http://localhost:4200/editar/1`   | `LivroFormComponent`     |

A `<app-navbar>` fica sempre visível, pois está fora do `<router-outlet>`. Só o conteúdo principal muda conforme a rota.

> **Resumo:** o `router-outlet` é o "espaço" da tela onde o Angular encaixa o componente da rota atual.

---

## 10. Por que precisamos usar `.subscribe()`?

Os métodos do `HttpClient` (como `http.get`, `http.post`, `http.put`, `http.delete`) **não executam a requisição automaticamente**. Eles retornam um `Observable` — um objeto que representa uma operação assíncrona que ainda não aconteceu.

Para que a requisição seja de fato enviada, é preciso "assinar" o Observable com `.subscribe()`.

Neste projeto, isso aparece nos componentes:

```ts
// LivroListComponent
this.livroService.listar().subscribe({
  next: (dados) => {
    this.livros = dados;      // executado quando a API responde com sucesso
    this.carregando = false;
  },
  error: (erro) => {
    this.erro = 'Erro ao carregar livros.';  // executado se der erro
    this.carregando = false;
  }
});
```

O `.subscribe()` recebe dois callbacks:

- **`next`** → executado quando a API retorna com sucesso.
- **`error`** → executado quando ocorre algum erro (API fora do ar, problema de rede, etc.).

Sem o `.subscribe()`, a requisição HTTP nunca seria disparada e nenhum dado chegaria à tela.

> **Resumo:** o `Observable` é apenas uma "promessa de dado futuro". O `.subscribe()` é o que dispara a requisição e define o que fazer quando a resposta chegar.
