/** @jsxImportSource frog/jsx */

import { runCliCommand } from '@/app/services/cli'
import { saveImage } from '@/app/services/saveImage'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import path from 'path'
import fs from 'fs/promises';

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  initialState: {
    submitted: false
  }
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.frame('/', async (c) => {

  const { buttonValue, inputText, status, deriveState } = c;

  const state: any = deriveState((previousState: any) => {
    if (buttonValue === 'submit') previousState.submitted = true
  })

  return c.res({
    action: '/submit',
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <img src={state.submitted ? '' : '/frame-placeholder.png'} width='100%' height='100%' />
      </div>
    ),
    intents: [
      <TextInput placeholder='Enter Prompt' />,
      <Button value='submit'>{state.submitted === true ? 'Generating' : 'Generate'}</Button>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

app.frame('/submit', async (c) => {
  const { inputText, url } = c;
  const filePath = await runCliCommand({ userInput: inputText });
  const fileName = path.basename(filePath);
  const destinationPath = path.join(process.cwd(), 'public', fileName);

  try {
    await fs.copyFile(filePath, destinationPath);
    console.log(`Image successfully saved to ${destinationPath}`);
  } catch (err) {
    console.error('Failed to copy file:', err);
    // Handle error, perhaps return an error message or set a default image path
    return c.res({
      action: '/',
      image: (
        <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
          <img src="/placeholder.png" width='100%' height='100%' />
        </div>
      ),
      intents: [
        <Button value='save'>Save</Button>,
        <Button value='reset'>Reset</Button>,
      ],
    });
  }

  // Now that the file is copied, return the response with the correct image URL
  return c.res({
    action: '/',
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        <img src={`/${fileName}`} width='100%' height='100%' />
      </div>
    ),
    intents: [
      <Button value='save'>Save</Button>,
      <Button value='reset'>Reset</Button>,
    ],
  });
});

app.frame('/save', (c: any) => {
  console.log(c.url)

  return c.url
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
