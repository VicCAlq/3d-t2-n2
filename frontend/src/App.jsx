import React from "react";
import {View,Text,TextInput,Button,ScrollView,StyleSheet,} from "react-native";
const API_URL =
  "http://localhost:3451/";
export default function App() {
  const [fontes, setFontes] = React.useState([]);
  const [noticias, setNoticias] = React.useState([]);
  const [nomeFonte, setNomeFonte] = React.useState("");
  const [enderecoFonte, setEnderecoFonte] =
    React.useState("");
  const [titulo, setTitulo] =
    React.useState("");
  const [descricao, setDescricao] =
    React.useState("");
  const [categoria, setCategoria] =
    React.useState("");
  const [fonteId, setFonteId] =
    React.useState("");
  const [mensagem, setMensagem] =
    React.useState("");
  async function buscarFontes() {
    try {
     const resposta = await fetch(
        `${API_URL}/api/fontes`
      );
      const dados = await resposta.json();
      console.log(
        "Fontes recebidas:",
        dados
      );
      if (!resposta.ok) {
        setMensagem(
          "Erro ao buscar fontes."
        );
        return;
      }
      setFontes(dados);
    } catch (erro) {
      console.log(
        "Erro ao buscar fontes:",
        erro
      );
      setMensagem(
        "Não foi possível conectar ao backend."
      );
    }
  }

  async function buscarNoticias() {

    try {

      const resposta = await fetch(
        `${API_URL}/api/noticias`
      );

      const dados = await resposta.json();

      console.log(
        "Notícias recebidas:",
        dados
      );

      if (!resposta.ok) {

        setMensagem(
          "Erro ao buscar notícias."
        );

        return;
      }

      setNoticias(dados);

    } catch (erro) {

      console.log(
        "Erro ao buscar notícias:",
        erro
      );

      setMensagem(
        "Não foi possível conectar ao backend."
      );
    }
  }
  async function atualizarDados() {
    setMensagem(
      "Atualizando dados..."
    );
    await buscarFontes();
    await buscarNoticias();
    setMensagem(
      "Dados atualizados!"
    );
  }
  async function cadastrarFonte() {

    if (
      nomeFonte.trim() === "" ||
      enderecoFonte.trim() === ""
    ) {

      setMensagem(
        "Preencha o nome e o endereço da fonte."
      );

      return;
    }


    try {

      const resposta = await fetch(
        `${API_URL}/api/fontes`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            nome: nomeFonte,

            endereco: enderecoFonte,

          }),
        }
      );


      const dados = await resposta.json();


      console.log(
        "Resposta do cadastro da fonte:",
        dados
      );


      if (!resposta.ok) {

        setMensagem(
          dados.error ||
          "Erro ao cadastrar fonte."
        );

        return;
      }

      setFontes([
        dados.fonte,
        ...fontes,
      ]);

      setNomeFonte("");

      setEnderecoFonte("");


      setMensagem(
        "Fonte cadastrada com sucesso!"
      );
    } catch (erro) {

      console.log(
        "Erro ao cadastrar fonte:",
        erro
      );
      setMensagem(
        "Erro de conexão com o backend."
      );
    }
  }
  async function apagarFonte(id) {
    try {
      const resposta = await fetch(
        `${API_URL}/api/fontes/${id}`,
        {
          method: "DELETE",
        }
      );
      const dados = await resposta.json();
      console.log(
        "Resposta ao apagar fonte:",
        dados
      );
      if (!resposta.ok) {
        setMensagem(
          dados.error ||
          "Erro ao apagar fonte."
        );
        return;
      }
      setFontes(
        fontes.filter(
          (fonte) => fonte.id !== id
        )
      );
      setMensagem(
        "Fonte apagada com sucesso!"
      );
    } catch (erro) {

      console.log(
        "Erro ao apagar fonte:",
        erro
      );
      setMensagem(
        "Erro de conexão com o backend."
      );
    }
  }
  async function cadastrarNoticia() {
    if (
      titulo.trim() === "" ||
      categoria.trim() === "" ||
      fonteId.trim() === ""
    ) {

      setMensagem(
        "Preencha título, categoria e ID da fonte."
      );

      return;
    }

    const fonteEncontrada = fontes.find(
      (fonte) =>
        fonte.id === Number(fonteId)
    );
    if (!fonteEncontrada) {
      setMensagem(
        "A fonte informada não existe."
      );

      return;
    }
    try {
      const resposta = await fetch(
        `${API_URL}/api/noticias`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            titulo: titulo,

            descricao: descricao,

            categoria: categoria,

            fonte_id: Number(fonteId),

          }),
        }
      );

      const dados = await resposta.json();
      console.log(
        "Resposta do cadastro da notícia:",
        dados
      );
      if (!resposta.ok) {

        setMensagem(
          dados.error ||
          "Erro ao cadastrar notícia."
        );

        return;
      }
      const novaNoticia = {

        id: dados.noticia.id,

        titulo: dados.noticia.titulo,

        descricao: dados.noticia.descricao,

        categoria: dados.noticia.categoria,

        fonte_id: dados.noticia.fonte_id,

        fonte: fonteEncontrada.nome,

      };
      setNoticias([
        novaNoticia,
        ...noticias,
      ]);
      setTitulo("");

      setDescricao("");

      setCategoria("");

      setFonteId("");


      setMensagem(
        "Notícia cadastrada com sucesso!"
      );
    } catch (erro) {

      console.log(
        "Erro ao cadastrar notícia:",
        erro
      );

      setMensagem(
        "Erro de conexão com o backend."
      );
    }
  }
  async function apagarNoticia(id) {

    try {

      const resposta = await fetch(
        `${API_URL}/api/noticias/${id}`,
        {
          method: "DELETE",
        }
      );
      const dados = await resposta.json();
      console.log(
        "Resposta ao apagar notícia:",
        dados
      );


      if (!resposta.ok) {

        setMensagem(
          dados.error ||
          "Erro ao apagar notícia."
        );

        return;
      }
      setNoticias(
        noticias.filter(
          (noticia) =>
            noticia.id !== id
        )
      );
      setMensagem(
        "Notícia apagada com sucesso!"
      );


    } catch (erro) {

      console.log(
        "Erro ao apagar notícia:",
        erro
      );

      setMensagem(
        "Erro de conexão com o backend."
      );
    }
  }
  return (

    <ScrollView
      style={styles.container}
    >
      <Text style={styles.titulo}>
         Trabalho de Backend e Frontend
      </Text>
      {mensagem !== "" && (
        <Text style={styles.mensagem}>
          {mensagem}
        </Text>

      )}
      <View style={styles.caixa}>

        <Text style={styles.subtitulo}>
          conectando com backend
        </Text>

        <Button
          title="Atualizar dados"
          onPress={atualizarDados}
        />

      </View>

      <View style={styles.caixa}>

        <Text style={styles.subtitulo}>
          Cadastrar fonte
        </Text>
        <TextInput
          style={styles.input}

          placeholder="Nome da fonte"

          value={nomeFonte}

          onChangeText={setNomeFonte}
        />
        <TextInput
          style={styles.input}

          placeholder="Endereço da fonte"

          value={enderecoFonte}

          onChangeText={setEnderecoFonte}
        />
        <Button
          title="Cadastrar fonte"

          onPress={cadastrarFonte}
        />
      </View>
      <View style={styles.caixa}>
        <Text style={styles.subtitulo}>
          Fontes cadastradas
        </Text>
        {fontes.length === 0 ? (
          <Text>
            Nenhuma fonte carregada.
          </Text>
        ) : (
          fontes.map((fonte) => (
            <View
              key={fonte.id}
              style={styles.item}
            >
              <Text>
                ID: {fonte.id}
              </Text>
              <Text>
                Nome: {fonte.nome}
              </Text>
              <Text>
                Endereço: {fonte.endereco}
              </Text>
              <View
                style={styles.botao}
              >
                <Button
                  title="Apagar fonte"
                  onPress={() =>
                    apagarFonte(fonte.id)
                  }
                />
              </View>
            </View>
          ))
        )}
      </View>
      <View style={styles.caixa}>
        <Text style={styles.subtitulo}>
          Cadastrar notícia
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={styles.input}
          placeholder="Descrição"
          value={descricao}
          onChangeText={setDescricao}
        />
        <TextInput
          style={styles.input}

          placeholder="Categoria"

          value={categoria}

          onChangeText={setCategoria}
        />
        <TextInput
          style={styles.input}
          placeholder="ID da fonte"
          keyboardType="numeric"
          value={fonteId}
          onChangeText={setFonteId}
        />
        <Button
          title="Cadastrar notícia"
          onPress={cadastrarNoticia}
        />
      </View>
      <View style={styles.caixa}>
        <Text style={styles.subtitulo}>
          Notícias
        </Text>
        {noticias.length === 0 ? (
          <Text>
            Nenhuma notícia carregada.
          </Text>
        ) : (
          noticias.map((noticia) => (
            <View
              key={noticia.id}
              style={styles.noticia}
            >
              <Text
                style={styles.tituloNoticia}
              >
                {noticia.titulo}
              </Text>
              <Text>
                {noticia.descricao}
              </Text>
              <Text>
                Categoria: {noticia.categoria}
              </Text>
              <Text>
                Fonte: {noticia.fonte}
              </Text>
              <Text>
                ID da fonte: {noticia.fonte_id}
              </Text>
              <View
                style={styles.botao}
              >
                <Button
                  title="Apagar notícia"
                  onPress={() =>
                    apagarNoticia(
                      noticia.id
                    )
                  }
                />
              </View>
            </View>
          ))
        )}
      </View>
      <View
        style={{
          height: 50
        }}
      />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 2,
    padding: 100,
    backgroundColor: "#553ce0",
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  mensagem: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  caixa: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#f57a7a",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#e9bebe",
  },
  item: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  noticia: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  tituloNoticia: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  botao: {
    marginTop: 10,
  },
});

// o excesso de feiura é porque o design foi feito por pessoas que nao tem nenhum senso de beleza, desde de ja peço perdão.