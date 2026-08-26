import { useEffect, useState } from 'react';

import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';


const API_URL = 'http://localhost:3451';


export default function App() {

  const [noticias, setNoticias] = useState([]);
  const [fontes, setFontes] = useState([]);                                                               
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [fonteSelecionada, setFonteSelecionada] = useState('');
  const [nomeFonte, setNomeFonte] = useState('');
  const [enderecoFonte, setEnderecoFonte] = useState('');
  const [carregando, setCarregando] = useState(false);


  
  //CARREGAR FONTES

  async function carregarFontes() {

    try {

      const resposta = await fetch(
        `${API_URL}/api/fontes/`
      );

      const dados = await resposta.json();

      setFontes(dados.fontes);

    } catch (erro) {

      console.error(
        'Erro ao buscar fontes:',
        erro
      );

    }

  }


  //CARREGAR NOTÍCIAS

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
          encodeURIComponent(
            fonteSelecionada
          );
          

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


  //CADASTRAR FONTE

  async function cadastrarFonte() {

    if (!enderecoFonte) {

      alert(
        'Preencha o link da fonte.'
      );

      return;

    }


    try {

      const query = new URLSearchParams({
        link: enderecoFonte,
      });

      const resposta = await fetch(
        `${API_URL}/api/fontes/cadastrar?${query}`,
      )
       const dados = await resposta.json();


      if (!resposta.ok) {

        alert(
          dados.error ||
          dados.erro ||
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

 //DELETAR FONTES

  async function apagarFonte(id) {

    try {

      const resposta = await fetch(
        `${API_URL}/api/fontes/${id}`,
        { method: 'DELETE' }
      ); 
      
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

    }catch (erro) {
      
      console.error(
        'Erro ao apagar fonte:', erro);
      alert('Não foi possível conectar ao servidor.');      
    }
  }
  //CARREGAMENTO

  useEffect(() => {

    carregarFontes();
    carregarNoticias();

  }, []);


  //ATUALIZAR NOTÍCIAS QUANDO O FILTRO MUDAR

  useEffect(() => {

    carregarNoticias();

  }, [
    categoriaSelecionada,
    fonteSelecionada
  ]);


  //CATEGORIAS

  const categorias = [

    'Esportes',
    'Tecnologia',
    'Ciência',
    'Saúde',
    'Cultura',
    'Política',                                                           
    'Economia',
    'Mundo'
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

        {/*GERENCIAR FONTES*/}

          <View style={styles.card}>

          <Text style={styles.subtitulo}>
            Gerenciar fontes
          </Text>

            {fontes.length === 0 ? (

            <Text>
              Nenhuma fonte cadastrada.
            </Text>

          ) : (

            fontes.map(
              (fonte) => (

                <View 
                key={fonte.id}
                style={styles.linhaFonte}
                >

               <Text style={styles.nomeFonteGerenciar}>
                 {fonte.titulo}
               </Text>

                <TouchableOpacity
                  style={styles.botaoApagarFonte}
                  onPress={() => apagarFonte(fonte.id)}
                >

                  <Text style={styles.textoBotaoApagarFonte}>
                    Apagar
                  </Text>
                </TouchableOpacity>
                </View>
              )
            )

          )}

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
                    fonte.titulo

                      ? styles.filtroSelecionado

                      : styles.filtro
                  }

                  onPress={() => {

                    setFonteSelecionada(
                      fonte.titulo  
                    );

                    setCategoriaSelecionada('');

                  }}
                >

                  <Text>
                    {fonte.titulo}
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

                  {noticia.categorias}

                </Text>


                {/*FONTE DE CADA NOTÍCIA*/}

                <Text
                  style={styles.fonteNoticia}
                >

                  Fonte: {noticia.fonte}

                </Text>


                {/*DESCRIÇÃO DAS NOTÍCIAS*/}

                <Text
                  style={styles.descricao}
                >

                  {noticia.descricao}

                </Text>


                {/*DATA DE PUBLICAÇÃO*/}

                <Text
                  style={styles.data}
                >

                  {noticia.dataDePublicacao}

                </Text>


                {/*LINK DAS FONTES E NOTÍCIAS*/}

                <TouchableOpacity

                  style={styles.botaoNoticia}

                  onPress={() =>
                    Linking.openURL(
                      noticia.endereco_noticia
                    )
                  }

                >

                  <Text
                    style={
                      styles.textoBotaoNoticia
                    }
                  >

                    Clique para ver a notícia completa

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
   alignSelf: 'center',                  

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

    backgroundColor: '#313131',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',

  },


  textoBotaoNoticia: {
    
    color: '#ffffff',
    fontWeight: 'bold',

  },

linhaFonte: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,

},

nomeFonteGerenciar: {
  fontSize: 16,
  flex: 1,
},

botaoApagarFonte: {
  backgroundColor: '#313131',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 6,
},

textoBotaoApagarFonte: {
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: 13,
},

});
