# Bus Tracker Pro

Use this api (https://ticket.sbdesigns.workers.dev/customer-ticket/[ticketid]

const API_BASE =

  "https://k4dxsjc6v3.execute-api.eu-west-1.amazonaws.com/prod/live-tracking/customer-ticket";




const ALLOWED_ORIGIN = "https://shuttleidticket.pages.dev";




export default {

  async fetch(request) {

    const origin = request.headers.get("Origin");




    if (request.method === "OPTIONS") {

      return new Response(null, {

        status: 204,

        headers: {

          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,

          "Access-Control-Allow-Methods": "GET, OPTIONS",

          "Access-Control-Allow-Headers": "Content-Type",

        },

      });

    }




    const url = new URL(request.url);




    // Expected:

    // /customer-ticket/YOUR-TICKET-ID

    const match = url.pathname.match(

      /^\/customer-ticket\/([^/]+)$/

    );




    if (!match) {

      return new Response(

        JSON.stringify({

          error: "Missing ticket ID",

        }),

        {

          status: 400,

          headers: {

            "Content-Type": "application/json",

            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,

          },

        }

      );

    }




    const ticketId = decodeURIComponent(match[1]);




    const apiResponse = await fetch(

      `${API_BASE}/${encodeURIComponent(ticketId)}`,

      {

        method: "GET",

        headers: {

          Accept: "application/json",

        },

      }

    );




    const body = await apiResponse.text();




    return new Response(body, {

      status: apiResponse.status,

      headers: {

        "Content-Type":

          apiResponse.headers.get("Content-Type") ||

          "application/json",

        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,

        "Access-Control-Allow-Methods": "GET, OPTIONS",

      },

    });

  },

};

let the user input their ticket id and display info fetched from the api. only proceed if "Route C" is fetched as route.

e.g. {"api_key":"pk.eyJ1Ijoic2JjY29hY2hlcyIsImEiOiJjbG15eTFhejkwM3l3MnVtdjhqMHdzb2tjIn0.cmIRt1Bs24fcpE-Sjizn5w","client_id":"ff66bf97-4613-4042-84ed-267597d98fa5","enabled":true,"last_updated":"2026-08-27T11:14:22.348Z","lat":51.596333,"long":0.5455847,"pk":"7b5dc3f3-9305-4a78-9927-51cee7d07443","sk":"TYPE#SERVICE","linked":[],"id":"99806934-c04c-4d55-b9ac-2618b1f245b2","service_name":"Route C"}

update location every 10s

let user select their bus stop

Time – Pick up Point

• 07:10 Brentwood Ingrave Road Bus Stop Queens Road ///season.jumps.cans

• 07.15 Shenfield Railway Station Bus Stop ///rungs.cities.kicks

• 07:25 Queens Park Roundabout Bus Stop ///estate.studio.themes

• 07:30 Stock Road (Bus Stop Mayflower) ///driver.survey.privately

• 07:31 Stock Road (Bus Stop Headley Road) ///dragon.studio.voice

• 07:33 High Street (Bus Stop Chequers) ///civil.salon.glue

• 07.36 Laindon Road Sun Corner ///sobs.first.grows

• 07:37 Noak Hill Road (Bus Stop adj Church Street – Great Burstead) ///often.storms.leaps

• 07:39 Noak Hill Road (Bus Stop Adj Royston Avenue – Eastbound) ///spin.input.rooms

• 08:15 Arrive at Westcliff High Schools – Bus Stop C ///rubble.invent.menu

• 08.20 Arrive at Southend High for Boys - Drop off outside front of school ///become.busy.aspect

Time – Drop off Point

• 15:38 Depart Southend High for Boys - Bus Stop Hobleythick Lane ///blues.slower.risks

• 15.47 Depart Westcliff High Schools – Bus Stop B ///stores.ground.exact

• 16:14 Noak Hill Road (Bus Stop Church Road – Westbound) ///radio.steer.lofts

• 16:16 Noak Hill Road (Bus Stop Great Burstead) ///dads.ruler.outer

• 16:17 Billericay School ///drips.shave.horns

• 16:20 High Street (Bus Stop Chequers) ///looks.nature.candy

• 16:22 Stock Road (Bus Stop Headley Road) ///fish.entertainer.beans

• 16:23 Stock Road (Bus Stop Robin Close)

• 16:28 Perry Street, (Bus Stop Atridge Chase) ///jets.goes.voices

• 16.38 Shenfield Station ///arts.clap.degree

• 16.43 Wilsons Corner Brentwood ///native.wizard.scuba


and api gives distance from bus to stop as well as time.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://routec.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ec1bc146-37f4-44f3-9e1e-e7eff9dadfb5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
