import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Exemplo from './components/Exemplo';
import React, { useState } from 'react';

export default function App() {

  const [ endereco, setEndereco ] = useState("")

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

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text>Comece aqui seu projeto Mobile</Text>
        <Exemplo>Este é um componente de exemplo</Exemplo>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eec",
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: "#101015"
  }
});
