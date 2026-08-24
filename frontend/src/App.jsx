import { StatusBar } from 'expo-status-bar';
import { useState,  useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView} from 'react-native';

export default function App() {

  const [tabelaNoticias, setTabelaNoticias] = useState([]);
  const [endereco, setEndereco] = useState("");
  const [fontes, setFontes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [erroCadastro, setErroCadastro] = useState("");


  async function cadastrarFeed(url) {

    try {
    new URL(url);
    }catch (erro) {
    setEndereco("");
    setErroCadastro("URL inválida");

//pesquisei sobre
    setTimeout(() => {
    setErroCadastro("");
  }, 1000);
    return;
  }

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
        setErroCadastro("");
        carregarNoticias();
    })
  
    .catch((erro) => {

        console.log(erro);
        setEndereco("");
        setErroCadastro("URL inválida");

    //pesquisei sobre
        setTimeout(() => {
        setErroCadastro("");
        }, 1000);

    })
  }

  async function carregarNoticias(fonte) {
    let rota = "http://localhost:3000/api/noticias"
  
    await fetch(rota)
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }
      return resposta.json()
    })
    .then((resultado) => {
     setTabelaNoticias(resultado);
    

    })
    .catch((erro) => {
              console.log(erro);
        
    })
  }

  async function carregarCategorias() {
    await fetch("http://localhost:3000/api/categorias/")
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }

      return resposta.json()
    })
    .then((resultado) => {
      setCategorias(resultado.categorias)
     
    })
    .catch((erro) => {
      console.log(erro)

     
    })
 }

  async function carregarFontes() {
    await fetch("http://localhost:3000/api/fontes/")
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }

      return resposta.json()
    })
    .then((resultado) => {
      setFontes(resultado.fontes)
      
    })
    .catch((erro) => {
      console.log(erro)

    
    })
  }

  async function filtrarPorFonte(nomeFonte) {
    const rota = "http://localhost:3000/api/noticias/fonte/" + nomeFonte;

    await fetch(rota)
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }
      return resposta.json()
    })
    .then((resultado) => {

        setTabelaNoticias(resultado);
        setFiltro("");
       

    })
    .catch((erro) => {

        console.log(erro);
     

    })
  }

  async function filtrarPorCategoria(nomeCategoria) {
    const rota = "http://localhost:3000/api/noticias/categoria/" + nomeCategoria;

    await fetch(rota)
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }
      return resposta.json()
    })
    .then((resultado) => {

        setTabelaNoticias(resultado.noticias);
        setFiltro("");

    })
    .catch((erro) => {
      console.log(erro);

    })
  }


  async function voltarTodasNoticias() {
  await carregarNoticias();
  setFiltro("");
}

  useEffect(() => {
    carregarNoticias();
    carregarCategorias();
    carregarFontes();
},[]);

  return (

<View style={styles.principal}>

  <View style={styles.topo}>
  <Text style={styles.titulo}>Mais Mais Notícias</Text>
  </View>

  <ScrollView>

  <View style={styles.cadastrar}>

    <Text style={styles.subtitulo}>
    Cadastrar nova fonte
    </Text>

    <View style={styles.linkCadastro}>

    <TextInput
    style={styles.input}
    value={endereco}
    onChangeText={setEndereco}

//pesquisei
    placeholder= {erroCadastro || "Digite o link da fonte"}
    placeholderTextColor={erroCadastro ? "#ee0010" : "#000000"}/>

    <Pressable
    style={styles.botaoCadastrar}
    onPress={() => cadastrarFeed(endereco)}>

    <Text style={styles.textoBotao}>Cadastrar Fonte</Text>
    </Pressable>

    </View>

  </View>
     
  <View style={styles.topoFiltros}>

    <Pressable style={styles.botao}
    onPress={voltarTodasNoticias}>

    <Text style={styles.texto}>Todas</Text>
    </Pressable>

          
    <Pressable style={[
    styles.botao, filtro === "categoria" && styles.botaoSelecionado]}

    onPress={() => { 
      if (filtro === "categoria") {
        setFiltro("");
      } else {
        setFiltro("categoria");
      }
}}>

    <Text style={styles.texto}>Categoria ▼</Text>
    </Pressable>
        
    <Pressable style={[
    styles.botao, filtro === "fonte" && styles.botaoSelecionado]}
    onPress={() => { 
      if (filtro === "fonte") {
        setFiltro("");
      } else {
        setFiltro("fonte");
      }
}}>

    <Text style={styles.texto}>Fonte ▼</Text>
    </Pressable>

  </View>

  {filtro === "categoria" && (
    <View style={styles.menuCategoria}>

    <Text style={styles.tituloFiltro}>
      Escolha uma categoria:
    </Text>

    <ScrollView style={styles.listaFiltro}>
    {categorias.map((categoria) => (
    <Pressable key={categoria} style={styles.opcao}
    onPress={() => filtrarPorCategoria(categoria)}>

    <Text>{categoria}</Text>
    </Pressable>
    ))}

    </ScrollView>

    </View>)}
    
  {filtro === "fonte" && (<View style={styles.menuFonte}>

    <Text style={styles.tituloFiltro}>
      Filtrar por fonte:
    </Text>
    
    <ScrollView style={styles.listaFiltro}>
    {fontes.map((fonte) => (
      <Pressable
        key={fonte.id}
        style={styles.opcao}
        onPress={() => filtrarPorFonte(fonte.titulo)}
      >
        <Text>{fonte.titulo}</Text>
      </Pressable>

    ))}

    </ScrollView>

    </View>

  )}


  <ScrollView style={styles.lista}>
    {tabelaNoticias.map((noticia) => (

    <View key={noticia.id} style={styles.noticia}>

    <Text style={styles.tituloNoticia}>
      {noticia.nome_noticia}
    </Text>

    <Text style={styles.descricao}>
      {noticia.descricao}
    </Text>

    <Text style={styles.informacao}>
      Fonte: {noticia.fonte}
    </Text>

    <Text style={styles.informacao}>
      Categoria: {noticia.categorias}
    </Text>

    </View>))}

  </ScrollView>

  </ScrollView>

</View>

);}



const styles = StyleSheet.create({
  principal: {
    flex: 1,
    backgroundColor: "rgb(240, 233, 192)",
    height: '100%',
    width: '100%'
  },

    topo: {
    width: "100%",
    height: "7%",
    backgroundColor: "rgb(29, 172, 211)",
    justifyContent: "center",
    alignItems: "center",
  },

    titulo: {
    fontSize: 30,
    fontWeight: "bold",
  },

   cadastrar: {
  paddingHorizontal: 15,
  paddingTop: 15,
  paddingBottom: 12,
  backgroundColor: "rgb(240, 233, 192)",
},

    linkCadastro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

    subtitulo: {
    color: "black",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 17,
  },

    botaoCadastrar: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    borderColor: "rgb(165, 163, 163)",
    borderWidth: 1,
    backgroundColor: "rgb(29, 172, 211)",
    alignItems: "center",
    flexDirection: "row",
  },

    topoFiltros: {
    width: "100%",
    padding: 5,
    borderWidth: 1,
    borderColor: "rgb(165, 163, 163)",
    borderRadius: 100,
    backgroundColor: "rgb(240, 233, 192)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

    texto: {
    color: "white",
    fontSize: 14,
    fontWeight: "400",
  },

    botao: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgb(165, 163, 163)",
    backgroundColor: "rgb(29, 172, 211)",
  },

    textoBotao: {
    color: "white",
    fontSize: 15
  },

    botaoSelecionado: {
    backgroundColor: "#1a008f",
  },

input: {
  flex: 1,
  height: 42,
  borderWidth: 1,
  borderColor: "rgb(165, 163, 163)",
  borderRadius: 22,
  paddingHorizontal: 15,
  backgroundColor: "white",
  fontSize: 14,
},

 menuCategoria: {
  backgroundColor: "white",
  padding: 15,
  marginTop: 10,
  marginLeft: 15,
  borderRadius: 15,
  width: 250,
  elevation: 5,
},
menuFonte: {
  backgroundColor: "white",
  padding: 15,
  marginTop: 10,
  marginRight: 15,
  borderRadius: 15,
  width: 250,
  alignSelf: "flex-end",
  elevation: 5,
},

tituloFiltro: {
  color: "black",
  fontSize: 17,
  fontWeight: "bold",
  marginBottom: 8,
},

    opcao: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1a008f",
  },

    lista: {
    padding: 20,
  },

    noticia: {
    backgroundColor: "white",
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
  },

    tituloNoticia: {
    fontSize: 18,
    fontWeight: "bold",
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


});
