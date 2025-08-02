# Vozia 🚀 - Assistente de Viagem com IA

Um assistente inteligente de viagens que utiliza **LangGraph** e **Google Gemini** para processar solicitações de viagem através de áudio ou texto, extraindo automaticamente informações importantes como datas, destinos, orçamentos e preferências.

## 🎯 **O que o projeto faz?**

O Vozia é um assistente de IA que:

- 🎤 **Processa áudio** de solicitações de viagem
- 🧠 **Extrai informações** automaticamente usando IA
- 📅 **Identifica datas**, destinos, orçamentos e preferências
- 🔄 **Utiliza LangGraph** para fluxo de processamento inteligente
- 🛠️ **Arquitetura modular** para fácil extensão

### **Exemplo de Uso:**

**Entrada (áudio ou texto):**

> "Entre 10/08/2025 e 20/08/2025, quero passar 5 dias em Paris. Estou disposto a gastar até 3000 em passagens e 2000 em hospedagem. Para hospedagem, quero ar condicionado, café da manhã e wifi."

**Saída estruturada:**

```json
{
  "startDate": "2025-08-10",
  "endDate": "2025-08-20", 
  "days": 5,
  "city": "Paris",
  "budgetFlights": 3000,
  "budgetHotels": 2000,
  "hotelFeatures": ["ar condicionado", "café da manhã", "wifi"]
}
```

## 🚀 **Instalação e Configuração**

### **1. Clone o repositório:**

```bash
git clone https://github.com/KJSS3012/vozia_project
cd vozia_project
```

### **2. Instale as dependências:**

```bash
npm install
```

### **3. Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto:

```env
# API Key do Google Gemini
GOOGLE_API_KEY=sua_chave_aqui

# API Key do AssemblyAI
ASSEMBLYAI_API_KEY=sua_chave_aqui
```

### **4. Execute o projeto:**

```bash
node app.js
```
