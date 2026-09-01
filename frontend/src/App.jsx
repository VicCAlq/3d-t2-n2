import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

import CadastrarFontes from './CadastrarFontes';
import GerenciarFontes from './GerenciarFontes';
import FiltrarNoticias from './FiltrarNoticias';
import ListaDeNoticias from './ListaDeNoticias';


const API_URL = 'http://localhost:3451';

export default function App() {

  const [listaDeNoticias, setListaDeNoticias] = useState([]);
  const [listaDeFontes, setListaDeFontes] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroFonte, setFiltroFonte] = useState('');
  const [linkDigitado, setLinkDigitado] = useState('');
  const [buscandoDados, setBuscandoDados] = useState(false);

  async function carregarFontes() {
    try {
      const resposta = await fetch(`${API_URL}/api/fontes/`);
      const dados = await resposta.json();
      setListaDeFontes(dados.fontes);

    } catch (erro) {
      console.error('Erro ao buscar fontes:', erro);
    }
  }

  async function carregarNoticias() {
    setBuscandoDados(true);

    try {
      let url = `${API_URL}/api/noticias`;
      if (filtroCategoria) {
        url = `${API_URL}/api/noticias/categoria/` + encodeURIComponent(filtroCategoria);
      } else if (filtroFonte) {
        url = `${API_URL}/api/noticias/fonte/` + encodeURIComponent(filtroFonte);
      }
      const resposta = await fetch(url);
      const dados = await resposta.json();
      setListaDeNoticias(dados);

    } catch (erro) {
      console.error('Erro ao buscar notícias:', erro);
    } finally {
      setBuscandoDados(false);
    }
  }

  async function cadastrarFonte() {
    if (!linkDigitado) {
      alert('Preencha o link da fonte.');
      return;
    }

    try {
      const query = new URLSearchParams({ link: linkDigitado });
      const resposta = await fetch(`${API_URL}/api/fontes/cadastrar?${query}`);
      const dados = await resposta.json();
      if (!resposta.ok) {
        alert(dados.error || dados.erro || 'Erro ao cadastrar fonte.');
        return;
      }

      alert('Fonte cadastrada com sucesso!');
      setLinkDigitado('');
      await carregarFontes();
      await carregarNoticias();

    } catch (erro) {
      console.error('Erro ao cadastrar fonte:', erro);
      alert('Não foi possível conectar ao servidor.');
    }
  }

  async function apagarFonte(id) {

    try {
      const resposta = await fetch(`${API_URL}/api/fontes/${id}`, { method: 'DELETE' });
      const dados = await resposta.json();
      if (!resposta.ok) {
        alert(dados.erro || 'Erro ao apagar fonte.');
        return;
      }
      if (filtroFonte) {
        setFiltroFonte('');
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
  }, [filtroCategoria, filtroFonte]);

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
        <CadastrarFontes
          linkDigitado={linkDigitado}
          setLinkDigitado={setLinkDigitado}
          onCadastrar={cadastrarFonte}
        />
        <GerenciarFontes
          listaDeFontes={listaDeFontes}
          onApagar={apagarFonte}
        />
        <FiltrarNoticias
          categorias={categorias}
          listaDeFontes={listaDeFontes}
          filtroCategoria={filtroCategoria}
          filtroFonte={filtroFonte}
          setFiltroCategoria={setFiltroCategoria}
          setFiltroFonte={setFiltroFonte}
        />
        <Text style={styles.subtitulo}>
          Notícias
        </Text>
        <ListaDeNoticias
          listaDeNoticias={listaDeNoticias}
          buscandoDados={buscandoDados}
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
