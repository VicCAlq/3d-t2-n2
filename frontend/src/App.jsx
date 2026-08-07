import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Exemplo from './components/Exemplo';

export default function App() {
  return (
    <View style={styles.principal}>




        
        <View style={styles.topo}> 

            <Pressable style={styles.botao}> 

            <Text style={styles.texto}>Categoria V</Text>

          </Pressable>

          <Pressable style={styles.botao}
          onPress={() => setFiltro("fonte")}>

            <Text style={styles.texto}>Fonte V</Text>

          </Pressable>

      </View>

      <View>

        
      
      </View>


    </View>
  );
}


const styles = StyleSheet.create({
  principal: {
    flex: 1,
    backgroundColor: "#eec",
    height: '100%',
    width: '100%'
  },

  texto: {
    fontSize: 16,
    fontWeight: "bold",
  },

    topo: {
    width: '100%',
     height: '10%',
    backgroundColor: "yellow",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },

   botao: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2f00ffff",
  },


});
