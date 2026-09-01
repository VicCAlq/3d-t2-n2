import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import CardNoticia from './CardNoticia';

export default function ListaDeNoticias({ listaDeNoticias, buscandoDados }) {
  
if (buscandoDados) {
    return <ActivityIndicator size="large" />;
  }

  if (listaDeNoticias.length === 0) {
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
      {listaDeNoticias.map(
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
