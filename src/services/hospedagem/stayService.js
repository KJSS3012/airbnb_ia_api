const client = require("../../client/duffelClient");

async function buscarHospedagens({
  destino,
  checkin,
  checkout,
  hospedes = 2,
  quartos = 1,
}) {
  try {
    // Validação básica
    if (!destino || !checkin || !checkout) {
      throw new Error("Destino, check-in e check-out são obrigatórios");
    }

    console.log(
      `🏠 Buscando hospedagens em: ${destino} (${checkin} a ${checkout})`
    );

    // Configurar hóspedes para a API Duffel
    const guests = [];
    for (let i = 0; i < hospedes; i++) {
      guests.push({ type: "adult" });
    }

    // Buscar coordenadas do destino (simplificado - você pode usar uma API de geocoding)
    const coordinates = obterCoordenadas(destino);

    // Request para a API Duffel Stays
    const searchRequest = {
      check_in_date: checkin,
      check_out_date: checkout,
      rooms: quartos,
      guests: guests,
      location: {
        radius: 10, // 10km de raio
        geographic_coordinates: coordinates,
      },
    };

    // Buscar na API Duffel
    const response = await client.stays.search.create(searchRequest);
    const resultados = response.data.results || [];

    console.log(`✅ Encontradas ${resultados.length} hospedagens`);

    // Retornar dados simples para IA
    return resultados.map((resultado) => ({
      destino: destino,
      checkin: checkin,
      checkout: checkout,
      hospedes: hospedes,
      quartos: quartos,
      precoReais: Math.round(parseFloat(resultado.cheapest_rate_total_amount)),
      nome: resultado.accommodation.name,
      avaliacao: resultado.accommodation.rating || 4.0,
      endereco: resultado.accommodation.address?.city || destino,
      comodidades:
        resultado.accommodation.amenities?.slice(0, 3).map((a) => a.type) || [],
    }));
  } catch (error) {
    console.error("Erro ao buscar hospedagens:", error.message);
    return [];
  }
}

/**
 * Obter coordenadas geográficas básicas para cidades conhecidas
 * Em produção, use uma API de geocoding como Google Maps
 */
function obterCoordenadas(destino) {
  const coordenadas = {
    "Rio de Janeiro": { latitude: -22.9068, longitude: -43.1729 },
    "São Paulo": { latitude: -23.5505, longitude: -46.6333 },
    Salvador: { latitude: -12.9714, longitude: -38.5014 },
    Brasília: { latitude: -15.7939, longitude: -47.8828 },
    Florianópolis: { latitude: -27.5954, longitude: -48.548 },
    Lisboa: { latitude: 38.7223, longitude: -9.1393 },
    Paris: { latitude: 48.8566, longitude: 2.3522 },
    Londres: { latitude: 51.5074, longitude: -0.1278 },
    "Nova York": { latitude: 40.7128, longitude: -74.006 },
    Miami: { latitude: 25.7617, longitude: -80.1918 },
  };

  // Buscar por nome exato ou parcial
  for (const cidade in coordenadas) {
    if (destino.toLowerCase().includes(cidade.toLowerCase())) {
      return coordenadas[cidade];
    }
  }

  // Coordenadas padrão (São Paulo) se não encontrar
  return coordenadas["São Paulo"];
}

module.exports = {
  buscarHospedagens,
};
