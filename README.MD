# HTML Template

Biblioteca js para criar elementos HTML de um jeito dinâmico, permitindo o reuso de código do HTML e JS de maneira simples, fornecer uma interface prática para os templates em HTML e seu construtor em JS.

## Para que serve?

É uma biblioteca bem simples, e pequena que trata de remover códigos HTML extensos e com bastante elementos repetidos, evitando a _manutenção_, _correção_ e _atualização_ de código HTML em multiplos lugares. Ideal para sites simples que trabalham com javascript vanilla. Perfeita para gerar HTML baseado em conteúdos similares, e eliminar a construção de estruturas HTML dentro do javascript.


## Doc

### Criando templates no HTML

Há dois tipos de dados que os elementos que serão utilizados como template precisão ter:

- Ou `[data-content]`: que injeta o conteúdo passado para o criador do template direto no elemento em que se encontra o atributo. Esse atributo recebe como valor o nome de uma propriedade que será fornecida na criação do template.
- Ou `[data-attrs]`. Esse atributo deve conter itens separados por `;`, a fim de gerar uma lista como resultado. Os itens passados para `[data-attrs]` devem ser o nome dos atributos que possuem valores de template `<div class="{{exemplo}}" id="{{exemplo}}" data-attrs="class;id" />`, que possuem entre suas chaves, o nome da propriedade que será passada na criação do template.

Exemplo HTML:

```html
<script type="text/html" id="template-element">
  <div
    class="card {{cardType}}"
    id="{{cardName}}-{{cardIndex}}"
    data-attrs="id;class"
  >
    <div class="card-header" title="{{cardAction}}" data-attrs="title">
      <h3 class="card-title" data-content="cardTitle"></h3>
    </div>
    <div class="card-body" data-content="cardContent"></div>
  </div>
</script>
```

### Utilizando os templates criados no JS

Para criar os elementos baseados nos seus templates HTML, primeiro você fornece o elemento para o construtor `Template` e então, utiliza a função `createElement` no objeto retornado.
O construtor `Template` aceita ou uma **query string** para buscar o elemento, ou o **elemento** em si.

> OBS: Caso o elemento fornecido seja um `script[type=text/html]`, apenas o conteúdo interno será utilizado na criação dos elementos.

```javascript
// Também poderia ser: const template = new Template(document.getElementById('template-element'));

const template = new Template('#template-element');
template.createElement();
```

A função `createElement(templateData, options)` recebe dois parâmetros, `templateData` e `options`. `templateData` deve ser um objeto contento os dados a serem passados para o elemento HTML, ou um objeto composto `{ content: {}, attr: {} }` que recebe **content** ou **attr**.

> OBS: O objeto composto por **content** ou **attr** é útil quando o elemento template precisa apenas de um dos dados para ser criado, já que quando um dado é passado e o elemento template não requer esse dado, é lançado um erro. Também é mais simples e reaproveitavel não utilizalo quando o elemento template requer os dois dados.

O argumento `options` aceita apenas uma propriedade **acceptHTML**, que permite a inclusão de conteúdo HTML por string para todos elementos que recebem um conteúdo.

Exemplo:
Utilizando o elemento template criado em "Criando templates no HTML".

```javascript
const templateData = {
  cardType: 'red',
  cardName: 'card',
  cardIndex: 1,
  cardAction: 'Clique aqui e veja o que acontece!',
  cardTitle: 'Um simples <strong>card</strong>',
  cardContent: 'Olá mundo!',
};

const options = {
  acceptHTML: true,
};

document.body.appendChild(
  new Template('#template-element').createElement(templateData, options)
);
```

O código javascript irá gerar o seguinte elemento:

```html
<div class="card red" id="card-1">
  <div class="card-header" title="Clique aqui e veja o que acontece!">
    <h3 class="card-title">Um simples <strong>card</strong></h3>
  </div>
  <div class="card-body">Olá mundo!</div>
</div>
```

Outros pontos a serem considerados sobre `template.createElement`:

- Conteúdos também aceitam elementos do tipo HTMLElement;
- Conteúdos também aceitam Arrays, sejam de strings ou elementos do tipo HTMLElement;
- Não lança erros quando não recebe nenhum dado;

Você pode se deparar com erros quando:
- Quando o elemento ou query passado para o construtor `Template` não for válido ou o elemento não for encontrado;
- Quando faltar alguma propriedade que o template HTML precise para `[data-content]` ou `[data-attr]`;
- Quando passar uma propriedade `content` ou `attr` para `template.createElement`, mas nenhum elemento com o atributo `[data-content]` ou `[data-attr]` for encontrado;
- Quando um atributo passado para `template.createElement` não for: `String | Number | Boolean`;