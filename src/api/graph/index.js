import { tool } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import z from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { TavilySearch } from "@langchain/tavily";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";

dotenv.config();

export async function graphTest() {
  const GraphState = Annotation.Root({
    messages: Annotation({
      reducer: (x, y) => x.concat(y),
    }),
  });

  const search = new TavilySearch({
    maxResults: 2,
    apiKey: process.env.TAVILY_API_KEY,
  });

  const weatherTool = tool(
    async ({ query }) => {
      if (
        query.toLowerCase().includes("weather") ||
        query.toLowerCase().includes("climate")
      ) {
        return "The weather is sunny with a chance of rain.";
      }
    },
    {
      name: "weather_tool",
      description: "A tool that provides weather information",
      schema: z.object({
        query: z.string().describe("The weather query to respond to"),
      }),
    }
  );

  const tools = [search, weatherTool];

  const toolNode = new ToolNode(tools);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    maxOutputTokens: 2048,
    apiKey: process.env.GOOGLE_API_KEY,
  }).bindTools(tools);

  function shouldContinue(state) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    return "__end__";
  }

  async function callModel(state) {
    const messages = state.messages;
    const response = await model.invoke(messages);

    return { messages: [response] };
  }

  const workflow = new StateGraph(GraphState)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  const checkpointer = new MemorySaver();

  const app = workflow.compile({ checkpointer });

  const finalState = await app.invoke(
    {
      messages: [new HumanMessage("What is the weather like today?")],
    },
    { configurable: { thread_id: "42" } }
  );

  console.log(
    "Final State:",
    finalState.messages[finalState.messages.length - 1].content
  );
}
