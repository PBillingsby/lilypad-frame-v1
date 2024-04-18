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

  return new Promise((resolve, reject) => {
    const command = 'lilypad';
    const args = ['run', 'sdxl-pipeline:v0.9-base-lilypad3', '-i', `PROMPT="${userInput}"`];
    const options = {
      env: {
        ...process.env,
        WEB3_PRIVATE_KEY: web3PrivateKey
      }
    };

    // Log the command and its arguments for debugging
    console.log('Running command:', command, args.join(' '));

    // Spawn the process with the command, arguments, and options
    const child = spawn(command, args, options);

    let accumulatedOutput = ''; // Accumulate output from stdout

    child.stdout.on('data', (data) => {
      console.log(data.toString())
      accumulatedOutput += data.toString(); // Append data to the accumulated output
    });

    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`Command failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
        return;
      }

      console.log('Command executed successfully.');
      // Process accumulated output after the process closes
      const lines = accumulatedOutput.trim().split('\n');
      const pathLine = lines.find(line => line.includes('open '));
      if (!pathLine) {
        reject(new Error('No "open" command found in output.'));
      } else {
        const filePath = pathLine.replace('open ', '').trim() + '/outputs/output_00001_.png';
        resolve(filePath);
      }
    });
  });
}
