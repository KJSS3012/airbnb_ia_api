import { HumanMessage } from "@langchain/core/messages";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { extractInfoTool } from "../tools/index.js";
import { createModel } from "../config/model.js";
import { transcribeAudio } from "../utils/transcribeAudio.js";
import path from "path";
import { fileURLToPath } from "url";

export async function graphTest() {
  const GraphState = Annotation.Root({
    messages: Annotation({
      reducer: (x, y) => x.concat(y),
    }),
    extractedInfo: Annotation({ reducer: (_, y) => y }),
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const audioPath = __dirname + "/../assets/sound/teste.mp3";
  const tools = [extractInfoTool];
  const toolNode = new ToolNode(tools);

  const model = createModel().bindTools(tools);

  async function callModel(state) {
    const messages = state.messages;
    const response = await model.invoke(messages);
    return { messages: [response] };
  }

  function shouldContinue(state) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    return "__end__";
  }

  const workflow = new StateGraph(GraphState)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  const checkpointer = new MemorySaver();

  const app = workflow.compile({ checkpointer });

  const message = await transcribeAudio(audioPath);

  const finalState = await app.invoke(
    {
      messages: [
        new HumanMessage(
          `Use a tool extract_info para extrair as informações dessa fala: ${message}`
        ),
      ],
    },
    { configurable: { thread_id: "42" } }
  );

  console.log(
    "Resposta final:",
    finalState.messages[finalState.messages.length - 1].content
  );
}
