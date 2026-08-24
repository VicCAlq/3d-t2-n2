import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View, ScrollView, TextInput, Button, Pressable} from 'react-native';
import React, {useState} from 'react';

const API_URL = 'http://localhost:3451';

export default function App() {
  const [endereco, setEndereco] = useState('');
  const [fonteFiltro, setFonteFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [noticias, setNoticias] = useState([]);

  async function cadastrarFeed(url) {
    const query = new URLSearchParams({ link: url });
    await fetch(`${API_URL}/api/fontes/cadastrar?${query}`)
      .then((resposta) => {
        if (!resposta.ok) {
          throw new Error(`Erro: ${resposta.status}`);
        }
        return resposta.json();
      })
      .then((resultado) => {
        Alert.alert('Sucesso', 'Fonte cadastrada!');
        setEndereco('');
      })
      .catch((erro) => {
        Alert.alert('Erro', erro.message);
      });
  }

  async function buscarTodasNoticias() {
    await fetch(`${API_URL}/api/noticias`)
      .then((resposta) => resposta.json())
      .then((resultado) => setNoticias(resultado))
      .catch((erro) => Alert.alert('Erro', erro.message));
  }

  async function buscarPorFonte() {
    const query = new URLSearchParams({ fonte: fonteFiltro });
    await fetch(`${API_URL}/api/noticias/fonte?${query}`)
      .then((resposta) => resposta.json())
      .then((resultado) => setNoticias(resultado))
      .catch((erro) => Alert.alert('Erro', erro.message));
  }

  async function buscarPorCategoria() {
    const query = new URLSearchParams({ categoria: categoriaFiltro });
    await fetch(`${API_URL}/api/noticias/categoria?${query}`)
      .then((resposta) => resposta.json())
      .then((resultado) => setNoticias(resultado))
      .catch((erro) => Alert.alert('Erro', erro.message));
  }

  async function apagarNoticia(id) {
    await fetch(`${API_URL}/api/noticias/${id}`, { method: 'DELETE' })
      .then((resposta) => resposta.json())
      .then(() => {
        buscarTodasNoticias();
      })
      .catch((erro) => {
        Alert.alert('Erro ao apagar', erro.message);
      });
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.titulo}>Cadastrar nova fonte</Text>
        <TextInput
          style={styles.input}
          placeholder="Cole o link do feed aqui"
          value={endereco}
          onChangeText={setEndereco}
        />
        <Button title="Cadastrar fonte" onPress={() => cadastrarFeed(endereco)} />

        <Text style={styles.titulo}>Filtrar por fonte</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome da fonte"
          value={fonteFiltro}
          onChangeText={setFonteFiltro}
        />
        <Button title="Filtrar por fonte" onPress={buscarPorFonte} />

        <Text style={styles.titulo}>Filtrar por categoria</Text>
        <TextInput
          style={styles.input}
          placeholder="Categoria"
          value={categoriaFiltro}
          onChangeText={setCategoriaFiltro}
        />
        <Button title="Filtrar por categoria" onPress={buscarPorCategoria} />

        <Pressable style={styles.textoNoticias} title="Ver todas as notícias" onPress={buscarTodasNoticias}>
          <Text style={styles.da}>Ver todas as notícias</Text>
        </Pressable>

        <Text style={styles.titulo}>Notícias</Text>

        {noticias.map((noticia) => (
          <View key={noticia.id} style={styles.linha}>

            <Text>{noticia.titulo}</Text>

            <Text>Fonte: {noticia.fonte}</Text>

            <Text>Categorias: {noticia.categorias}</Text>

            <Pressable style={styles.botaoApagar} onPress={() => apagarNoticia(noticia.id)}>
              <Text style={styles.textoBotao}>DELETE</Text>
            </Pressable>

          </View>
        ))}
      </ScrollView>
      <StatusBar style="auto"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(64, 64, 64)',
    padding: '16px'
  },
  titulo: {
    fontWeight: 'bold',
    marginTop: '16px',
    marginBottom: '4px'
  },
  input: {
    backgroundColor: '#fff',
    padding: '8px',
    borderRadius: '4px',
    marginBottom: '6px'
  },
  linha: {
    backgroundColor: '#fff',
    padding: '8px',
    borderRadius: '4px',
    marginBottom: '6px',
    borderColor: 'pink',
    borderWidth: '5px'
  },
  botaoApagar: {
    backgroundColor: 'black',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '4px',
    alignItems: 'center',
    borderColor: '#eb0808',
    borderWidth: '5px'
  },
  textoBotao: {
    color: '#eb0808',
    fontWeight: 'bold',
    shadowColor: 'white',
    textShadowColor: 'white'
  },
  textoNoticias: {
    backgroundColor: '#1058b0',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '100px',
    alignItems: 'center'
  }
});