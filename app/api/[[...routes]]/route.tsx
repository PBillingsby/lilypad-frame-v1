/** @jsxImportSource frog/jsx */

import { runCliCommand } from '@/app/services/cli'
import { saveImage } from '@/app/services/saveImage'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.frame('/', async (c) => {
  const { buttonValue, inputText, status } = c
  return c.res({
    action: '/submit',
    image: (
      <div
        style={{
          alignItems: 'center',
          background:
            status === 'response'
              ? 'linear-gradient(to right, #432889, #17101F)'
              : 'black',
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
        {status === 'response'
          ? `Nice choice.${inputText?.toUpperCase()}`
          :
          <img src="/frame-placeholder.png" width="100%" height="100%" />
        }
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter Prompt" />,
      <Button value="generate">Generate</Button>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

app.frame('/submit', async (c) => {
  const { inputText, url } = c

  try {
    const filePath = await runCliCommand({ userInput: inputText });
    const urlPath = filePath.replace('/tmp/lilypad/data/downloaded-files', '');
    console.log(filePath, urlPath)
  } catch (error) {
    console.log(error)
    // c.res.status(500).send('Error processing command: ' + error.message);
  }
  // Replace img src with returned IPFS link
  return c.res({
    action: '/',
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        <img src="https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE" />
      </div>
    ),
    intents: [
      <Button value="save">Save</Button>,
      <Button value="reset">Reset</Button>,
    ],
  })
})

app.frame('/save', (c: any) => {
  console.log(c.url)

  return c.url
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
