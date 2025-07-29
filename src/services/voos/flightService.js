import { Duffel } from "@duffel/api";

const client = new Duffel({
  token: process.env.TOKEN,
});

export async function buscarVoo({
  origem,
  destino,
  dataIda,
  dataVolta = null,
  passageiros = 1,
  classeViagem = "economy",
}) {
  try {
    if (!origem || !destino || !dataIda) {
      throw new Error("Origem, destino e data de ida são obrigatórios");
    }

    // Configurar passageiros
    const passengers = [];
    for (let i = 0; i < passageiros; i++) {
      passengers.push({ type: "adult" });
    }

    // Configurar trechos
    const slices = [
      {
        origin: origem.toUpperCase(),
        destination: destino.toUpperCase(),
        departure_date: dataIda,
      },
    ];

    if (dataVolta) {
      slices.push({
        origin: destino.toUpperCase(),
        destination: origem.toUpperCase(),
        departure_date: dataVolta,
      });
    }

    // Buscar na API Duffel
    const response = await client.offerRequests.create({
      slices: slices,
      passengers: passengers,
      cabin_class: classeViagem,
    });

    const ofertas = response.data.offers || [];

    // Retornar dados simples
    return ofertas.map((oferta) => ({
      origem: origem.toUpperCase(),
      destino: destino.toUpperCase(),
      dataIda: dataIda,
      dataVolta: dataVolta,
      precoReais: Math.round(parseFloat(oferta.total_amount) / 100),
      companhia: oferta.slices[0].segments[0].marketing_carrier.name,
      duracao: oferta.total_duration,
    }));
  } catch (error) {
    console.error("Erro ao buscar voos:", error.message);
    return [];
  }
}
