import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import Exemplo from './components/Exemplo';

export default function App() {
  return (
    <View style={styles.principal}>

      <View style={styles.wanda}>

        
        <View style={styles.topo}> 

            <Pressable> 

            <Text style={styles.texto}>Categoria V</Text>

          </Pressable>

          <Pressable>

            <Text style={styles.texto}>Fonte V</Text>

          </Pressable>


        </View>
      


      </View>

    </View>
  );
}


const styles = StyleSheet.create({
  principal: {
    flex: 1,
    backgroundColor: "#eec",
    flexDirection: 'row',
    height: '100%',
    width: '100%'
  },

  wanda: {
    backgroundColor: "rgba(235, 235, 9, 1)",
    flexDirection: 'row',
    typeSize: 'large',
    justifyContent: 'center',
    height: '15%',
    width: '100%'
  },

  texto: {
    fontSize: 16,
    fontWeight: "bold",
  },

    topo: {
    backgroundColor: "yellow",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '50%',
  },


});
