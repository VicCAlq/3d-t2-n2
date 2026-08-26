import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Exemplo from "./components/Exemplo";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:3451";

export default function App() {
  const [noticias, setNoticias] = useState([]);
  const [status, setStatus] = useState("Testando conexão...");

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro HTTP: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        console.log("BACKEND RESPONDEU:", data);

        setStatus("✅ Backend conectado!");
      })
      .catch((erro) => {
        console.log("ERRO DE CONEXÃO:", erro);

        setStatus("❌ Backend desconectado!");
      });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>

        <Text style={styles.title}>
          Agregador de notícias
        </Text>

        <Text style={styles.status}>
          {status}
        </Text>

        <Text style={styles.subtitle}>
          Cadastrar nova fonte de notícias
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Cole aqui o link do feed RSS"
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Enviar
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          Filtrar notícias
        </Text>

        <Text style={styles.label}>
          Categoria
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Todas"
        />

        <Text style={styles.label}>
          Fonte
        </Text>

        <TextInput
          style={styles.input}
          placeholder="SES - Notícias"
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },

  status: {
    fontSize: 20,
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 20,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#3498db",
    padding: 15,
    alignItems: "center",
    marginBottom: 25,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  label: {
    fontSize: 16,
    marginBottom: 5,
  },
});

//por motivos q eu n conheço, eu n to  conseguindo conectar o back com o front (╥﹏╥)
