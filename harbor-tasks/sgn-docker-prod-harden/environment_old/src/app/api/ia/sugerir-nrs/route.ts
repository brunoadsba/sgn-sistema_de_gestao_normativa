import { NextRequest, NextResponse } from "next/server";
import groq from "@/lib/ia/groq";
import { iaLogger as logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
    try {
        const { textoExtraido } = await request.json();

        if (!textoExtraido || typeof textoExtraido !== "string") {
            return NextResponse.json(
                { success: false, error: "Parâmetro 'textoExtraido' inválido ou ausente." },
                { status: 400 }
            );
        }

        // Pega apenas o comecinho do documento para ser muito rápido e barato
        // 5.000 caracteres é cerca de 1 a 2 páginas, suficiente para o MTE/SST
        const trechoInicial = textoExtraido.substring(0, 5000);

        const systemPrompt = `Você é um Assistente Operacional de SST (Segurança e Saúde no Trabalho).
Sua ÚNICA função é ler o trecho inicial de um documento e inferir quais Normas Regulamentadoras (NRs) brasileiras se aplicam a ele.
O usuário enviará os primeiros 5000 caracteres de um documento (como PGR, PCMSO, LTCAT, etc).
Responda APENAS com um array JSON de strings, contendo o código oficial das normas em letras minúsculas.
Exemplo: ["nr-1", "nr-6", "nr-35"]
NUNCA adicione explicações, markdown ou blocos de código em volta. APENAS o JSON puro. Se não souber, retorne ["nr-1"].
`;

        const model = process.env.AI_PROVIDER === "ollama" ? process.env.OLLAMA_MODEL || "llama3.2" : "llama-3.3-70b-versatile";

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: trechoInicial },
            ],
            model,
            temperature: 0.1, // temperatura baixa para formato estrito
            max_completion_tokens: 150,
            response_format: { type: "json_object" } // forçando formato JSON no Groq
        });

        const resposta = chatCompletion.choices[0]?.message?.content || '{"nrs": ["nr-1"]}';

        try {
            // Groq em json_object exige retornar um objeto. Então vamos ler o array de dentro.
            // Adaptando o prompt acima que pediu um array: se o Groq forçar objeto, ele pode vir {"nrs": [...]}.
            // Vamos tentar parsear a string.
            const parsed = JSON.parse(resposta);

            // Se vier como array direto (fallback se json_object não forçou object)
            if (Array.isArray(parsed)) {
                return NextResponse.json({ success: true, sugeridas: parsed });
            }

            // Se a IA embalou num objeto
            const chaves = Object.keys(parsed);
            if (chaves.length > 0 && Array.isArray(parsed[chaves[0]])) {
                return NextResponse.json({ success: true, sugeridas: parsed[chaves[0]] });
            }

            return NextResponse.json({ success: true, sugeridas: ["nr-1"] });

        } catch (parseError) {
            logger.error({ parseError, resposta }, "Falha ao fazer parse das NRs sugeridas");
            return NextResponse.json({ success: true, sugeridas: ["nr-1"] }); // fallback seguro
        }

    } catch (error) {
        logger.error({ error }, "Erro interno em /api/ia/sugerir-nrs");
        return NextResponse.json(
            { success: false, error: "Falha interna ao sugerir NRs" },
            { status: 500 }
        );
    }
}
