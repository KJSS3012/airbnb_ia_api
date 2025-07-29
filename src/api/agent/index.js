import testTool from "../tools/index.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { TavilySearch } from "@langchain/tavily";
import dotenv from "dotenv";

dotenv.config();

export default async function test() {
  try {
    const search = new TavilySearch({
      maxResults: 2,
      apiKey: process.env.TAVILY_API_KEY,
    });

    const tools = [search, testTool];

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      maxOutputTokens: 2048,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful assistant that Answer the following questions as best as you can. You have access to the following tools:",
      ],
      ["placeholder", "{chat_history}"],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = createToolCallingAgent({ llm, tools, prompt });

    const agentExecutor = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
    });

    const result = await agentExecutor.invoke({
      input: "Quantos episódios tem naruto shippuden?",
    });

    console.log("Agent Result:", result);
  } catch (error) {
    console.error("Error in GET request:", error);
  }
}
