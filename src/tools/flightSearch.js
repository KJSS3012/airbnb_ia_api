import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const flightSearchTool = tool(
  async ({
    origem,
    destino,
    dataIda,
    dataVolta,
    passageiros,
    classeViagem,
  }) => {
    console.log("Buscando voos:", {
      origem,
      destino,
      dataIda,
      dataVolta,
      passageiros,
      classeViagem,
    });

    const resultados = [
      {
        airline: "LATAM",
        price: 1500,
        departure: dataIda,
        return: dataVolta || null,
        duration: "8h 30m",
      },
    ];

    return JSON.stringify({
      flights: resultados,
      total: resultados.length,
    });
  },
  {
    name: "search_flights",
    description: "Busca voos com base nos critérios especificados",
    schema: z.object({
      origem: z.string().describe("Cidade de origem"),
      destino: z.string().describe("Cidade de destino"),
      dataIda: z.string().describe("Data de ida (YYYY-MM-DD)"),
      dataVolta: z
        .string()
        .optional()
        .describe("Data de volta (YYYY-MM-DD) - opcional"),
      passageiros: z.number().default(1).describe("Número de passageiros"),
      classeViagem: z
        .string()
        .default("economy")
        .describe("Classe da viagem (economy, business, first)"),
    }),
  }
);
