const PROXY = 'https://corsproxy.io/?url='

async function fetchComProxy(endereco) {
  let erroMaisRecente = null;

    try {
      const proxyEndereco = PROXY + encodeURIComponent(endereco);
      const resposta = await fetch(proxyEndereco, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
      });

      if (!resposta.ok) {
        erroMaisRecente = new Error(`HTTP ${resposta.status}`);
      }

      const texto = await resposta.text();
      return texto;

    } catch (err) {
      erroMaisRecente = err;
    }

  throw erroMaisRecente || new Error('Não foi possível carregar o feed. Verifique a Endereco e tente novamente.');
}

function lerRSS(textoXML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(textoXML, 'text/xml');

  const parseErro = doc.querySelector('parsererror');
  if (parseErro) {
    throw new Erro('XML inválido: não foi possível parsear o feed.');
  }

  const formatoAtom = doc.documentElement.nodeName === 'feed';

  let titulo = '';
  let descricao = '';
  let link = '';
  let noticias = [];

  if (formatoAtom) {
    titulo = doc.querySelector('feed > title')?.textContent || '';
    descricao = doc.querySelector('feed > subtitle')?.textContent || '';
    link = doc.querySelector('feed > link[rel="alternate"]')?.getAttribute('href') ||
           doc.querySelector('feed > link:not([rel])')?.getAttribute('href') || '';

    const valores = doc.querySelectorAll('entry');
    noticias = Array.from(valores).map(valor => {
      const valorLink = valor.querySelector('link[rel="alternate"]')?.getAttribute('href') ||
                        valor.querySelector('link:not([rel])')?.getAttribute('href') || '';
      const content = valor.querySelector('content')?.textContent || '';
      const summary = valor.querySelector('summary')?.textContent || '';

      return {
        titulo: valor.querySelector('title')?.textContent || 'Sem título',
        link: valorLink,
        descricao: summary || content,
        dataPublicacao: valor.querySelector('updated')?.textContent || valor.querySelector('published')?.textContent || new Date().toISOString(),
        categorias: Array.from(valor.querySelectorAll('category')).map(c => c.getAttribute('term') || c.textContent).filter(Boolean),
      };
    });
  } else {
    const canal = doc.querySelector('channel') || doc.documentElement;
    titulo = canal.querySelector('title')?.textContent || '';
    descricao = canal.querySelector('description')?.textContent || '';
    link = canal.querySelector('link')?.textContent || '';

    const elementosnoticias = doc.querySelectorAll('item');
    noticias = Array.from(elementosnoticias).map(item => {
      const itemDesc = item.querySelector('description')?.textContent || '';
      const conteudoArmazenado = item.querySelector('content\\:encoded, encoded')?.textContent || '';

      const tmp = document.createElement('div');
      tmp.innerHTML = conteudoArmazenado || itemDesc;
      const descricaoFormatada = tmp.textContent || tmp.innerText || '';

      return {
        titulo: item.querySelector('title')?.textContent || 'Sem título',
        link: item.querySelector('link')?.textContent || '',
        descricao: descricaoFormatada.substring(0, 500),
        dataPublicacao: item.querySelector('pubDate')?.textContent || item.querySelector('dc\\:date, date')?.textContent || new Date().toISOString(),
        categorias: Array.from(item.querySelectorAll('category')).map(c => c.textContent).filter(Boolean),
      };
    });
  }

  return {
    titulo: title || 'Sem título',
    descricao: description || '',
    link: link || '',
    noticias: noticias.slice(0, 50),
  };
}

export async function baixarFeedRSS(url) {
  const textoXML = await fetchComProxy(url);
  return lerRSS(textoXML);
}
