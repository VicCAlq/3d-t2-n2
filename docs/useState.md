 # `useState` no React Native

## O que é o `useState`?

O `useState` é uma ferramenta do React que permite que os componentes guardem informações que devem ser monitoradas pelo React para atualizar o conteúdo na tela de acordo com seus valores atuais.

---

## Como usar?

### 1. Importar

Antes de tudo, você precisa "pedir emprestado" essa ferramenta do React:

```jsx
import React, { useState } from 'react';
```

### 2. Criar um estado

Dentro do seu componente, você declara o estado assim:

```jsx
const [valor, setValor] = useState("30px");
```

| Parte | Significado |
|-------|-------------|
| `valor` | É a variável criada que você deseja utilizar |
| `setValor` | É a função que você usa para modificar esse valor, equivalente a um "setter" |
| `useState("30px")` | O `"30px"` é o **valor inicial** (qualquer valor JavaScript válido, incluindo outros componentes) |

O `useState` recebe como argumento o valor inicial da variável que você deseja criar, e entrega uma lista com esta variável e a função que deve ser utilizada para modificar esta variável. O nome da variável e da função usada para modificar ela são escolhidos por você, mas é **convenção** usar a nomenclatura "setNomeDaVariavel".
---

## Exemplo prático: Contador de Cliques

Vamos criar um botão que conta quantas vezes você clicou nele:

```jsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texto: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default function App() {
  // Criamos o estado 'contador' começando em 0
  const [contador, setContador] = useState(0);

  function aumentar() {
    setContador(contador + 1); // Atualiza o valor
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.texto}>Você clicou {contador} vezes!</Text>
      <Button title="Clique aqui" onPress={aumentar} />
    </View>
  );
}
``

### O que acontece aqui?

1. O `contador` começa valendo `0`
2. Quando você clica no botão, a função `aumentar` é chamada
3. `setContador(contador + 1)` muda o valor (de 0 para 1, de 1 para 2, etc.)
4. A tela se atualiza sozinha para mostrar o novo número

---

## Exemplo com texto: Campo de entrada

```jsx
import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

export default function App() {
  const [nome, setNome] = useState('');

  return (
    <View style={{ padding: 20 }}>
      <Text>Digite seu nome:</Text>
      <TextInput
        placeholder="Seu nome aqui"
        value={nome}
        onChangeText={setNome} // Atualiza o estado a cada letra digitada
        style={{ borderWidth: 1, padding: 10, marginTop: 10 }}
      />
      <Text style={{ marginTop: 20 }}>
        Olá, {nome || 'visitante'}!
      </Text>
    </View>
  );
}
```

---

## Regras importantes

| ❌ Não faça | ✅ Faça |
|-------------|---------|
| `contador = contador + 1` (mudar direto) | `setContador(contador + 1)` (sempre use a função `set`) |
| Chamar `useState` fora do componente | Chamar `useState` **dentro** do componente |

---

## Quando usar o `useState`?

- Quando um dado **muda com o tempo** (contador, texto digitado, se algo está ligado/desligado)
- Quando a interface precisa **reagir** a uma ação do usuário

