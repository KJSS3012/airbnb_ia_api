import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const transcribeAudio = async (filePath) => {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  const audioData = fs.readFileSync(filePath);
  const uploadRes = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    audioData,
    {
      headers: {
        authorization: apiKey,
        "content-type": "application/octet-stream",
      },
    }
  );

  const audioUrl = uploadRes.data.upload_url;

  const transcriptRes = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    {
      audio_url: audioUrl,
      language_code: "pt",
    },
    {
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
    }
  );

  const transcriptId = transcriptRes.data.id;

  let transcriptData;
  while (true) {
    const polling = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: { authorization: apiKey },
      }
    );

    if (polling.data.status === "completed") {
      transcriptData = polling.data;
      break;
    } else if (polling.data.status === "error") {
      console.error("Erro na transcrição:", polling.data.error);
      return;
    }
  }

  return transcriptData.text;
};
