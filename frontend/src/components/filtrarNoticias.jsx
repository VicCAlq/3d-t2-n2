import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function FiltrosNoticias({
  categorias,
  fontes,
  categoriaSelecionada,
  fonteSelecionada,
  setCategoriaSelecionada,
  setFonteSelecionada,
}) {

  return (
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

        {categorias.map(
          (categoria) => (

            <TouchableOpacity
              key={categoria}
              style={
                categoriaSelecionada === categoria
                  ? styles.filtroSelecionado
                  : styles.filtro
              }
              onPress={() => {
                setCategoriaSelecionada(categoria);
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

        {fontes.map(
          (fonte) => (

            <TouchableOpacity
              key={fonte.id}
              style={
                fonteSelecionada === fonte.titulo
                  ? styles.filtroSelecionado
                  : styles.filtro
              }
              onPress={() => {
                setFonteSelecionada(fonte.titulo);
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
  );
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

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

});
