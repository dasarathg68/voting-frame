import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/vercel";

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Frog Frame",
});
let pollingOptions = [
  {
    value: "Rollups and Layer2",
    optionTag: "A",
    voteCount: 0,
  },
  {
    value: "Account abstraction",
    optionTag: "B",
    voteCount: 0,
  },
];
let votes: any = [];
let fIDs: any = [];
app.frame("/", (c) => {
  const { buttonValue, inputText, status, frameData } = c;
  if (buttonValue === "Submit" && inputText) {
    if (pollingOptions.length < 3) {
      console.log("pollingOptions", pollingOptions.length);
      pollingOptions.push({
        value: inputText ?? "",
        optionTag: "C",
        voteCount: 1,
      });
      votes.push({ topic: inputText, fid: frameData?.fid });
    }
  } else if (buttonValue == "Submit" && !inputText) {
    return c.res({
      image: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
            backgroundColor: "white",
            alignItems: "center",
            fontSize: "2.5rem",
          }}
        >
          <h1>Empty topic</h1>
        </div>
      ),
    });
  }

  if (status === "response") {
    if (fIDs.includes(frameData?.fid)) {
      return c.res({
        image: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
              backgroundColor: "white",
              alignItems: "center",
              fontSize: "2.5rem",
            }}
          >
            <h1>
              You have already voted for{" "}
              {votes.map((vote: any) => {
                if (vote.fid === frameData?.fid) {
                  return vote.topic;
                }
              })}
            </h1>
          </div>
        ),
      });
    }
    fIDs.push(frameData?.fid);

    pollingOptions = pollingOptions.map((option) => {
      if (buttonValue === option.value) {
        votes.push({ topic: option.value, fid: frameData?.fid });

        return { ...option, voteCount: option.voteCount + 1 };
      }
      return option;
    });
    return c.res({
      image: (
        <div
          style={{
            background: "white",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
            fontSize: "3.5rem",
          }}
        >
          <h1>Thank you for voting</h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              width: "100%",
              fontWeight: "bold",
              fontSize: "3.5rem",
            }}
          >
            {pollingOptions.map((option) => {
              return (
                <li>
                  {option.optionTag}.{option.value} : {option.voteCount}
                </li>
              );
            })}
          </div>
        </div>
      ),
      intents: [<Button value="Vote again">Vote Again</Button>],
    });
  }
  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          backgroundColor: "white",
          alignItems: "center",
          fontSize: "2.5rem",
        }}
      >
        <h1>What topics do you want covered</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {pollingOptions.map((option) => {
            return (
              <div style={{ display: "flex" }}>
                {option.optionTag}:{option.value}
              </div>
            );
          })}
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter your own topic" />,
      ...pollingOptions.map((option) => {
        return <Button value={option.value}>{option.optionTag}</Button>;
      }),
      <Button value="Submit">Submit</Button>,
    ],
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
