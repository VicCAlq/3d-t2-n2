import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function FiltrarNoticias({
  categorias,
  listaDeFontes,
  filtroCategoria,
  filtroFonte,
  setFiltroCategoria,
  setFiltroFonte,
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
            filtroCategoria === ''
              ? styles.filtroSelecionado
              : styles.filtro
          }
          onPress={() => {
            setFiltroCategoria('');
            setFiltroFonte('');
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
                filtroCategoria === categoria
                  ? styles.filtroSelecionado
                  : styles.filtro
              }
              onPress={() => {
                setFiltroCategoria(categoria);
                setFiltroFonte('');
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
            filtroFonte === ''
              ? styles.filtroSelecionado
              : styles.filtro
          }
          onPress={() => {
            setFiltroFonte('');
            setFiltroCategoria('');
          }}
        >
          <Text>
            Todas
          </Text>
        </TouchableOpacity>
        {listaDeFontes.map(
          (fonte) => (
            <TouchableOpacity
              key={fonte.id}
              style={
                filtroFonte === fonte.titulo
                  ? styles.filtroSelecionado
                  : styles.filtro
              }
              onPress={() => {
                setFiltroFonte(fonte.titulo);
                setFiltroCategoria('');
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
