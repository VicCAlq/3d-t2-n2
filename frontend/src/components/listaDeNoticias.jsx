import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import NoticiaCard from './cardNoticia';

export default function listaDeNoticias({ noticias, carregando }) {

  if (carregando) {
    return <ActivityIndicator size="large" />;
  }

  if (noticias.length === 0) {
    return (
      <View style={styles.card}>
        <Text>
          Nenhuma notícia encontrada.
        </Text>
      </View>
    );
  }

  return (
    <>
      {noticias.map(
        (noticia) => (
          <NoticiaCard key={noticia.id} noticia={noticia} />
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

});
