/** @jsxImportSource frog/jsx */
import { saveImage } from '@/app/services/saveImage'
import { stream } from '@/app/services/stream'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import fetch from 'node-fetch';

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
        <img src="/frame-placeholder.png" width="100%" height="100%" />
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter Prompt" />,
      <Button value="submit">Generate</Button>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

app.frame('/submit', async (c) => {
  const { inputText, url, status } = c
  let loading = true;
  let generatedImageUrl;
  try {
    console.log("PRE FETCHING....");

    const response = await stream(inputText ?? "");

    console.log("POST FETCHING....", response);

    // generatedImageUrl = response.url;
    let loading = false;
  } catch (error) {
    console.log(error);
    // c.res.status(500).send('Error processing command: ' + error.message);
  }
  // Replace img src with returned IPFS link
  return c.res({
    action: '/',
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        {loading ?
          <img src={"https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE"} />
          :
          <img src={generatedImageUrl} />
        }
      </div>
    ),
    intents: [
      status === 'response' && <Button>...generating</Button>,
      status !== 'response' && <Button value="save">Save</Button>,
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
