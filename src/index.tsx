import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { Lum0x } from "lum0x-sdk";
import 'dotenv/config'

Lum0x.init(process.env.LUM0X_API_KEY);


const fetchUserByFid = async (fid) => {
  let res = await Lum0x.farcasterUser.getUserByFids({
    fids: String(fid)
  });
  //console.log(JSON.stringify(res, null, 2));
  return res;
}

const fetchMoxieEarningsToday = async (fid) => {
  let res = await Lum0x.farcasterMoxie.getEarningStat({
    entity_type: "USER",
    entity_id:  String(fid),
    timeframe: "TODAY"
  });
  console.log(JSON.stringify(res, null, 2));
  return res;
}

export const app = new Frog({
  apiUrl: "https://hubs.airstack.xyz",
  fetchOptions: {
    headers: {
      "x-airstack-hubs": process.env.AIRSTACK_API_KEY,
    }
  },
  title: 'Frog Frame',
})

app.use('/*', serveStatic({ root: './public' }))

app.frame('/', async (c) => {
  
  const { inputText, status } = c
  const customFid = inputText && !isNaN(parseInt(inputText)) ? parseInt(inputText) : null;
  const fid = c.frameData?.fid;

  const workFid = customFid || fid;
  const userData = workFid ? await fetchUserByFid(workFid) : null
  const userName = userData?.users[0]?.username
  const moxieEarnings = workFid ? await fetchMoxieEarningsToday(workFid) : null
  const moxieEarningsToday = moxieEarnings?.data?.FarcasterMoxieEarningStats?.FarcasterMoxieEarningStat?.[0]?.allEarningsAmount ?? 0;

  // console.log(c.frameData)
  // console.log(c.trustedData)
  console.log(JSON.stringify(userData, null, 2))
  console.log(moxieEarningsToday)
  console.log(userName)

  if(workFid && !userName) {
    return c.res({
      status: 404
    })
  }

  return c.res({
    imageAspectRatio: '1:1',
    imageOptions: {
      height: 1000,
      width: 1000,
    },
    image: (
      status === 'response'
      ?
      <div
        style={{
          alignItems: 'flex-start',
          background: 'linear-gradient(45deg, #4B0954, #170034)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'flex-start',
          width: '100%',
          padding: '50px 50px'
        }}
      >
        <div
          style={{
            //border: '1px solid #ffffffa0',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
          
          <div
            style={{
              //border: '1px solid #ffffffa0',
              display: 'flex',
            }}
          >
            <img src={userData?.users[0]?.pfp_url || 'https://www.gravatar.com/avatar'} style={{width:200, height:200, border:'5px solid #ffffff40', borderRadius:'50%'}} />
          </div>
          <div
            style={{
              //border: '1px solid #ff0000',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                color: 'white',
                fontSize: 80,
                fontStyle: 'bold',
                letterSpacing: '-0.025em',
                padding: '0 20px',
                display: 'flex',
              }}
            >
              {userName}
            </div>
            <div
              style={{
                color: '#AAAAAA',
                fontSize: 40,
                fontStyle: 'bold',
                letterSpacing: '-0.025em',
                padding: '0 20px',
                display: 'flex',
              }}
            >
              fid: {workFid}
            </div>
          </div>
        </div>
        <div
          style={{
            //border: '1px solid #ffffffa0',
            color: '#AAAAAA',
            fontSize: 40,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            width: '100%',
            marginTop: 150,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
            Moxie earnings today:
        </div>
        <div
          style={{
            //border: '1px solid #ffffffa0',
            color: '#00ff00',
            fontSize: 240,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            whiteSpace: 'pre-wrap',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            fontWeight: 700,
          }}
        >
            {Math.round(moxieEarningsToday)?.toLocaleString()}
        </div>
      </div>
      :
      <div
        style={{
          alignItems: 'flex-start',
          background: 'linear-gradient(135deg, #4B0954, #170034)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
          padding: '50px 50px',
          color: 'white',
          fontSize: 70,

        }}
      >
        Moxie Daily Rewards Frame.
        <br />&nbsp;
        <br />
        Click [MyEarnings] to see your moxie earnings!
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter fid..." />,
      <Button>MyEarnings/🔎</Button>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

devtools(app, { serveStatic })
