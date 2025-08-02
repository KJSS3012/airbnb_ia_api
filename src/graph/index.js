import { HumanMessage } from "@langchain/core/messages";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { extractInfoTool } from "../tools/index.js";
import { createModel } from "../config/model.js";

export async function graphTest() {
  const GraphState = Annotation.Root({
    messages: Annotation({
      reducer: (x, y) => x.concat(y),
    }),
    extractedInfo: Annotation({ reducer: (_, y) => y }),
  });

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

  const finalState = await app.invoke(
    {
      messages: [
        new HumanMessage(
          "Use a tool extract_info para extrair as informações dessa fala: Entre 10/08/2025 e 20/08/2025, quero passar 5 dias em Paris. Estou disposto a gastar até 3000 em passagens e 2000 em hospedagem. Para hospedagem, quero ar condicionado, café da manhã e wifi. Quais opções eu tenho?"
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
