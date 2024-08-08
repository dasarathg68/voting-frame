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
  {
    value: "DeFi",
    optionTag: "C",
    voteCount: 0,
  },
  {
    value: "Aptos",
    optionTag: "D",
    voteCount: 0,
  },
];
app.frame("/", (c) => {
  const { buttonValue, inputText, status } = c;
  const fruit = inputText || buttonValue;
  if (status === "response") {
    pollingOptions = pollingOptions.map((option) => {
      if (buttonValue === option.value) {
        return { ...option, voteCount: option.voteCount + 1 };
      }
      return option;
    });
    return c.res({
      image: (
        <div
          style={{
            background:
              status === "response"
                ? "linear-gradient(to right, #432889, #17101F)"
                : "black",
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
          backgroundColor: "red",
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
    ],
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
