import { Groq } from 'groq-sdk';
interface ConteudoRaspado {
  url: string;
  titulo: string;
  autor: string;
  imagens: { src: string; legenda: string }[];
  conteudo: string;
}


interface FichaLeitura {
  url: string;
  titulo: string;
  autor: string;
  imagens: { src: string; legenda: string }[];
  resumo: string;
}
//  conteudo: string;
const groq = new Groq({ apiKey: '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' });

async function gerarResumoIA(texto: string, titulo: string, promptCustomizado?: string): Promise<string> {
  const promptBase = promptCustomizado ||
    `Resuma o texto abaixo em até 5 frases, destacando os pontos mais relevantes para uso em trabalhos acadêmicos, como conceitos centrais, argumentos do autor, contribuições teóricas ou críticas principais.`;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em criar resumos didáticos e objetivos para fichas de leitura acadêmica. Seu papel é extrair e sintetizar as ideias centrais de textos de forma clara, coerente e útil para a elaboração de trabalhos acadêmicos. O resumo deve servir como base para análise, discussão e referência teórica."
        },
        {
          role: "user",
          content: `${promptBase}\nTítulo: ${titulo}\nTexto: ${texto}`
        }
      ],
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      temperature: 0.7,
      max_completion_tokens: 400,
      top_p: 1,
      stream: false
    });
    return chatCompletion.choices[0]?.message?.content?.trim() || '';
  } catch (e: any) {
    console.warn('⚠️ Erro ao gerar resumo com IA, usando resumo simples:', e.message);
    return texto.slice(0, 500) + (texto.length > 500 ? '...' : '');
  }
}

async function criarFichaLeitura(conteudo: ConteudoRaspado, promptCustomizado?: string): Promise<FichaLeitura> {
  return {
    url: conteudo.url,
    titulo: conteudo.titulo,
    autor: conteudo.autor,
    imagens: conteudo.imagens,
    resumo: await gerarResumoIA(conteudo.conteudo, conteudo.titulo, promptCustomizado)
  };
}

export { criarFichaLeitura, gerarResumoIA }; 
export type { FichaLeitura, ConteudoRaspado };