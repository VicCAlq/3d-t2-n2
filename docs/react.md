# O que é React Native?

React Native é uma ferramenta que permite criar aplicativos de celular (para iPhone e Android) usando a mesma linguagem de programação dos sites: JavaScript.

Em vez de precisar aprender duas linguagens diferentes — uma para iPhone (Swift) e outra para Android (Kotlin) — você escreve o código uma única vez e ele funciona nos dois sistemas!

# Como funciona na prática?

Imagine que você está montando uma apresentação no PowerPoint. Você escreve o conteúdo, escolhe as cores e define onde cada coisa vai aparecer. Mas quem realmente desenha na tela é o próprio PowerPoint.

O React Native funciona de forma parecida:

| Tags do React Native        | Resultado                      |
| --------------------------- | ------------------------------ |
| Escreve `<Text>Olá!</Text>` | Aparece o texto correspondente |
| Escreve `<Image>`           | Aparece uma imagem             |
| Escreve `<Button>`          | Aparece um botão interativo    |

Ou seja: você escreve de um jeito simples, e o React Native se encarrega de criar os elementos de verdade no celular, como se tivesse sido feito por um programador nativo.

O React Native trabalha com o mesmo código React utilizado para sites. Por debaixo dos panos, este código é convertido em elementos nativos da plataforma que estiver executando o programa.

# Exemplo prático

O código abaixo cria um aplicativo de "contador de toques":

```jsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function App() {
  const [contador, setContador] = useState(0);

  return (
    <View>
      <Text>Você clicou/tocou {contador} vezes</Text>
      <Button 
        title="Clique aqui!" 
        onPress={() => setContador(contador + 1)} 
      />
    </View>
  );
}
```

O que esse código faz?

- Cria uma variável para armazenar a contagem de cliques/toques e uma função para modificar esse valor (`useState`)
- Cria uma tela (`<View>`)
- Mostra um texto (`<Text>`) com o número de cliques/toques
- Coloca um botão (`<Button>`) que, ao ser apertado, aumenta o contador
