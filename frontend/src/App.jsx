import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Linking,
  Platform,
} from 'react-native';

const API_URL = "http://localhost:8000";

const CORES = {
  papel: "#F7F4EE",
  tinta: "#1B1B1F",
  cinza: "#8A8578",
  linha: "#E4DFD3",
  destaque: "#B23A2E",
  card: "#FFFFFF",
};

export default function App() {
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [fontes, setFontes] = useState([]);
  const [fonteAtiva, setFonteAtiva] = useState(null);

  const buscarNoticias = async (
    categoria = categoriaAtiva,
    fonte = fonteAtiva,
    novaPagina = 1,
    adicionar = false
  ) => {
    if (adicionar && (carregandoMais || !temMais)) {
      return;
    }

    let filtro = "";

    if (categoria) {
      filtro += `&categoria=${encodeURIComponent(categoria)}`;
    }

    if (fonte) {
      filtro += `&fonte=${encodeURIComponent(fonte)}`;
    }

    const TAMANHO_PAGINA = 30;
    const start = (novaPagina - 1) * TAMANHO_PAGINA;
    const end = novaPagina * TAMANHO_PAGINA;

    if (adicionar) {
      setCarregandoMais(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `${API_URL}/noticias?start=${start}&end=${end}${filtro}`
      );
      const data = await response.json();
      const novasNoticias = data.content || [];

      if (adicionar) {
        setNoticias(prev => [...prev, ...novasNoticias]);
      } else {
        setNoticias(novasNoticias);
      }

      setTemMais(novasNoticias.length === TAMANHO_PAGINA);
      setPagina(novaPagina);
    } catch (e) {
      console.log("Erro ao buscar notícias:", e);
    } finally {
      setLoading(false);
      setCarregandoMais(false);
    }
  };

  const carregarMaisNoticias = () => {
    if (carregandoMais || !temMais) return;
    buscarNoticias(categoriaAtiva, fonteAtiva, pagina + 1, true);
  };

  const buscarCategorias = () =>
    fetch(`${API_URL}/noticias/categories`)
      .then(r => {
        if (!r.ok) console.log("Erro HTTP /noticias/categories:", r.status);
        return r.json();
      })
      .then(d => {
        console.log("Categorias recebidas:", d);
        setCategorias(d || []);
      })
      .catch(e => console.log("Falha ao buscar categorias:", e.message));

  const buscarFontes = () =>
    fetch(`${API_URL}/fontes`)
      .then(r => r.json())
      .then(d => setFontes(d.content || []))
      .catch(console.log);

  const excluirFonte = async (id) => {
    try {
      await fetch(`${API_URL}/fontes/${id}`, { method: "DELETE" });
      await buscarFontes();
      await buscarNoticias(categoriaAtiva);
      await buscarCategorias();
    } catch (e) {
      console.log(e);
    }
  };

  const selecionarCategoria = (categoria) => {
    const nova = categoria === categoriaAtiva ? null : categoria;
    setCategoriaAtiva(nova);
    buscarNoticias(nova, fonteAtiva);
  };

  const selecionarFonte = (fonteId) => {
    const nova = fonteId === fonteAtiva ? null : fonteId;
    setFonteAtiva(nova);
    buscarNoticias(categoriaAtiva, nova);
  };

  const excluirCategoria = async (categoria) => {
    try {
      await fetch(`${API_URL}/noticias/categoria/${encodeURIComponent(categoria)}`, {
        method: "DELETE",
      });
      if (categoriaAtiva === categoria) setCategoriaAtiva(null);
      await buscarCategorias();
      await buscarNoticias(categoriaAtiva === categoria ? null : categoriaAtiva, fonteAtiva);
    } catch (e) {
      console.log(e);
    }
  };

  const adicionarFonte = async () => {
    if (!nome || !url) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/fontes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, url }),
      });
      setNome("");
      setUrl("");
      setModalAberto(false);
      await buscarNoticias(categoriaAtiva);
      await buscarCategorias();
      await buscarFontes();
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const abrirNoticia = async (url) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.log("Erro ao abrir notícia:", e);
    }
  };

  useEffect(() => {
    buscarNoticias();
    buscarCategorias();
    buscarFontes();
  }, []);

  return (
    <View style={s.container}>
      <StatusBar style="dark" />

      <View style={s.masthead}>
        <Text style={s.mastheadTitulo}>NOTÍCIAS</Text>
        <Text style={s.mastheadSub}>Seu agregador pessoal de manchetes</Text>
        <View style={s.mastheadLinha} />
      </View>

      {categorias.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.scrollFiltros}
          contentContainerStyle={s.filtros}
        >
          <TouchableOpacity
            style={[s.chip, !categoriaAtiva && s.chipAtivo]}
            onPress={() => selecionarCategoria(null)}
          >
            <Text style={[s.chipTexto, !categoriaAtiva && s.chipTextoAtivo]}>Todas</Text>
          </TouchableOpacity>

          {categorias.map((c, index) => {
            const valor = typeof c === 'string' ? c : (c.name || c.nome || String(c));
            const ativo = categoriaAtiva === c || categoriaAtiva === valor;

            return (
              <TouchableOpacity
                key={valor || index}
                style={[s.chip, ativo && s.chipAtivo]}
                onPress={() => selecionarCategoria(valor)}
              >
                <Text style={[s.chipTexto, ativo && s.chipTextoAtivo]}>
                  {valor.replace(/-/g, " ")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {fontes.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.scrollFiltros}
          contentContainerStyle={s.filtros}
        >
          <TouchableOpacity
            style={[s.chip, !fonteAtiva && s.chipAtivo]}
            onPress={() => selecionarFonte(null)}
          >
            <Text style={[s.chipTexto, !fonteAtiva && s.chipTextoAtivo]}>Todas as fontes</Text>
          </TouchableOpacity>

          {fontes.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[s.chip, fonteAtiva === f.id && s.chipAtivo]}
              onPress={() => selecionarFonte(f.id)}
            >
              <Text style={[s.chipTexto, fonteAtiva === f.id && s.chipTextoAtivo]}>
                {f.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={s.lista}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const distanciaDoFinal =
            contentSize.height - (layoutMeasurement.height + contentOffset.y);

          if (distanciaDoFinal < 300) {
            carregarMaisNoticias();
          }
        }}
        scrollEventThrottle={16}
      >
        {noticias.length === 0 && (
          <Text style={s.vazio}>Nenhuma notícia ainda. Adicione uma fonte no botão “+”.</Text>
        )}

        {noticias.map(n => (
          <TouchableOpacity
            key={n.id}
            style={s.card}
            activeOpacity={0.8}
            onPress={() => abrirNoticia(n.url)}
          >
            {n.image ? (
              <Image source={{ uri: n.image }} style={s.cardImagem} />
            ) : null}

            <View style={[s.cardCorpo, !n.image && s.cardCorpoSemImagem]}>
              <View style={s.metaLinha}>
                {n.categoria ? (
                  <Text style={s.categoria}>{n.categoria.replace(/-/g, " ")}</Text>
                ) : null}
                {n.data_publicacao ? (
                  <Text style={s.data}>{n.data_publicacao}</Text>
                ) : null}
              </View>

              <Text style={s.titulo} numberOfLines={n.image ? 2 : 3}>{n.titulo}</Text>
              <Text style={s.descricao} numberOfLines={n.image ? 2 : 3}>{n.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => setModalAberto(true)} activeOpacity={0.85}>
        <Text style={s.fabTexto}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalAberto} transparent animationType="fade">
        <View style={s.modalFundo}>
          <View style={s.modalCaixa}>
            <Text style={s.modalTitulo}>Nova fonte RSS</Text>

            <TextInput
              style={s.input}
              placeholder="Nome (ex: G1, UOL...)"
              placeholderTextColor={CORES.cinza}
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              style={s.input}
              placeholder="Link do feed RSS"
              placeholderTextColor={CORES.cinza}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
            />

            <View style={s.modalBotoes}>
              <TouchableOpacity style={s.botaoCancelar} onPress={() => setModalAberto(false)}>
                <Text style={s.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.botaoSalvar} onPress={adicionarFonte}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.botaoSalvarTexto}>Adicionar</Text>}
              </TouchableOpacity>
            </View>

            {categorias.length > 0 && (
              <>
                <Text style={s.fontesTitulo}>Categorias</Text>
                <ScrollView style={s.fontesLista}>
                  {categorias.filter(c => c && c.trim().length > 0).map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[s.chip, categoriaAtiva === c && s.chipAtivo]}
                      onPress={() => selecionarCategoria(c)}
                    >
                      <Text style={[s.chipTexto, categoriaAtiva === c && s.chipTextoAtivo]}>
                        {c.replace(/-/g, " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {fontes.length > 0 && (
              <>
                <Text style={s.fontesTitulo}>Fontes cadastradas</Text>
                <ScrollView style={s.fontesLista}>
                  {fontes.map(f => (
                    <View key={f.id} style={s.fonteItem}>
                      <Text style={s.fonteNome} numberOfLines={1}>{f.name}</Text>
                      <TouchableOpacity onPress={() => excluirFonte(f.id)}>
                        <Text style={s.fonteExcluir}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.papel,
  },
  scrollFiltros: {
    marginTop: -20,
    flexGrow: 0,
  },
  masthead: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: CORES.papel,
  },
  mastheadTitulo: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 3,
    color: CORES.tinta,
  },
  mastheadSub: {
    fontSize: 13,
    color: CORES.cinza,
    marginTop: 2,
    fontStyle: "italic",
  },
  mastheadLinha: {
    height: 2,
    backgroundColor: CORES.tinta,
    marginTop: 12,
  },
  filtros: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CORES.linha,
    backgroundColor: CORES.card,
  },
  chipAtivo: {
    backgroundColor: CORES.tinta,
    borderColor: CORES.tinta,
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: "600",
    color: CORES.cinza,
    textTransform: "capitalize",
  },
  chipTextoAtivo: {
    color: "#fff",
  },
  lista: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },
  vazio: {
    textAlign: "center",
    color: CORES.cinza,
    marginTop: 40,
    fontSize: 14,
  },
  card: {
    backgroundColor: CORES.card,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CORES.linha,
    overflow: "hidden",
  },
  cardImagem: {
    width: "100%",
    height: 170,
  },
  cardCorpo: {
    padding: 14,
  },
  cardCorpoSemImagem: {
    paddingVertical: 20,
  },
  metaLinha: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 10,
  },
  categoria: {
    fontSize: 11,
    fontWeight: "700",
    color: CORES.destaque,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  data: {
    fontSize: 11,
    color: CORES.cinza,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "700",
    color: CORES.tinta,
    lineHeight: 22,
    marginBottom: 4,
  },
  descricao: {
    fontSize: 13,
    color: CORES.cinza,
    lineHeight: 18,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CORES.destaque,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabTexto: {
    color: "#fff",
    fontSize: 30,
    marginTop: -2,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(27,27,31,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCaixa: {
    backgroundColor: CORES.papel,
    borderRadius: 14,
    padding: 20,
    width: "100%",
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: CORES.tinta,
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: CORES.linha,
    marginBottom: 10,
    color: CORES.tinta,
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  botaoCancelar: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  botaoCancelarTexto: {
    color: CORES.cinza,
    fontWeight: "600",
  },
  botaoSalvar: {
    backgroundColor: CORES.destaque,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoSalvarTexto: {
    color: "#fff",
    fontWeight: "700",
  },
  fontesTitulo: {
    fontSize: 12,
    fontWeight: "700",
    color: CORES.cinza,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  fontesLista: {
    maxHeight: 160,
  },
  fonteItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CORES.linha,
  },
  fonteNome: {
    fontSize: 14,
    color: CORES.tinta,
    flex: 1,
    marginRight: 10,
  },
  fonteExcluir: {
    fontSize: 12,
    fontWeight: "700",
    color: CORES.destaque,
  },
});