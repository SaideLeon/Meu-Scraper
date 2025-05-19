// ESM exige a extensão do arquivo
import axios from 'axios';
import { load } from 'cheerio';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from 'http';


async function rasparBuscaFotossintese(url: string) {
  const { data: html } = await axios.get(url);
  const $ = load(html);
  const resultados: { titulo: string; url: string }[] = [];
  const urlsSet = new Set();

  // Seleciona apenas os links dos cards de resultado da busca
  $('a.card-item').each((_, el) => {
    let href = $(el).attr('href');
    const titulo = $(el).find('.card-title').text().trim() || $(el).attr('title') || '';
    if (href && href.startsWith('/')) {
      href = 'https://www.todamateria.com.br' + href;
    }
    if (
      href &&
      titulo.length > 0 &&
      !urlsSet.has(href)
    ) {
      resultados.push({ titulo, url: href });
      urlsSet.add(href);
    }
  });

  return resultados;
}

async function rasparTodasPaginasBusca(query: string, todasPaginas: boolean = false) {
  let pagina = 1;
  let resultados: { titulo: string; url: string }[] = [];
  const urlsSet = new Set();
  const encodedQuery = encodeURIComponent(query);
  while (true) {
    const url = pagina === 1
      ? `https://www.todamateria.com.br/?s=${encodedQuery}`
      : `https://www.todamateria.com.br/page/${pagina}/?s=${encodedQuery}`;
    const { data: html } = await axios.get(url);
    const $ = load(html);
    let encontrou = false;
    $('a.card-item').each((_, el) => {
      let href = $(el).attr('href');
      const titulo = $(el).find('.card-title').text().trim() || $(el).attr('title') || '';
      if (href && href.startsWith('/')) {
        href = 'https://www.todamateria.com.br' + href;
      }
      if (
        href &&
        titulo.length > 0 &&
        !urlsSet.has(href)
      ) {
        resultados.push({ titulo, url: href });
        urlsSet.add(href);
        encontrou = true;
      }
    });
    if (!todasPaginas || !encontrou) break;
    pagina++;
  }
  return resultados;
}

async function rasparConteudoPagina(url: string) {
  try {
    const { data: html } = await axios.get(url);
    const $ = load(html);
    // Tenta pegar o título principal e o conteúdo principal do artigo
    const titulo = $('h1').first().text().trim();
    // Pega todos os parágrafos do conteúdo principal, ignorando anúncios e rodapés
    const paragrafos: string[] = [];
    const linksSet = new Set<string>();
    // Coleta todas as imagens e legendas do HTML (não só do conteúdo principal)
    const imagens: { src: string; legenda: string }[] = [];
    // Captura <figure> em todo o HTML
    $('figure').each((_, fig) => {
      const img = $(fig).find('img').first();
      let src = img.attr('src') || '';
      if (src && src.startsWith('/')) src = 'https://www.todamateria.com.br' + src;
      const legenda = $(fig).find('figcaption').text().trim();
      if (src) imagens.push({ src, legenda });
    });
    // Também pega imagens soltas (fora de <figure>) dentro do conteúdo principal
    $('.main-content article img, .main-content .content img, article .content img, article img').each((_, img) => {
      let src = $(img).attr('src') || '';
      if (src && src.startsWith('/')) src = 'https://www.todamateria.com.br' + src;
      // Só adiciona se ainda não está no array
      if (src && !imagens.some(im => im.src === src)) {
        imagens.push({ src, legenda: '' });
      }
    });
    // Seleciona apenas parágrafos dentro do conteúdo principal
    $('.main-content article p, .main-content .content p, article .content p, article p').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt.length > 0) paragrafos.push(txt);
      // Extrai links deste parágrafo
      $(el)
        .find('a[href]')
        .each((_, a) => {
          let href = $(a).attr('href');
          if (href) {
            if (href.startsWith('/')) href = 'https://www.todamateria.com.br' + href;
            if (/^https?:\/\//.test(href)) linksSet.add(href);
          }
        });
    });
    // Se não encontrou nada, tenta pegar todos os <p> exceto os que estão em .sidebar, .footer, .ad-unit
    if (paragrafos.length === 0) {
      $('p').each((_, el) => {
        if (
          $(el).parents('.sidebar, .footer, .ad-unit').length === 0 &&
          $(el).text().trim().length > 0
        ) {
          paragrafos.push($(el).text().trim());
          // Extrai links deste parágrafo
          $(el)
            .find('a[href]')
            .each((_, a) => {
              let href = $(a).attr('href');
              if (href) {
                if (href.startsWith('/')) href = 'https://www.todamateria.com.br' + href;
                if (/^https?:\/\//.test(href)) linksSet.add(href);
              }
            });
        }
      });
    }
    // Raspa a imagem principal do conteúdo (mantém campo antigo para compatibilidade)
    let imagem = '';
    if (imagens.length > 0) {
      imagem = imagens[0].src;
    } else {
      const imgEl = $('.main-content article img, .main-content .content img, article .content img, article img').first();
      if (imgEl && typeof imgEl.attr('src') === 'string') {
        imagem = imgEl.attr('src') || '';
        if (imagem && imagem.startsWith('/')) {
          imagem = 'https://www.todamateria.com.br' + imagem;
        }
      }
    }
    // Extrai o nome do autor (visível)
    let autor =
      $('.author-article--b__info__name').first().text().trim() ||
      $('.autor, .author, .author-name').first().text().trim() ||
      '';
    // Se não encontrou, tenta no JSON-LD
    if (!autor) {
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html() || '{}');
          if (json && typeof json === 'object') {
            if (json.author && typeof json.author === 'object') {
              if (typeof json.author.name === 'string') autor = json.author.name;
              else if (Array.isArray(json.author) && json.author[0]?.name) autor = json.author[0].name;
            } else if (json.name && typeof json.name === 'string') {
              autor = json.name;
            }
          }
        } catch {}
      });
    }
    return {
      url,
      titulo,
      conteudo: paragrafos.join('\n\n'),
      imagens,
      autor,
    };
  } catch (e) {
    return { url, titulo: '', conteudo: '', imagens: [], autor: '', erro: true };
  }
}

// API simples para retornar os links da busca
const PORT = 3000;
createServer(async (req, res) => {
  const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
  if (urlObj.pathname === '/api/busca') {
    const termo = urlObj.searchParams.get('q') || 'Microeconiomia';
    const todasPaginas = urlObj.searchParams.get('todasPaginas') === 'true';
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      const resultados = await rasparTodasPaginasBusca(termo, todasPaginas);
      res.writeHead(200);
      res.end(JSON.stringify(resultados));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ erro: 'Erro ao buscar dados', detalhes: String(e) }));
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}/api/busca?q=termo&todasPaginas=true`);
});

async function main() {
  const termoBusca = process.argv[2] || 'fotossíntese';
  const todasPaginas = process.argv[3] === 'true';
  mkdirSync('dados', { recursive: true });
  console.log(`🔍 Raspando busca por: ${termoBusca} (${todasPaginas ? 'todas as páginas' : 'apenas a primeira página'})`);
  const resultados = await rasparTodasPaginasBusca(termoBusca, todasPaginas);
  const nomeArquivo = `busca-${termoBusca.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  writeFileSync(
    join('dados', nomeArquivo),
    JSON.stringify(resultados, null, 2),
    'utf-8'
  );
  console.log(`✅ Salvo: dados/${nomeArquivo} (${resultados.length} resultados)`);

  // Raspa o conteúdo de cada link encontrado
  console.log('🔍 Raspando o conteúdo de cada link encontrado...');
  const conteudos: any[] = [];
  for (const { url } of resultados) {
    const conteudo = await rasparConteudoPagina(url);
    conteudos.push(conteudo);
  }
  const nomeArquivoConteudo = `conteudo-${termoBusca.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  writeFileSync(
    join('dados', nomeArquivoConteudo),
    JSON.stringify(conteudos, null, 2),
    'utf-8'
  );
  console.log(`✅ Salvo: dados/${nomeArquivoConteudo} (${conteudos.length} páginas)`);
}

main().catch(console.error);
