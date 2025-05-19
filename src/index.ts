import { fichador } from "./tools/fichador"; 
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'path';

async function main() {
  const termoBusca = 'fotossíntese';
  const todasPaginas = true;
  const fichas = await fichador(termoBusca, todasPaginas);
  // Cria o diretório 'dados' se não existir
  mkdirSync('dados', { recursive: true });

  // Salva as fichas em um arquivo JSON
  writeFileSync(path.join('dados', `fichas-leitura-${termoBusca}.json`), JSON.stringify(fichas, null, 2), 'utf-8');
}

main().catch(console.error);
