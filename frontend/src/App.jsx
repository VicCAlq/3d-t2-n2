import { StatusBar } from 'expo-status-bar'
import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native'
const API_URL = 'http://localhost:3451'

export default function App() {
  const [noticias, setNoticias] = useState([])
  const [fontes, setFontes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [endereco, setEndereco] = useState('')
  const [erroCadastro, setErroCadastro] = useState('')
  const [filtro, setFiltro] = useState('')

  async function cadastrarFeed(url) {
    try {
      new URL(url)
    } catch {
      setEndereco('')
      setErroCadastro('URL inválida')
      setTimeout(() => setErroCadastro(''), 1500)
      return
    }

    const query = new URLSearchParams({ link: url })
    await fetch(`${API_URL}/api/fontes/cadastrar?${query}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`)
        return resposta.json()
      })
      .then(() => {
        setEndereco('')
        setErroCadastro('')
        carregarNoticias()
        carregarFontes()
      })
      .catch(() => {
        setEndereco('')
        setErroCadastro('Não foi possível cadastrar essa fonte')
        setTimeout(() => setErroCadastro(''), 1500)
      })
  }

  async function carregarNoticias() {
    await fetch(`${API_URL}/api/noticias`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`)
        return resposta.json()
      })
      .then((resultado) => {
        setNoticias(resultado)
        // como o backend não tem uma rota própria de categorias,
        // a gente monta a lista a partir das notícias que já vieram
        const conjunto = new Set()
        resultado.forEach((n) => {
          (n.categorias || '').split(',').map((c) => c.trim()).filter(Boolean).forEach((c) => conjunto.add(c))
        })
        setCategorias(Array.from(conjunto))
      })
      .catch((erro) => console.log(erro))
  }

  async function carregarFontes() {
    await fetch(`${API_URL}/api/fontes`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`)
        return resposta.json()
      })
      .then((resultado) => setFontes(resultado))
      .catch((erro) => console.log(erro))
  }

  async function filtrarPorFonte(nomeFonte) {
    await fetch(`${API_URL}/api/noticias/fonte/${encodeURIComponent(nomeFonte)}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`)
        return resposta.json()
      })
      .then((resultado) => {
        setNoticias(resultado)
        setFiltro('')
      })
      .catch((erro) => console.log(erro))
  }

  async function filtrarPorCategoria(nomeCategoria) {
    await fetch(`${API_URL}/api/noticias/categoria/${encodeURIComponent(nomeCategoria)}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`)
        return resposta.json()
      })
      .then((resultado) => {
        setNoticias(resultado)
        setFiltro('')
      })
      .catch((erro) => console.log(erro))
  }

  async function voltarTodasNoticias() {
    await carregarNoticias()
    setFiltro('')
  }

  async function apagarNoticia(id) {
    await fetch(`${API_URL}/api/noticias/${id}`, { method: 'DELETE' })
    carregarNoticias()
  }

  async function apagarFonte(id) {
    await fetch(`${API_URL}/api/fontes/${id}`, { method: 'DELETE' })
    carregarFontes()
  }

  useEffect(() => {
    carregarNoticias()
    carregarFontes()
  }, [])

  return (
    <View style={styles.principal}>
      <View style={styles.topo}>
        <Text style={styles.titulo}>Mais Mais Notícias</Text>
      </View>

      <ScrollView>
        <View style={styles.cadastrar}>
          <Text style={styles.subtitulo}>Cadastrar nova fonte</Text>

          <View style={styles.linkCadastro}>
            <TextInput
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
              autoCapitalize="none"
              placeholder={erroCadastro || 'Digite o link do feed RSS da fonte'}
              placeholderTextColor={erroCadastro ? '#ee0010' : '#888'}
            />
            <Pressable style={styles.botaoCadastrar} onPress={() => cadastrarFeed(endereco)}>
              <Text style={styles.textoBotao}>Cadastrar Fonte</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.topoFiltros}>
          <Pressable style={styles.botao} onPress={voltarTodasNoticias}>
            <Text style={styles.texto}>Todas</Text>
          </Pressable>

          <Pressable
            style={[styles.botao, filtro === 'categoria' && styles.botaoSelecionado]}
            onPress={() => setFiltro(filtro === 'categoria' ? '' : 'categoria')}
          >
            <Text style={styles.texto}>Categoria ▼</Text>
          </Pressable>

          <Pressable
            style={[styles.botao, filtro === 'fonte' && styles.botaoSelecionado]}
            onPress={() => setFiltro(filtro === 'fonte' ? '' : 'fonte')}
          >
            <Text style={styles.texto}>Fonte ▼</Text>
          </Pressable>
        </View>

        {filtro === 'categoria' && (
          <View style={styles.menuCategoria}>
            <Text style={styles.tituloFiltro}>Escolha uma categoria:</Text>
            <ScrollView style={styles.listaFiltro}>
              {categorias.length === 0 && <Text style={styles.vazio}>Nenhuma categoria ainda</Text>}
              {categorias.map((categoria) => (
                <Pressable key={categoria} style={styles.opcao} onPress={() => filtrarPorCategoria(categoria)}>
                  <Text>{categoria}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {filtro === 'fonte' && (
          <View style={styles.menuFonte}>
            <Text style={styles.tituloFiltro}>Filtrar por fonte:</Text>
            <ScrollView style={styles.listaFiltro}>
              {fontes.length === 0 && <Text style={styles.vazio}>Nenhuma fonte cadastrada</Text>}
              {fontes.map((fonte) => (
                <View key={fonte.id} style={styles.linhaFonte}>
                  <Pressable style={{ flex: 1 }} onPress={() => filtrarPorFonte(fonte.titulo)}>
                    <Text>{fonte.titulo}</Text>
                  </Pressable>
                  <Pressable onPress={() => apagarFonte(fonte.id)}>
                    <Text style={styles.apagar}>x</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <ScrollView style={styles.lista}>
          {noticias.length === 0 && <Text style={styles.vazio}>Nenhuma notícia encontrada.</Text>}
          {noticias.map((noticia) => (
            <View key={noticia.id} style={styles.noticia}>
              <Text style={styles.tituloNoticia}>{noticia.titulo}</Text>
              <Text style={styles.descricao}>{noticia.descricao}</Text>
              <Text style={styles.informacao}>Fonte: {noticia.fonte}</Text>
              <Text style={styles.informacao}>Categoria: {noticia.categorias}</Text>
              <Pressable onPress={() => apagarNoticia(noticia.id)}>
                <Text style={styles.apagarNoticia}>Apagar</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  principal: {
    flex: 1,
    backgroundColor: 'rgb(14, 54, 60)',
    height: '100%',
    width: '100%',
  },
  topo: {
    width: '100%',
    height: 70,
    backgroundColor: 'rgb(29, 172, 211)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  cadastrar: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 12,
  },
  linkCadastro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subtitulo: {
    color: 'black',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  botaoCadastrar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderColor: 'rgb(165, 163, 163)',
    borderWidth: 1,
    backgroundColor: 'rgb(29, 172, 211)',
    alignItems: 'center',
  },
  topoFiltros: {
    width: '92%',
    alignSelf: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgb(165, 163, 163)',
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  texto: {
    color: 'white',
    fontSize: 14,
  },
  botao: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgb(165, 163, 163)',
    backgroundColor: 'rgb(29, 172, 211)',
  },
  textoBotao: {
    color: 'white',
    fontSize: 14,
  },
  botaoSelecionado: {
    backgroundColor: '#1a008f',
  },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: 'rgb(165, 163, 163)',
    borderRadius: 22,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    fontSize: 14,
  },
  menuCategoria: {
    backgroundColor: 'white',
    padding: 15,
    marginTop: 10,
    marginLeft: 15,
    borderRadius: 15,
    width: 250,
    elevation: 5,
  },
  menuFonte: {
    backgroundColor: 'white',
    padding: 15,
    marginTop: 10,
    marginRight: 15,
    borderRadius: 15,
    width: 250,
    alignSelf: 'flex-end',
    elevation: 5,
  },
  tituloFiltro: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  opcao: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a008f',
  },
  linhaFonte: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a008f',
  },
  lista: {
    padding: 20,
  },
  noticia: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 10,
    borderRadius: 15,
  },
  tituloNoticia: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  descricao: {
    fontSize: 14,
    marginBottom: 8,
  },
  informacao: {
    fontSize: 13,
    marginTop: 3,
  },
  listaFiltro: {
    maxHeight: 220,
  },
  vazio: {
    color: '#0f2039',
    fontStyle: 'italic',
    padding: 8,
  },
  apagar: {
    color: '#ee0010',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  apagarNoticia: {
    color: '#ee0010',
    fontWeight: 'bold',
    marginTop: 6,
  },
})
