# Meu Scraper – Toda Matéria

Este projeto é um scraper em Node.js/TypeScript para buscar conteúdos do site [Toda Matéria](https://www.todamateria.com.br/) de forma dinâmica, permitindo a geração de fichas de leitura acadêmicas com auxílio de IA (Groq).

## Funcionalidades

- **Busca dinâmica**: Pesquisa por qualquer termo no site Toda Matéria, com opção de raspar apenas a primeira página ou todas as páginas de resultados.
- **Raspagem de artigos**: Para cada link encontrado, extrai o conteúdo principal do artigo, imagem principal, todas as imagens e legendas, nome do autor e links do texto.
- **API HTTP**: Disponibiliza um endpoint para retornar os links da busca.
- **Ficha de leitura inteligente**: Gera fichas de leitura resumidas usando IA (Groq), sem depender de arquivos intermediários.
- **Salvamento automático**: Os resultados das fichas são salvos em arquivos JSON na pasta `dados/`.

## Como usar

1. **Instale as dependências**:

```bash
npm install
```

2. **Configure a chave da API Groq**

Crie um arquivo `.env` na raiz do projeto e adicione sua chave:

```
GROQ_API_KEY=sua-chave-aqui
```

3. **Execute o scraper**

O script principal está em `src/index.ts`. Por padrão, ele busca por "fotossíntese" e salva as fichas em `dados/fichas-leitura-fotossíntese.json`.

```bash
npm start
```

Ou, para rodar manualmente:

```bash
npx ts-node src/index.ts
```

Você pode editar o termo de busca e outras opções diretamente no arquivo `src/index.ts`.

## Estrutura do Projeto

- `src/tools/scraping.ts`: Funções de scraping (busca e extração de artigos).
- `src/tools/ai/fichaAgent.ts`: Agent inteligente para gerar fichas de leitura com IA.
- `src/tools/fichador.ts`: Orquestra a busca, raspagem e geração das fichas.
- `src/index.ts`: Script principal de execução.
- `dados/`: Pasta onde os arquivos JSON de fichas são salvos.

## Lint e Qualidade de Código

Para rodar o lint:

```bash
npm run lint
```

## Possíveis melhorias

- Tratamento de erros mais robusto.
- Opção de salvar fichas apenas sob demanda.
- Refino do prompt da IA.
- Interface web para consulta das fichas.

---

**Autor:** Rogerio

Projeto para fins educacionais e acadêmicos. Não utilize para fins comerciais sem autorização dos autores do conteúdo original.
