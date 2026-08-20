import { StatusBar } from 'expo-status-bar';
import { useState,  useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput} from 'react-native';

export default function App() {

  const [tabelaNoticias, setTabelaNoticias] = useState([]);
  const [endereco, setEndereco] = useState("");
  const [fonte, setFonte] = useState("");
  const [categoria, setCategoria] = useState("");
  const [filtro, setFiltro] = useState("");
  const [erro, setErro] = useState("");

    const categorias = [
    "politica",
    "esportes",
    "tecnologia",
    "economia"
  ];


  async function cadastrarFeed(url) {
    const query = new URLSearchParams({link: url})
    await fetch(`http://localhost:3000/api/fontes/cadastrar?${query}`)
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }
      return resposta.json()
    })
    .then((resultado) => {

        console.log(resultado);
        setEndereco("");
        setErro("");
        carregarNoticias();
    })
    .catch((erro) => {

        console.log(erro);
        setErro(
          "Não foi possível reconhecer a fonte, verifique e tente novamente"
        );

    })
  }

  async function carregarNoticias(fonte) {
    let rota = "http://localhost:3000/api/noticias"
    if (fonte) {
      rota = rota + "/fonte/" + fonte
    }
    await fetch(rota)
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }
      return resposta.json()
    })
    .then((resultado) => {

        setTabelaNoticias(resultado);
        setErro("");

    })
    .catch((erro) => {
              console.log(erro);

        setErro(
          "Não foi possível carregar as notícias, tente novamente."
        );
    })
  }

  async function filtrarPorFonte(nomeFonte) {
    const rota = "http://localhost:3000/api/noticias/fonte" + nomeFonte

    await fetch(rota)
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }
      return resposta.json()
    })
    .then((resultado) => {

        setTabelaNoticias(resultado);
        setFonte(nomeFonte);
        setErro("");

    })
    .catch((erro) => {

        console.log(erro);
        setErro(
          "Não foi possível encontrar fonte"
        );

    })
  }

async function filtrarPorCategoria(nomeCategoria) {
    const rota = "http://localhost:3000/api/noticias/categoria" + nomeCategoria

    await fetch(rota)
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }
      return resposta.json()
    })
    .then((resultado) => {

        setTabelaNoticias(resultado);
        setCategoria(nomeCategoria);
        setErro("");


    })
    .catch((erro) => {

        console.log(erro);
        setErro(
          "Não foi possível encontrar categoria."
        );

    })
  }

  useEffect(() => {
  carregarNoticias();
},[]);

  return (
    <View style={styles.principal}>

      <View style={styles.topo}></View>
           
      <View style={styles.formulario}>

        <Text style={styles.subtitulo}>
          Cadastrar nova fonte
        </Text>

        <TextInput style={styles.input}
          value={endereco}
          onChangeText={setEndereco}
        />

        <Pressable style={styles.botaoCadastrar} onPress={() => cadastrarFeed(endereco)}>
          <Text style={styles.textoBotao}>
            Cadastrar fonte
          </Text>
        </Pressable>

      </View>
     
      <View style={styles.topoFiltros}>
          <Pressable style={styles.botao}
            onPress={() => setFiltro("categoria")}>
            <Text style={styles.texto}>Categoria ▼</Text>
          </Pressable>
        
          <Pressable style={styles.botao}
          onPress={() => setFiltro("fonte")}>
            <Text style={styles.texto}>Fonte ▼</Text>
          </Pressable>
      </View>

{filtro === "categoria" && (<View style={styles.menuFiltro}>

    <Text style={styles.subtitulo}>
      Escolha uma categoria:
    </Text>

    {categorias.map((categoria) => (
      <Pressable key={categoria} style={styles.opcao}
        onPress={() => filtrarPorCategoria(categoria)
        }>

        <Text>
          {categoria}
        </Text>
      </Pressable>

    ))}

    </View>)}

  {filtro === "fonte" && (<View style={styles.menuFiltro}>

          <Text style={styles.subtitulo}>
            Filtrar por fonte:
          </Text>


          <TextInput style={styles.input} value={fonte} onChangeText={setFonte}/>


          <Pressable style={styles.botaoPesquisar}
           onPress={() => filtrarPorFonte(fonte)}
          >

            <Text style={styles.textoBotao}>
              Pesquisar
            </Text>

          </Pressable>

        </View>

      )}


<View style={styles.lista}>
         {tabelaNoticias.map((noticia) => (

            <View key={noticia.id} style={styles.noticia}>

              <Text style={styles.tituloNoticia}>
                {noticia.titulo}
              </Text>


              <Text style={styles.descricao}>
                {noticia.descricao}
              </Text>


              <Text style={styles.informacao}>
                Fonte: {noticia.fonte}
              </Text>


              <Text style={styles.informacao}>
                Categoria: {noticia.categoria}
              </Text>

              </View>))}

</View>


    </View>
  );
}



const styles = StyleSheet.create({
  principal: {
    flex: 1,
    backgroundColor: "#eec",
    height: '100%',
    width: '100%'
  },

    topo: {
    width: "100%",
    height: "10%",
    backgroundColor: "yellow",
    justifyContent: "center",
    alignItems: "center",
  },

    titulo: {
    fontSize: 24,
    fontWeight: "bold",
  },

  formulario: {
    padding: 15,
    backgroundColor: "white",
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  botaoCadastrar: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#008000",
    alignItems: "center",
  },

  topoFiltros: {
    width: "100%",
    padding: 10,
    backgroundColor: "yellow",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  texto: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

   botao: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2f00ff",
  },

   textoBotao: {

    color: "white",
    fontSize: 15
  },

input: {
  borderWidth: 1,
  borderColor: "#999",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  marginBottom: 10,
}

});
