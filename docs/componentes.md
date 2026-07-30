# Componentes
## O que são

Componentes são uma forma de organizar o conteúdo de um site ou um aplicativo de modo a aproximar e isolar os códigos de estrutura e comportamento de cada parte deste site ou aplicativo.

Em JavaScript e HTML comuns, o HTML determina a existência e hierarquia de cada elemento enquanto o JavaScript determina o comportamento destes elementos, o que resulta em um único elemento tendo código escrito em dois locais completamente diferentes. Para piorar a situação, a estrutura de cada elemento é escrita junto com a estrutura de todos os outros elementos, enquanto que o comportamento também é escrito junto dos comportamentos de diversos outros elementos. Para editar qualquer elemento você precisaria modificar dois códigos completamente diferentes, perdidos no meio de dois arquivos diferentes.

Componentes React separam cada elemento da página no seu próprio arquivo, e dentro deste arquivo a escrita da estrutura do elemento e de seu comportamento é unificada em um único local. Isso traz diversos benefícios para a organização e aproveitamento do código, que veremos a seguir.

## Comparação breve

|     | HTML + JS Puro | React |
| --- | -------------- | ----- |
| Organização | Estrutura (HTML) e comportamento (JS) em arquivos separados | Estrutura e comportamento no mesmo arquivo |
| Aproveitamento | Código difícil de ser reaproveitado | Código facilmente reutilizável |
| Atualização | Manipulação manual do DOM (document.getElementById) | Atualização automática da interface |

## Exemplo comparativo

Vejamos a seguir um componente de botão, primeiro como ele seria escrito usando HTML, JS e CSS clássicos:

- Arquivo `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="style.css"/>
</head>
<body>
  <!-- Imagine diversos outros elementos html por aqui -->
    <button id="meu-botao" class="btn-estilo">Clique aqui</button>
  <!-- Mais diversos outros elementos html por aqui -->
  <script type="text/javascript" src="index.js"/>
</body>
</html>
```

- Arquivo `style.css`
```css
/* Imagine outros diversos estilos CSS neste mesmo arquivo */
.btn-estilo {
    background-color: blue;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: 'pointer';
}
```

- Arquivo `index.js`
```javascript
// Precisa "encontrar" o botão na página
const botao = document.getElementById('meuBotao');

// Adicionar evento manualmente
botao.addEventListener('click', function() {
    alert('Botão clicado!');
});
```

No exemplo acima, se eu quiser modificar o botão, temos de modificar 3 arquivos diferentes. Se quisermos duplicar este botão, temos de também duplicar o código do comportamento dele no arquivo JS e fazer as modificações necessárias. Abaixo, vamos ver como o React muda esta dinâmica:

- Componente `Botao.jsx`
```jsx
import { Pressable } from 'react-native';

export default function Botao({ id, children, aoClicar }) {
    const estilo = {
        backgroundColor: 'blue',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    }
    
    return (
        <Pressable id={id} style={estilo} onPress={aoClicar}>
            {children}
        </Pressable>
    )
}
```

- No arquivo principal da página `App.jsx`:
```jsx
import { View } from 'react-native';
import Botao from './Botao.jsx'

export default function App() {
    return(
        <View>
            <Botao id='botao-1' aoClicar={() => alert('Botão 1 clicado!')}>
                Sou o botão 1.
            </Botao>
            <Botao id='botao-2' aoClicar={() => alert('Botão 2 clicado!')}>
                Sou o botão 2.
            </Botao>
            <Botao id='botao-3' aoClicar={() => alert('Botão 3 clicado!')}>
            Sou o botão 3.
            </Botao>
            <Botao id='botao-4' aoClicar={() => alert('Botão 4 clicado!')}>
                Sou o botão 4.
            </Botao>
        </View>
    )
}
```

Notem como no exemplo do ReactNative, é super simples reutilizar o componente do Botão bastando alterar poucos valores. Este tipo de organização do código é (normalmente) inviável com HTML, CSS e JS puros.
