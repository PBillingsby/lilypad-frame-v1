import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

const URL = "http://js-cli-wrapper.lilypad.tech";
const pk = process.env.PRIVATE_KEY;
const module = "sdxl-pipeline:v0.9-base-lilypad3";


interface StreamResponse {
  status?: string;
  error?: string;
}

export async function stream(inputs: string): Promise<StreamResponse> {
  // const body = JSON.stringify({ pk, module, inputs: `Prompt='${inputs}'`, stream: true }); // dynamic inputs
  // console.log(body)

  // hardcoded inputs
  const body = JSON.stringify({ pk, module: "cowsay:v0.0.3", inputs: `Message='a boat in a lake'`, stream: true });
  try {
    const res = await fetch(URL, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body,
    });

    if (!res.body) {
      return { error: "Response body is null" };
    }

    // Ensure the output directory exists
    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const fileStream = fs.createWriteStream(path.join(outputDir, 'result'));

    for await (const chunk of res.body) {
      fileStream.write(chunk);
    }

    fileStream.end();

    return new Promise((resolve, reject) => {
      fileStream.on("finish", () => {
        resolve({ status: "done" });
      });

      fileStream.on("error", (error: Error) => {
        reject({ error: error.message });
      });
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
}