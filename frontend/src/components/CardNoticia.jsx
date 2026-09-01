import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';

export default function CardNoticia({ noticia }) {
  return (
    <View style={styles.noticia}>
      <Text style={styles.tituloNoticia}>
        {noticia.titulo}
      </Text>
      <Text style={styles.categoriaNoticia}>
        {noticia.categorias}
      </Text>
      <Text style={styles.fonteNoticia}>
        Fonte: {noticia.fonte}
      </Text>
      <Text style={styles.descricao}>
        {noticia.descricao}
      </Text>
      <Text style={styles.data}>
        {noticia.dataDePublicacao}
      </Text>
      <TouchableOpacity
        style={styles.botaoNoticia}
        onPress={() => Linking.openURL(noticia.endereco_noticia)}
      >
        <Text style={styles.textoBotaoNoticia}>
          Clique para ver a notícia completa
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
