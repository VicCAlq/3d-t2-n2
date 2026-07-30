import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Exemplo from './components/Exemplo';

export default function App() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text>Comece aqui seu projeto Mobile</Text>
        <Exemplo>Este é um componente de exemplo</Exemplo>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eec",
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: "#101015"
  }
});
