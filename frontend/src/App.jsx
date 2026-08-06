import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Exemplo from './components/Exemplo';

export default function App() {
  return (
    <View style={styles.principal}>

      <View style={styles.wanda}>

        <ScrollView> 

          <Text>Categoria  <strong>v</strong></Text>

        </ScrollView>

        <View>

          <Text> Fonte <strong>v</strong></Text>

        </View>
      
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  principal: {
    flex: 1,
    backgroundColor: "#eec",
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  wanda: {
    backgroundColor: "rgba(235, 235, 9, 1)",
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  }

});

