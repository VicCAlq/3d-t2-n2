# Tags do React Native

O React Native, ao contrário do React, NÃO trabalha com tags html clássicas (button, image, div, p, h1, entre outras). No lugar delas o React Native trabalha com componentes próprios, que são "abstrações" dos equivalentes existentes nas plataformas Android, iOS e web.

Comparativo de tags HTML para tags ReactNative:

| Tag ReactNative | Tag(s) HTML correspondente(s) | Descrição |
|-----------------|-------------------------------|-----------|
| `<View>` | `<div>`, `<section>`, `<header>`, `<footer>`, `<aside>` | Elementos organizadores, para divisão de conteúdo e formatação de como são exibidos (em linha, coluna, etc) |
| `<Text>` | `<p>`, `<h1>`, `<h2>`, `<h3>`, etc | Equivalente a tag de parágrafo. React Native não tem tags separadas para tamanhos de textos diferentes, estes devem ser criados com a estilização dos mesmos |
| `<Pressable>` | `<button>` | Cria um botão com possibilidade de interação |
| `<Image>` | `<img>` | Elemento para inserir uma imagem | 
| `<TextInput>` | `<input type="text">` | Campo de inserção de texto |
| `<FlatList>` | `<ol>`, `<ul>` | Elemento para criação de listas simples |
| `<Switch>` | `<input type="checkbox">` | Chave de liga-desliga |
| `<Modal>` | `<dialog>` | Cria uma janela flutuante sobre a página atual |
| `Alert.alert()` | `window.alert()` | Cria um alerta em uma janela flutuante simples |
| `StyleSheet.create({})` | `.css` | Equivalente a um arquivo de estilos CSS |
| `<StatusBar>` | Sem equivalente no HTML | Interage com a barra de status no topo do celular |


Vejamos abaixo uma descrição mais detalhada das principais tags que utilizaremos:

---

- `<View>`: Container fundamental para estruturar o layout da aplicação. Funciona como uma `<div>` do HTML, agrupando outros componentes e aplicando estilos. Aceita propriedades como `style`, `onPress` (quando envolvido em um Pressable), entre outras. Exemplo de implementação:

```jsx
<View style={styles.container}>
  <Text>Conteúdo dentro da View</Text>
</View>
```

---

- `<Text>`: Exibe textos na interface. É o único componente válido para renderizar strings no React Native; textos soltos não são permitidos. Aceita propriedades como `style`, `numberOfLines` (para truncar linhas), `onPress`, entre outras. Exemplo de implementação:

```jsx
<Text style={styles.titulo} numberOfLines={1}>
  Bem-vindo ao aplicativo!
</Text>
```

---

- `<Pressable>`: Componente genérico e flexível para detectar toques/pressões. Mais versátil que `<Button>`, permitindo customização visual completa e acesso a estados como `pressed`. Propriedades principais: `onPress`, `onLongPress`, `style` (aceita função com estado). Exemplo de implementação:

```jsx
<Pressable 
  onPress={() => console.log('Pressionado')}
  style={({ pressed }) => [
    styles.botao,
    pressed && styles.botaoPressionado
  ]}
>
  <Text style={styles.textoBotao}>Clique aqui</Text>
</Pressable>
```

---

- `<Image>`: Exibe imagens na aplicação. Suporta fontes locais (via `require`) e remotas (via URI). Propriedades principais: `source`, `style`, `resizeMode`. Exemplo de implementação:

```jsx
<Image 
  source={{ uri: 'https://exemplo.com/imagem.png' }} 
  style={{ width: 200, height: 200 }}
  resizeMode="cover"
/>
```

---

- `<TextInput>`: Campo de entrada de texto editável pelo usuário. Propriedades principais: `value`, `onChangeText`, `placeholder`, `keyboardType`, `secureTextEntry` (para senhas). Exemplo de implementação:

```jsx
<TextInput
  value={email}
  onChangeText={setEmail}
  placeholder="Digite seu e-mail"
  keyboardType="email-address"
/>
```

---


- `<StyleSheet>`: API para criar e otimizar objetos de estilo de forma performática. Não é um componente JSX, mas uma função que organiza os estilos e valida propriedades em tempo de desenvolvimento. Exemplo de implementação:

```jsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    fontSize: 18,
    color: '#333',
  },
});
```

---

- `<Switch>`: Componente de alternância (liga/desliga), similar a um toggle. Propriedades principais: `value` (estado atual), `onValueChange` (função chamada ao alternar), `trackColor`, `thumbColor`. Exemplo de implementação:

```jsx
<Switch
  value={ativado}
  onValueChange={(novoValor) => setAtivado(novoValor)}
  trackColor={{ false: '#767577', true: '#81b0ff' }}
  thumbColor={ativado ? '#f5dd4b' : '#f4f3f4'}
/>
```

---

- `<FlatList>`: Componente otimizado para renderizar listas grandes de dados. Renderiza apenas os itens visíveis na tela, melhorando a performance. Propriedades principais: `data`, `renderItem`, `keyExtractor`. Exemplo de implementação:

```jsx
<FlatList
  data={listaDeUsuarios}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={styles.item}>
      <Text>{item.nome}</Text>
    </View>
  )}
/>
```

---

- `<Modal>`: Exibe conteúdo sobreposto à tela atual, como diálogos ou pop-ups. Propriedades principais: `visible` (controla exibição), `animationType`, `transparent`, `onRequestClose`. Exemplo de implementação:

```jsx
<Modal
  visible={modalVisivel}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setModalVisivel(false)}
>
  <View style={styles.modalContainer}>
    <Text>Conteúdo do Modal</Text>
    <Button title="Fechar" onPress={() => setModalVisivel(false)} />
  </View>
</Modal>
```

---

- `<Alert>`: API para exibir diálogos de alerta nativos do sistema operacional. Não é um componente JSX, mas um método que interrompe a interação do usuário até que ele responda. Propriedades principais: `title`, `message`, `buttons` (array com ações). Exemplo de implementação:

```jsx
Alert.alert(
  'Confirmar exclusão',
  'Deseja realmente excluir este item?',
  [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', onPress: () => excluirItem(), style: 'destructive' }
  ]
);
```

---
