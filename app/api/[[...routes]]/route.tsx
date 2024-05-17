/** @jsxImportSource frog/jsx */
import { saveImage } from '@/app/services/saveImage'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import fetch from 'node-fetch';

const fetchWithTimeout = async (url: string, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const { signal } = controller;
  const fetchPromise = fetch(url, { ...options, signal });

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetchPromise;
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

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
    const URL = "http://js-cli-wrapper.lilypad.tech"
    const pk = process.env.PRIVATE_KEY
    const module = "sdxl-pipeline:v0.9-base-lilypad3"

    const response = await fetchWithTimeout(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pk, module, inputText })
    }, 10000).then((raw: any) => raw.json());

    generatedImageUrl = response.url;
    loading = false
  } catch (error) {
    console.log(error)
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
