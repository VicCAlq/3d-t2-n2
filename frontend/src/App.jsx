import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Exemplo from './components/Exemplo';

export default function App() {

  const [tabelaNoticias, setTabelaNoticias] = useState()
  const [ endereco, setEndereco ] = useState("")
  const [ fonte, setFonte ] = useState("")
  const [ filtro, setFiltro] = useState("")
  const [categoria, setCategoria] = useState("")

  async function cadastrarFeed(url) {
    const query = new URLSearchParams('link', url)
    await fetch(`http://localhost:3000/api/fontes/cadastrar?${query}`)
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Erro: ${resposta.status}`)
      }
      return resposta.json()
    })
    .then((resultado) => {
      // Aqui você decide como usar o resultado enviado pelo servidor
    })
    .catch((erro) => {
      // Vou usar "window.alert" pra exibir o erro aqui a fim de
      // que fique mais fácil para vocês identificarem se algo der errado
    })
  }

  async function carregarNoticias(fonte) {
    const rota = "http://localhost:3000/api/noticias"
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
      // Aqui você decide como usar o resultado enviado pelo servidor
      setTabelaNoticias(resultado)
    })
    .catch((erro) => {
      // Vou usar "window.alert" pra exibir o erro aqui a fim de
      // que fique mais fácil para vocês identificarem se algo der errado
    })
  }


  return (
    <View style={styles.principal}>
        <View style={styles.topo}> 
           
          <Pressable style={styles.botao}
            onPress={() => setFiltro("categoria")}>
            <Text style={styles.texto}>Categoria V</Text>
          </Pressable>
        
          <Pressable style={styles.botao}
          onPress={() => setFiltro("fonte")}>
            <Text style={styles.texto}>Fonte V</Text>
         
          </Pressable>
      </View>
      <View>
        <Tabela tabela={tabelaNoticias}/>
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

  texto: {
    fontSize: 16,
    fontWeight: "bold",
  },

    topo: {
    width: '100%',
     height: '10%',
    backgroundColor: "yellow",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },

   botao: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2f00ffff",
  },


});
