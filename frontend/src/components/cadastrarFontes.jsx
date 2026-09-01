import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function cadastrarFontes({ enderecoFonte, setEnderecoFonte, onCadastrar }) {

  return (
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
        onPress={onCadastrar}
      >
        <Text style={styles.textoBotao}>
          Adicionar fonte
        </Text>
      </TouchableOpacity>

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

  input: {
    borderWidth: 1,
    borderColor: '#aaaaaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },

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

});
