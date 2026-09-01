import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function GerenciarFontes({ listaDeFontes, onApagar }) {
  return (
    <View style={styles.card}>
      <Text style={styles.subtitulo}>
        Gerenciar fontes
      </Text>
      {listaDeFontes.length === 0 ? (
        <Text>
          Nenhuma fonte cadastrada.
        </Text>
      ) : (
        listaDeFontes.map(
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
                onPress={() => onApagar(fonte.id)}
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
