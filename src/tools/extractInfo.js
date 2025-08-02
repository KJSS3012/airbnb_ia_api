import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";
import { createModel } from "../config/model.js";

export const extractInfoTool = tool(
  async ({ query }) => {
    console.log("Tool executada com query:", query);

    const model = createModel();

    const prompt = `
Extraia as seguintes informações da solicitação abaixo e retorne APENAS em formato JSON:
- startDate: string (data de início da viagem no formato YYYY-MM-DD)
- endDate: string (data final no formato YYYY-MM-DD)
- days: número de dias que a pessoa quer viajar
- city: cidade de destino
- budgetFlights: orçamento para passagens (número)
- budgetHotels: orçamento para hospedagem (número)
- hotelFeatures: array de strings com preferências do quarto

Mensagem: """${query}"""

Retorne apenas o JSON, sem texto adicional.
`;

    const response = await model.invoke([new HumanMessage(prompt)]);

    try {
      const content = response.content.replace(/```json|```/g, "").trim();
      const json = JSON.parse(content);
      console.log("Informações extraídas:", json);
      return JSON.stringify(json);
    } catch (e) {
      console.error("Erro ao extrair JSON:", e);
      return JSON.stringify({
        error: "Falha ao extrair JSON da resposta do modelo.",
      });
    }
  },
  {
    name: "extract_info",
    description:
      "Extrai dados importantes da mensagem do usuário sobre a viagem",
    schema: z.object({
      query: z.string().describe("Mensagem original do usuário"),
    }),
  }
);
