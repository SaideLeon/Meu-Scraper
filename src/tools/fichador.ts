import { rasparTodasPaginasBusca, rasparConteudoPagina } from '../tools/scraping';
import { criarFichaLeitura, FichaLeitura } from '../tools/ai/fichaAgent';
 
async function fichador(termoBusca: string, todasPaginas: boolean) {
    console.log(`🔍 Buscando artigos para: ${termoBusca} (${todasPaginas ? 'todas as páginas' : 'apenas a primeira página'})`);
    const resultados = await rasparTodasPaginasBusca(termoBusca, todasPaginas);
    console.log(`🔗 ${resultados.length} links encontrados. Raspando conteúdos...`);
    const fichas: FichaLeitura[] = [];
    for (const { url } of resultados) {
        const conteudo = await rasparConteudoPagina(url);
        const ficha = await criarFichaLeitura(conteudo);
        fichas.push(ficha);
        console.log(`✅ Ficha criada para: ${ficha.titulo}`);
    }
    console.log('✅ Todas as fichas geradas!');
    return fichas;
}

export { fichador };
