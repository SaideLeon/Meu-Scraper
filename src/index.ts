import { fichador } from "./tools/fichador";  

async function main() {
  const termoBusca = 'fotossíntese';
  const todasPaginas = false;
  const promptCustomizado = 'Resuma o texto abaixo em linguagem simples, focando apenas nos conceitos científicos principais.';
  // Passe 'false' como terceiro argumento para NÃO salvar automaticamente
  await fichador(termoBusca, todasPaginas, true, promptCustomizado);  
}

main().catch(console.error);
