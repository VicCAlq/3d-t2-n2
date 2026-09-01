import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

import CadastrarFonte from './CadastrarFonte';
import GerenciarFontes from './GerenciarFontes';
import FiltrosNoticias from './FiltrosNoticias';
import ListaNoticias from './ListaNoticias';


const API_URL = 'http://localhost:3451';

export default function App() {

  const [noticias, setNoticias] = useState([]);
  const [fontes, setFontes] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [fonteSelecionada, setFonteSelecionada] = useState('');
  const [enderecoFonte, setEnderecoFonte] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function carregarFontes() {
    try {
      const resposta = await fetch(`${API_URL}/api/fontes/`);
      const dados = await resposta.json();
      setFontes(dados.fontes);

    } catch (erro) {
      console.error('Erro ao buscar fontes:', erro);
    }

  }

  async function carregarNoticias() {
    setCarregando(true);

    try {
      let url = `${API_URL}/api/noticias`;
      if (categoriaSelecionada) {
        url = `${API_URL}/api/noticias/categoria/` + encodeURIComponent(categoriaSelecionada);
      } else if (fonteSelecionada) {
        url = `${API_URL}/api/noticias/fonte/` + encodeURIComponent(fonteSelecionada);
      }
      const resposta = await fetch(url);
      const dados = await resposta.json();
      setNoticias(dados);

    } catch (erro) {
      console.error('Erro ao buscar notícias:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function cadastrarFonte() {
    if (!enderecoFonte) {
      alert('Preencha o link da fonte.');
      return;
    }

    try {
      const query = new URLSearchParams({ link: enderecoFonte });
      const resposta = await fetch(`${API_URL}/api/fontes/cadastrar?${query}`);
      const dados = await resposta.json();
      if (!resposta.ok) {
        alert(dados.error || dados.erro || 'Erro ao cadastrar fonte.');
        return;
      }

      alert('Fonte cadastrada com sucesso!');
      setEnderecoFonte('');
      await carregarFontes();
      await carregarNoticias();

    } catch (erro) {
      console.error('Erro ao cadastrar fonte:', erro);
      alert('Não foi possível conectar ao servidor.');
    }
  }


  //DELETAR FONTES

  async function apagarFonte(id) {

    try {

      const resposta = await fetch(`${API_URL}/api/fontes/${id}`, { method: 'DELETE' });
      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.erro || 'Erro ao apagar fonte.');
        return;
      }

      if (fonteSelecionada) {
        setFonteSelecionada('');
      }

      await carregarFontes();
      await carregarNoticias();

    } catch (erro) {
      console.error('Erro ao apagar fonte:', erro);
      alert('Não foi possível conectar ao servidor.');
    }

  }

  useEffect(() => {
    carregarFontes();
    carregarNoticias();
  }, []);

  useEffect(() => {
    carregarNoticias();
  }, [categoriaSelecionada, fonteSelecionada]);

  const categorias = [
    'Esportes',
    'Tecnologia',
    'Ciência',
    'Saúde',
    'Cultura',
    'Política',
    'Economia',
    'Mundo',
  ];


  return (

    <ScrollView style={styles.tela}>
      <View style={styles.container}>

        <Text style={styles.titulo}>
          T3 Notícias
        </Text>
        <CadastrarFonte
          enderecoFonte={enderecoFonte}
          setEnderecoFonte={setEnderecoFonte}
          onCadastrar={cadastrarFonte}
        />
        <GerenciarFontes
          fontes={fontes}
          onApagar={apagarFonte}
        />
        <FiltrosNoticias
          categorias={categorias}
          fontes={fontes}
          categoriaSelecionada={categoriaSelecionada}
          fonteSelecionada={fonteSelecionada}
          setCategoriaSelecionada={setCategoriaSelecionada}
          setFonteSelecionada={setFonteSelecionada}
        />
        <Text style={styles.subtitulo}>
          Notícias
        </Text>
        <ListaNoticias
          noticias={noticias}
          carregando={carregando}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  tela: {
    flex: 1,
    backgroundColor: '#050101a9',
  },

  container: {
    padding: 20,
    paddingTop: 50,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
    alignSelf: 'center',
  },

  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#ffffff',
  },

});
