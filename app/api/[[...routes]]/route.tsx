/** @jsxImportSource frog/jsx */

import { runCliCommand } from '@/app/services/cli'
import { Button, Frog, TextInput, FrameContext, FrameResponse, TypedResponse, Env } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import path from 'path'
import fs from 'fs/promises'
import { BlankInput } from 'hono/types'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.frame('/', async (c) => {
  const { status } = c
  return c.res({
    action: '/submit',
    image: '/frame-placeholder.png',
    intents: [
      <TextInput placeholder="Enter Prompt" />,
      <Button value="generate">Generate</Button>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

// Assuming c.res() correctly handles Promise responses internally.
app.frame('/submit', async (c: FrameContext<Env, "/submit", BlankInput>): Promise<Response | TypedResponse<FrameResponse>> => {
  const { inputText, url } = c;
  try {
    const filePath = await runCliCommand({ userInput: inputText });
    const fileName = path.basename(filePath);
    const destinationPath = path.join(process.cwd(), 'public', fileName);

    // Wait for the copy operation to complete before responding
    await fs.copyFile(filePath, destinationPath);
    console.log(`Image successfully saved to ${destinationPath}`);

    return c.res({
      action: '/save',
      image: fileName ? `/${fileName}` : 'frame-placeholder.png',
      intents: [
        <Button.Link href={`/${fileName}`}>View Image</Button.Link>,
        <Button value='reset'>Reset</Button>,
      ],
    });

  } catch (err) {
    console.error('Failed to copy file:', err);

    return c.res({
      action: '/save',

      image: (
        <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
          An error has occurred. Reset and try again!
        </div>
      ),
      intents: [
        <Button value='reset'>Reset</Button>,
      ],
    });
  }
});

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
