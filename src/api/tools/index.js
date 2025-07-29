import { tool } from "@langchain/core/tools";
import z from "zod";

const testTool = async () => {
  const magicTool = tool(
    async ({ input }) => {
      return `You said: ${input}`;
    },
    {
      name: "test_tool",
      description: "A tool that echoes back the input",
      schema: {
        type: z.object({
          input: z.string().describe("The input to echo back"),
        }),
      },
    }
  );
};

export default testTool;
