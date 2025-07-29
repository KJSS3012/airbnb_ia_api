import test from "./src/api/agent/index.js";
import { graphTest } from "./src/api/graph/index.js";

(async () => {
  try {
    await test();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
})();
