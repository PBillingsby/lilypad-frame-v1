import { spawn } from "child_process";

interface CLIProps {
  userInput: string | undefined;
}

export async function runCliCommand({ userInput }: CLIProps): Promise<string> {
  console.log("Lilypad Starting...");
  const web3PrivateKey = process.env.WEB3_PRIVATE_KEY;
  if (!web3PrivateKey) {
    console.error('WEB3_PRIVATE_KEY is not set in the environment variables.');
    throw new Error('WEB3_PRIVATE_KEY not set');
  }

  const child = spawn('lilypad', ['run', 'sdxl:v0.9-lilypad1', '-i', `PromptEnv=PROMPT=${userInput}`], {
    env: {
      ...process.env,
      WEB3_PRIVATE_KEY: web3PrivateKey,
      SERVICE_SOLVER: process.env.SERVICE_SOLVER
    }
  });

  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log('Command executed successfully.');
    } else {
      console.error(`Command failed with code ${code}`);
    }
  });

  return "string";
}
