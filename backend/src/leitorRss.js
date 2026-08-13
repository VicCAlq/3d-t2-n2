const { JSDOM } = require('jsdom');
const dom = new JSDOM('');
const { DOMParser } = dom.window;
const domHTML = new JSDOM('');

async function fetchComProxy(endereco) {
  const resposta = await fetch(endereco, {
    headers: {
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
  });

  if (!resposta.ok) {
    throw new Error(`HTTP ${resposta.status}`);
  }

  const buffer = await resposta.arrayBuffer();
  const charset = (resposta.headers.get('content-type') || '').match(/charset=([\w-]+)/i)?.[1] || 'utf-8';
  let texto;
  try {
    texto = new TextDecoder(charset).decode(buffer);
  } catch {
    texto = new TextDecoder('utf-8').decode(buffer);
  }
  return texto;
}

const ENTIDADES_HTML = {
  nbsp: '\u00A0', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  eacute: 'é', agrave: 'à', aacute: 'á', acirc: 'â', atilde: 'ã', auml: 'ä',
  aring: 'å', aelig: 'æ', ccedil: 'ç', eth: 'ð', egrave: 'è', ecirc: 'ê',
  euml: 'ë', iacute: 'í', igrave: 'ì', icirc: 'î', iuml: 'ï', ntilde: 'ñ',
  oacute: 'ó', ograve: 'ò', ocirc: 'ô', otilde: 'õ', ouml: 'ö', oslash: 'ø',
  uacute: 'ú', ugrave: 'ù', ucirc: 'û', uuml: 'ü', yacute: 'ý', yuml: 'ÿ',
  szlig: 'ß', thorn: 'þ', divide: '÷', times: '×', plusmn: '±', middot: '·',
  deg: '°', micro: 'µ', para: '¶', sect: '§', copy: '©', reg: '®', trade: '™',
  hellip: '…', bull: '•', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', prime: '′', Prime: '″',
  minus: '−', frasl: '⁄', permil: '‰', ensp: '\u2002', emsp: '\u2003',
  thinsp: '\u2009',
};

function expandirEntidades(texto) {
  const entidadesPredefinidas = ['amp', 'lt', 'gt', 'quot', 'apos']
  return texto.replace(/&([a-zA-Z0-9]+);/g, (match, nome) => {
    const nomeLowerCase = nome.toLowerCase()
    if (entidadesPredefinidas.includes(nomeLowerCase)) {
      return match
    }
    if (Object.prototype.hasOwnProperty.call(ENTIDADES_HTML, nome)) {
      return ENTIDADES_HTML[nome]
    }
    if (Object.prototype.hasOwnProperty.call(ENTIDADES_HTML, nomeLowerCase)) {
      return ENTIDADES_HTML[nomeLowerCase]
    }
    return match
  })
}

function lerRSS(textoXML) {
  const textoLimpo = expandirEntidades(textoXML);
  const parser = new DOMParser();

  let doc;
  try {
    doc = parser.parseFromString(textoLimpo, 'text/xml');
    if (doc.querySelector('parsererror')) {
      throw new Error('XML inválido: não foi possível parsear o feed.');
    }
  } catch {
    doc = new JSDOM(textoLimpo, { contentType: 'text/html' }).window.document;
  }

  const formatoAtom = doc.documentElement.nodeName 
    ? doc.documentElement.nodeName === 'feed'
    : false;

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

      const tmp = domHTML.window.document.createElement('div');
      tmp.innerHTML = conteudoArmazenado || itemDesc;
      const descricaoFormatada = tmp.textContent || tmp.innerText || '';

      return {
        titulo: item.querySelector('title')?.textContent || 'Sem título',
        link: item.querySelector('link')?.textContent || '',
        descricao: descricaoFormatada.substring(0, 500) + "...",
        dataPublicacao: item.querySelector('pubDate')?.textContent || item.querySelector('dc\\:date, date')?.textContent || new Date().toISOString(),
        categorias: Array.from(item.querySelectorAll('category')).map(c => c.textContent).filter(Boolean),
      };
    });
  }

  return {
    fonte: {
      titulo: titulo || 'Sem título',
      descricao: descricao || '',
      link: link || '',
    },
    noticias: noticias.slice(0, 50),
  };
}

async function baixarFeedRSS(url) {
  const textoXML = await fetchComProxy(url);
  return lerRSS(textoXML);
}

module.exports = { baixarFeedRSS };
