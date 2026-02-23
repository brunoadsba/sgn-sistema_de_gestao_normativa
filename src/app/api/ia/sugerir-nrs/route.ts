import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/ia/groq";
import { env } from "@/lib/env";
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

        const systemPrompt = `Você é um Assistente Operacional de SST (Segurança e Saúde no Trabalho).
Sua ÚNICA função é ler o trecho inicial de um documento e inferir quais Normas Regulamentadoras (NRs) brasileiras se aplicam a ele.
O usuário enviará os primeiros 5000 caracteres de um documento.
Responda APENAS com um objeto JSON contendo o array na chave "nrs".
Exemplo: {"nrs": ["nr-1", "nr-6", "nr-35"]}
APENAS o JSON puro. Se não souber, retorne {"nrs": ["nr-1"]}.`;

        // Pega apenas o comecinho do documento para ser muito rápido e barato
        const trechoInicial = textoExtraido.substring(0, 5000);
        const trechoSanitizado = trechoInicial.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");

        let resposta = '{"nrs": ["nr-1"]}';

        // Estratégia de Fallback para Sugestão
        try {
            if (env.AI_PROVIDER === "zai") {
                throw new Error("force_zai"); // Atalho se provedor for zai
            }

            const model = env.AI_PROVIDER === "ollama" ? env.OLLAMA_MODEL : "llama-3.3-70b-versatile";

            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: trechoSanitizado },
                ],
                model,
                temperature: 0.1,
                max_completion_tokens: 150,
                response_format: { type: "json_object" }
            });
            resposta = chatCompletion.choices[0]?.message?.content || resposta;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "";
            const isRateLimit = errorMessage.includes("413") ||
                errorMessage.includes("rate_limit") ||
                errorMessage.includes("tokens") ||
                errorMessage.includes("TPM") ||
                errorMessage === "force_zai";

            if (isRateLimit && env.ZAI_API_KEY) {
                logger.warn({ errorMessage }, "[SUGERIR-NRS] Groq limitado. Tentando Fallback Z.AI...");
                const zaiRes = await fetch(`${env.ZAI_BASE_URL}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${env.ZAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: env.ZAI_MODEL,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: trechoSanitizado }
                        ],
                        temperature: 0.1,
                        max_tokens: 150,
                        response_format: { type: 'json_object' }
                    })
                });

                if (zaiRes.ok) {
                    const zaiData = await zaiRes.json();
                    resposta = zaiData.choices[0]?.message?.content || resposta;
                }
            } else {
                throw error;
            }
        }

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
