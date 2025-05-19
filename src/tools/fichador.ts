import { rasparTodasPaginasBusca, rasparConteudoPagina } from '../tools/scraping';
import { criarFichaLeitura, FichaLeitura } from '../tools/ai/fichaAgent';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'path';
 
async function fichador(termoBusca: string, todasPaginas: boolean, salvar: boolean = true, promptCustomizado?: string) {
    console.log(`🔍 Buscando artigos para: ${termoBusca} (${todasPaginas ? 'todas as páginas' : 'apenas a primeira página'})`);
    let resultados = [];
    try {
        resultados = await rasparTodasPaginasBusca(termoBusca, todasPaginas);
    } catch (erro) {
        console.error('❌ Erro ao buscar links:', erro);
        return [];
    }
    console.log(`🔗 ${resultados.length} links encontrados. Raspando conteúdos...`);
    const fichas: FichaLeitura[] = [];
    for (const { url } of resultados) {
        try {
            const conteudo = await rasparConteudoPagina(url);
            const ficha = await criarFichaLeitura(conteudo, promptCustomizado);
            fichas.push(ficha);
            console.log(`✅ Ficha criada para: ${ficha.titulo}`);
        } catch (erro) {
            console.error(`❌ Erro ao processar ${url}:`, erro);
        }
    }
    if (salvar) {
        mkdirSync('dados', { recursive: true });
        writeFileSync(path.join('dados', `fichas-leitura-${termoBusca}.json`), JSON.stringify(fichas, null, 2), 'utf-8');
        console.log('💾 Fichas salvas em arquivo!');
    }
    console.log('✅ Todas as fichas geradas!');
    return fichas;
}

export { fichador };
