import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, Image,
  ActivityIndicator, FlatList, ScrollView, StyleSheet, StatusBar,
  Linking, Alert
} from "react-native";

const API = "http://localhost:3451";

function Filtro({ titulo, valor, opcoes, onChange }) {
  const [aberto, setAberto] = useState(false);

  return (
    <View style={s.filtroWrapper}>
      <Text style={s.filtroTitulo}>{titulo}</Text>

      <TouchableOpacity style={s.filtroBotao} onPress={() => setAberto(!aberto)}>
        <Text style={s.filtroValor} numberOfLines={1}>{valor || "Todas"}</Text>
        <Text style={s.filtroSeta}>{aberto ? "⌃" : "⌄"}</Text>
      </TouchableOpacity>

      {aberto && (
        <View style={s.filtroMenu}>
          <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
            <TouchableOpacity
              style={s.opcao}
              onPress={() => {
                onChange("");
                setAberto(false);
              }}
            >
              <Text style={[s.opcaoTexto, !valor && s.opcaoSelecionada]}>
                Todas
              </Text>
            </TouchableOpacity>

            {opcoes.map((item, i) => {
              const nome = typeof item === "object" ? item.nome || item.name : item;

              return (
                <TouchableOpacity
                  key={`${nome}-${i}`}
                  style={s.opcao}
                  onPress={() => {
                    onChange(nome);
                    setAberto(false);
                  }}
                >
                  <Text style={[s.opcaoTexto, valor === nome && s.opcaoSelecionada]}>
                    {nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function Noticias({
  lista, cats, fontes, categoria, fonte, loading,
  mudarCategoria, mudarFonte, abrir
}) {
  const nomeFonte =
    fontes.find(x => x.id.toString() === fonte.toString())?.nome || "";

  return (
    <View style={{ flex: 1 }}>
      <View style={s.filtros}>
        <Filtro
          titulo="Categoria"
          valor={categoria}
          opcoes={cats}
          onChange={mudarCategoria}
        />

        <Filtro
          titulo="Fonte"
          valor={nomeFonte}
          opcoes={fontes}
          onChange={mudarFonte}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(x, i) => x.id ? x.id.toString() : i.toString()}
          ListEmptyComponent={<Text style={s.vazio}>nada aqui ainda...</Text>}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={s.noticia} onPress={() => abrir(item.url)}>
              <Text style={s.numero}>
                {index < 10 ? "0" + index : index}
              </Text>

              <View style={{ flex: 1 }}>
                <Text style={s.titulo}>{item.titulo}</Text>
                <Text style={s.meta}>
                  {item.categoria}
                  {item.data_publicacao ? " · " + item.data_publicacao : ""}
                </Text>
              </View>

              {item.image && (
                <Image source={{ uri: item.image }} style={s.imagem} />
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function Fontes({ fontes, selecionada, clicar, apagar }) {
  return (
    <View style={s.tela}>
      <Text style={s.tituloTela}>Minhas fontes</Text>

      {!fontes.length ? (
        <Text style={s.vazio}>voce ainda nao add nenhuma fonte</Text>
      ) : (
        <ScrollView>
          {fontes.map(f => (
            <View
              key={f.id}
              style={[
                s.fonte,
                selecionada === f.id.toString() && { borderColor: "#22c55e" }
              ]}
            >
              <TouchableOpacity style={{ flex: 1 }} onPress={() => clicar(f.id)}>
                <Text style={{ color: "#fff" }}>{f.nome}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => apagar(f.id)}>
                <Text style={{ color: "#ef4444" }}>apagar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function Adicionar({
  nome, url, setNome, setUrl, salvar, enviando, nomeRef, urlRef
}) {
  return (
    <View style={s.tela}>
      <Text style={s.tituloTela}>Adicionar fonte rss</Text>

      <TextInput
        ref={nomeRef}
        value={nome}
        onChangeText={setNome}
        style={s.input}
        placeholder="nome"
        placeholderTextColor="#888"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => urlRef.current?.focus()}
      />

      <TextInput
        ref={urlRef}
        value={url}
        onChangeText={setUrl}
        style={s.input}
        placeholder="link do rss"
        placeholderTextColor="#888"
        autoCorrect={false}
        autoCapitalize="none"
        keyboardType="url"
        returnKeyType="done"
        onSubmitEditing={salvar}
      />

      <TouchableOpacity
        style={[s.botao, enviando && { opacity: 0.7 }]}
        disabled={enviando}
        onPress={salvar}
      >
        {enviando
          ? <ActivityIndicator color="#000" />
          : <Text style={s.botaoTexto}>salvar</Text>}
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [tela, setTela] = useState("noticias");
  const [lista, setLista] = useState([]);
  const [cats, setCats] = useState([]);
  const [fontes, setFontes] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [fonte, setFonte] = useState("");
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [enviando, setEnviando] = useState(false);

  const nomeRef = useRef(null);
  const urlRef = useRef(null);

  function buscarNoticias() {
    setLoading(true);

    const params = new URLSearchParams();

    if (categoria.trim()) params.append("categoria", categoria);
    if (fonte.trim()) params.append("fonte", fonte);

    fetch(`${API}/noticias${params.toString() ? "?" + params : ""}`)
      .then(r => {
        if (!r.ok) throw new Error("Erro HTTP " + r.status);
        return r.json();
      })
      .then(r => setLista(Array.isArray(r.data) ? r.data : []))
      .catch(e => {
        console.log("Erro noticias:", e);
        setLista([]);
      })
      .finally(() => setLoading(false));
  }

  function buscarCategorias() {
    fetch(`${API}/noticias/categorias`)
      .then(r => r.json())
      .then(r => setCats(Array.isArray(r.data) ? r.data : []))
      .catch(e => console.log("Erro categorias:", e));
  }

  function buscarFontes() {
    fetch(`${API}/fontes`)
      .then(r => r.json())
      .then(r => setFontes(Array.isArray(r.data) ? r.data : []))
      .catch(e => console.log("Erro fontes:", e));
  }

  useEffect(() => {
    buscarCategorias();
    buscarFontes();
  }, []);

  useEffect(() => {
    buscarNoticias();
  }, [categoria, fonte]);

  function mudarCategoria(valor) {
    setCategoria(valor);
    if (valor) setFonte("");
  }

  function mudarFonte(valor) {
    const f = fontes.find(x => x.nome === valor);

    setFonte(f ? f.id.toString() : valor);
    if (f) setCategoria("");
  }

  function clicarFonte(id) {
    id = id.toString();

    setFonte(id === fonte ? "" : id);
    setCategoria("");
    setTela("noticias");
  }

  async function salvar() {
    const nomeFinal = nome.trim();
    const urlFinal = url.trim();

    if (!nomeFinal || !urlFinal) {
      Alert.alert("Opa", "Preenche nome e URL.");
      return;
    }

    setEnviando(true);

    try {
      const resposta = await fetch(`${API}/fontes/processar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeFinal,
          url: urlFinal
        })
      });

      const resultado = await resposta.json();

      if (resultado.success === false) {
        Alert.alert("Erro", resultado.error || "Não foi possível adicionar a fonte.");
        return;
      }

      setNome("");
      setUrl("");
      setCategoria("");
      setFonte("");

      buscarFontes();
      buscarCategorias();
      setTela("noticias");
    } catch (e) {
      console.log("Erro ao salvar:", e);
      Alert.alert("Erro", "Não foi possível adicionar a fonte.");
    } finally {
      setEnviando(false);
    }
  }

  function apagar(id) {
    Alert.alert(
      "Apagar fonte",
      "Tem certeza que deseja apagar essa fonte?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              await fetch(`${API}/fontes/${id}`, { method: "DELETE" });

              buscarFontes();
              buscarCategorias();

              if (fonte === id.toString()) setFonte("");
            } catch (e) {
              console.log("Erro ao apagar:", e);
            }
          }
        }
      ]
    );
  }

  function abrir(link) {
    if (link) Linking.openURL(link).catch(e => console.log(e));
  }

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />

      <Text style={s.logo}>noticias</Text>

      {tela === "noticias" && (
        <Noticias
          lista={lista}
          cats={cats}
          fontes={fontes}
          categoria={categoria}
          fonte={fonte}
          loading={loading}
          mudarCategoria={mudarCategoria}
          mudarFonte={mudarFonte}
          abrir={abrir}
        />
      )}

      {tela === "fontes" && (
        <Fontes
          fontes={fontes}
          selecionada={fonte}
          clicar={clicarFonte}
          apagar={apagar}
        />
      )}

      {tela === "add" && (
        <Adicionar
          nome={nome}
          url={url}
          setNome={setNome}
          setUrl={setUrl}
          salvar={salvar}
          enviando={enviando}
          nomeRef={nomeRef}
          urlRef={urlRef}
        />
      )}

      <View style={s.navbar}>
        <Nav
          icon="📰"
          texto="Noticias"
          ativo={tela === "noticias"}
          onPress={() => setTela("noticias")}
        />

        <Nav
          icon="📡"
          texto="Fontes"
          ativo={tela === "fontes"}
          onPress={() => setTela("fontes")}
        />

        <Nav
          icon="➕"
          texto="Add"
          ativo={tela === "add"}
          onPress={() => setTela("add")}
        />
      </View>
    </SafeAreaView>
  );
}

function Nav({ icon, texto, ativo, onPress }) {
  return (
    <TouchableOpacity style={s.navItem} onPress={onPress}>
      <Text style={s.navIcon}>{icon}</Text>
      <Text style={[s.navTexto, ativo && s.navAtivo]}>{texto}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f"
  },

  logo: {
    color: "#22c55e",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5
  },

  filtros: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#0f0f0f",
    zIndex: 999
  },

  filtroWrapper: {
    flex: 1,
    position: "relative",
    marginRight: 8,
    zIndex: 999
  },

  filtroTitulo: {
    color: "#666",
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 3
  },

  filtroBotao: {
    height: 32,
    borderWidth: 1,
    borderColor: "#292929",
    backgroundColor: "#1a1a1a",
    borderRadius: 4,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  filtroValor: {
    color: "#ddd",
    fontSize: 11,
    flex: 1
  },

  filtroSeta: {
    color: "#777",
    fontSize: 14,
    marginLeft: 4
  },

  filtroMenu: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#303030",
    borderRadius: 4,
    zIndex: 9999,
    elevation: 9999
  },

  opcao: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#242424",
    backgroundColor: "#1a1a1a"
  },

  opcaoTexto: {
    color: "#999",
    fontSize: 11
  },

  opcaoSelecionada: {
    color: "#22c55e",
    fontWeight: "700"
  },

  noticia: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e"
  },

  numero: {
    color: "#333",
    fontSize: 20,
    fontWeight: "bold",
    width: 32
  },

  titulo: {
    color: "#eee",
    fontSize: 14,
    fontWeight: "600"
  },

  meta: {
    color: "#666",
    fontSize: 11,
    marginTop: 4,
    textTransform: "uppercase"
  },

  imagem: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginLeft: 10
  },

  vazio: {
    color: "#666",
    textAlign: "center",
    marginTop: 40
  },

  tela: {
    flex: 1,
    padding: 15
  },

  tituloTela: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15
  },

  fonte: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8
  },

  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333"
  },

  botao: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 6,
    alignItems: "center"
  },

  botaoTexto: {
    fontWeight: "bold",
    color: "#000"
  },

  navbar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#222",
    backgroundColor: "#111",
    paddingVertical: 8
  },

  navItem: {
    flex: 1,
    alignItems: "center"
  },

  navIcon: {
    fontSize: 18
  },

  navTexto: {
    color: "#666",
    fontSize: 11,
    marginTop: 2
  },

  navAtivo: {
    color: "#22c55e"
  }
});