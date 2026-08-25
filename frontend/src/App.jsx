import { useEffect, useState } from 'react';

import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';


const API_URL = 'http://localhost:8081';


export default function App() {

  const [noticias, setNoticias] = useState([]);
  const [fontes, setFontes] = useState([]);                                                               
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [fonteSelecionada, setFonteSelecionada] = useState('');
  const [nomeFonte, setNomeFonte] = useState('');
  const [enderecoFonte, setEnderecoFonte] = useState('');
  const [carregando, setCarregando] = useState(false);


  
  // CARREGAR FONTES

  async function carregarFontes() {

    try {

      const resposta = await fetch(
        `${API_URL}/api/fontes`
      );

      const dados = await resposta.json();

      setFontes(dados);

    } catch (erro) {

      console.error(
        'Erro ao buscar fontes:',
        erro
      );

    }

  }


  // CARREGAR NOTÍCIAS

  async function carregarNoticias() {

    setCarregando(true);

    try {

      let url = `${API_URL}/api/noticias`;


      if (categoriaSelecionada) {

        url =
          `${API_URL}/api/noticias/categoria/` +
          encodeURIComponent(
            categoriaSelecionada
          );

      } else if (fonteSelecionada) {

        url =
          `${API_URL}/api/noticias/fonte/` +
          fonteSelecionada;

      }


      const resposta = await fetch(url);

      const dados = await resposta.json();

      setNoticias(dados);

    } catch (erro) {

      console.error(
        'Erro ao buscar notícias:',
        erro
      );

    } finally {

      setCarregando(false);

    }

  }


  // CADASTRAR FONTE

  async function cadastrarFonte() {

    if (!nomeFonte || !enderecoFonte) {

      alert(
        'Preencha o nome e o endereço da fonte.'
      );

      return;

    }


    try {

      const resposta = await fetch(
        `${API_URL}/api/fontes`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            nome: nomeFonte,
            endereco: enderecoFonte,
          }),

        }
      );


      const dados = await resposta.json();


      if (!resposta.ok) {

        alert(
          dados.message ||
          'Erro ao cadastrar fonte.'
        );

        return;

      }


      alert(
        'Fonte cadastrada com sucesso!'
      );


      setNomeFonte('');
      setEnderecoFonte('');


      await carregarFontes();

      await carregarNoticias();


    } catch (erro) {

      console.error(
        'Erro ao cadastrar fonte:',
        erro
      );

      alert(
        'Não foi possível conectar ao servidor.'
      );

    }

  }


  // CARREGAMENTO INICIAL

  useEffect(() => {

    carregarFontes();
    carregarNoticias();

  }, []);


  // ATUALIZAR NOTÍCIAS QUANDO O FILTRO MUDAR

  useEffect(() => {

    carregarNoticias();

  }, [
    categoriaSelecionada,
    fonteSelecionada
  ]);


  // CATEGORIAS

  const categorias = [

    'Política',
    'Economia',
    'Esportes',
    'Tecnologia',
    'Ciência',
    'Saúde',
    'Cultura',
    'Mundo',

  ];


  return (

    <ScrollView style={styles.tela}>

      <View style={styles.container}>


        {/*TÍTULO*/}

        <Text style={styles.titulo}>
          T3 Notícias
        </Text>


        {/* CADASTRAR FONTE*/}

        <View style={styles.card}>

          <Text style={styles.subtitulo}>
            Cadastrar nova fonte
          </Text>


          <TextInput
            style={styles.input}

            placeholder="Nome da fonte"

            value={nomeFonte}

            onChangeText={setNomeFonte}
          />


          <TextInput
            style={styles.input}

            placeholder="Link da fonte"

            value={enderecoFonte}

            onChangeText={setEnderecoFonte}

            autoCapitalize="none"

            keyboardType="url"
          />


          <TouchableOpacity
            style={styles.botao}

            onPress={cadastrarFonte}
          >

            <Text style={styles.textoBotao}>
              Adicionar fonte
            </Text>

          </TouchableOpacity>

        </View>



        {/*FILTROS*/}

        <View style={styles.card}>

          <Text style={styles.subtitulo}>
            Filtrar notícias
          </Text>


          {/*CATEGORIA*/}

          <Text style={styles.label}>
            Categoria
          </Text>


          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtros}
          >


            {/*TODAS*/}

            <TouchableOpacity
              style={
                categoriaSelecionada === ''
                  ? styles.filtroSelecionado
                  : styles.filtro
              }

              onPress={() => {

                setCategoriaSelecionada('');
                setFonteSelecionada('');

              }}
            >

              <Text>
                Todas
              </Text>

            </TouchableOpacity>


            {/*CATEGORIAS*/}

            {categorias.map(
              (categoria) => (

                <TouchableOpacity
                  key={categoria}

                  style={
                    categoriaSelecionada ===
                    categoria

                      ? styles.filtroSelecionado

                      : styles.filtro
                  }

                  onPress={() => {

                    setCategoriaSelecionada(
                      categoria
                    );

                    setFonteSelecionada('');

                  }}
                >

                  <Text>
                    {categoria}
                  </Text>

                </TouchableOpacity>

              )
            )}

          </ScrollView>



          {/*FONTE*/}

          <Text style={styles.label}>
            Fonte
          </Text>


          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtros}
          >


            {/*TODAS*/}

            <TouchableOpacity
              style={
                fonteSelecionada === ''
                  ? styles.filtroSelecionado
                  : styles.filtro
              }

              onPress={() => {

                setFonteSelecionada('');
                setCategoriaSelecionada('');

              }}
            >

              <Text>
                Todas
              </Text>

            </TouchableOpacity>


            {/*FONTES*/}

            {fontes.map(
              (fonte) => (

                <TouchableOpacity
                  key={fonte.id}

                  style={
                    fonteSelecionada ===
                    String(fonte.id)

                      ? styles.filtroSelecionado

                      : styles.filtro
                  }

                  onPress={() => {

                    setFonteSelecionada(
                      String(fonte.id)
                    );

                    setCategoriaSelecionada('');

                  }}
                >

                  <Text>
                    {fonte.nome}
                  </Text>

                </TouchableOpacity>

              )
            )}

          </ScrollView>

        </View>



        {/*NOTÍCIAS*/}

        <Text style={styles.subtitulo}>
          Notícias
        </Text>


        {carregando ? (

          <ActivityIndicator
            size="large"
          />

        ) : noticias.length === 0 ? (

          <View style={styles.card}>

            <Text>
              Nenhuma notícia encontrada.
            </Text>

          </View>

        ) : (

          noticias.map(
            (noticia) => (

              <View
                key={noticia.id}
                style={styles.noticia}
              >


                {/*TÍTULO*/}

                <Text
                  style={styles.tituloNoticia}
                >

                  {noticia.titulo}

                </Text>


                {/*CATEGORIA*/}

                <Text
                  style={styles.categoriaNoticia}
                >

                  {noticia.categoria}

                </Text>


                {/*FONTE*/}

                <Text
                  style={styles.fonteNoticia}
                >

                  Fonte: {noticia.fonte_nome}

                </Text>


                {/*DESCRIÇÃO*/}

                <Text
                  style={styles.descricao}
                >

                  {noticia.descricao}

                </Text>


                {/*DATA*/}

                <Text
                  style={styles.data}
                >

                  {noticia.dataPublicacao}

                </Text>


                {/*LINK*/}

                <TouchableOpacity

                  style={styles.botaoNoticia}

                  onPress={() =>
                    Linking.openURL(
                      noticia.link
                    )
                  }

                >

                  <Text
                    style={
                      styles.textoBotaoNoticia
                    }
                  >

                    Ler notícia completa

                  </Text>

                </TouchableOpacity>


              </View>

            )
          )

        )}

      </View>

    </ScrollView>

  );

}



const styles = StyleSheet.create({


  //TELA

  tela: {

    flex: 1,
    backgroundColor: '#050101a9',

  },


  //CONTAINER

  container: {

    padding: 20,
    paddingTop: 50,

  },


  //TÍTULOS

  titulo: {

    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',

  },


  subtitulo: {
    
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,

  },


  //CARDS

  card: {

    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,

  },


  // INPUTS

  input: {

    borderWidth: 1,
    borderColor: '#aaaaaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',

  },


  // BOTÃO CADASTRAR

  botao: {

    backgroundColor: '#333333',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',

  },


  textoBotao: {

    color: '#ffffff',
    fontWeight: 'bold',

  },


  // FILTROS

  label: {

    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 5,

  },


  filtros: {

    marginBottom: 15,

  },


  filtro: {

    padding: 10,

    borderWidth: 1,

    borderColor: '#aaaaaa',

    borderRadius: 8,

    marginRight: 8,

    backgroundColor: '#ffffff',

  },


  filtroSelecionado: {

    padding: 10,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#cccccc',

  },


  // NOTÍCIAS

  noticia: {

    backgroundColor: '#ffffff',

    padding: 15,
    borderRadius: 10,
    marginBottom: 15,

  },


  tituloNoticia: {

    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,

  },


  categoriaNoticia: {

    fontWeight: 'bold',
    marginBottom: 5,

  },


  fonteNoticia: {

    fontSize: 14,
    marginBottom: 8,

  },


  descricao: {

    fontSize: 15,
    marginBottom: 8,

  },


  data: {

    fontSize: 12,
    color: '#666666',

  },


  // BOTÃO DA NOTÍCIA

  botaoNoticia: {

    backgroundColor: '#8b0000',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',

  },


  textoBotaoNoticia: {
    
    color: '#ffffff',
    fontWeight: 'bold',

  },

});
