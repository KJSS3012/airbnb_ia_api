import { graphTest } from "./src/graph/index.js";

(async () => {
  try {
    await graphTest();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
})();
