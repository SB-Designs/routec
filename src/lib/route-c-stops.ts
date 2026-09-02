export type Stop = {
  id: string;
  time: string;
  name: string;
  w3w?: string;
  lat: number;
  long: number;
};

/** Approximate coordinates for each Route C stop (used for distance / ETA estimates). */
export const MORNING_STOPS: Stop[] = [
  { id: "am-1", time: "07:10", name: "Brentwood, Ingrave Road Bus Stop Queens Road", w3w: "season.jumps.cans", lat: 51.6197, long: 0.3095 },
  { id: "am-2", time: "07:15", name: "Shenfield Railway Station Bus Stop", w3w: "rungs.cities.kicks", lat: 51.6307, long: 0.3298 },
  { id: "am-3", time: "07:25", name: "Queens Park Roundabout Bus Stop", w3w: "estate.studio.themes", lat: 51.6135, long: 0.4083 },
  { id: "am-4", time: "07:30", name: "Stock Road (Bus Stop Mayflower)", w3w: "driver.survey.privately", lat: 51.6339, long: 0.4213 },
  { id: "am-5", time: "07:31", name: "Stock Road (Bus Stop Headley Road)", w3w: "dragon.studio.voice", lat: 51.6300, long: 0.4198 },
  { id: "am-6", time: "07:33", name: "High Street (Bus Stop Chequers)", w3w: "civil.salon.glue", lat: 51.6276, long: 0.4183 },
  { id: "am-7", time: "07:36", name: "Laindon Road, Sun Corner", w3w: "sobs.first.grows", lat: 51.6215, long: 0.4180 },
  { id: "am-8", time: "07:37", name: "Noak Hill Road (Bus Stop adj Church Street – Great Burstead)", w3w: "often.storms.leaps", lat: 51.6155, long: 0.4247 },
  { id: "am-9", time: "07:39", name: "Noak Hill Road (Bus Stop adj Royston Avenue – Eastbound)", w3w: "spin.input.rooms", lat: 51.6142, long: 0.4321 },
  { id: "am-10", time: "08:15", name: "Arrive at Westcliff High Schools – Bus Stop C", w3w: "rubble.invent.menu", lat: 51.5497, long: 0.6867 },
  { id: "am-11", time: "08:20", name: "Arrive at Southend High for Boys – drop off outside front of school", w3w: "become.busy.aspect", lat: 51.5510, long: 0.6912 },
];

export const AFTERNOON_STOPS: Stop[] = [
  { id: "pm-1", time: "15:38", name: "Depart Southend High for Boys – Bus Stop Hobleythick Lane", w3w: "blues.slower.risks", lat: 51.5512, long: 0.6905 },
  { id: "pm-2", time: "15:47", name: "Depart Westcliff High Schools – Bus Stop B", w3w: "stores.ground.exact", lat: 51.5499, long: 0.6862 },
  { id: "pm-3", time: "16:14", name: "Noak Hill Road (Bus Stop Church Road – Westbound)", w3w: "radio.steer.lofts", lat: 51.6150, long: 0.4252 },
  { id: "pm-4", time: "16:16", name: "Noak Hill Road (Bus Stop Great Burstead)", w3w: "dads.ruler.outer", lat: 51.6163, long: 0.4235 },
  { id: "pm-5", time: "16:17", name: "Billericay School", w3w: "drips.shave.horns", lat: 51.6193, long: 0.4212 },
  { id: "pm-6", time: "16:20", name: "High Street (Bus Stop Chequers)", w3w: "looks.nature.candy", lat: 51.6274, long: 0.4186 },
  { id: "pm-7", time: "16:22", name: "Stock Road (Bus Stop Headley Road)", w3w: "fish.entertainer.beans", lat: 51.6302, long: 0.4200 },
  { id: "pm-8", time: "16:23", name: "Stock Road (Bus Stop Robin Close)", lat: 51.6335, long: 0.4210 },
  { id: "pm-9", time: "16:28", name: "Perry Street (Bus Stop Atridge Chase)", w3w: "jets.goes.voices", lat: 51.6390, long: 0.3760 },
  { id: "pm-10", time: "16:38", name: "Shenfield Station", w3w: "arts.clap.degree", lat: 51.6307, long: 0.3298 },
  { id: "pm-11", time: "16:43", name: "Wilsons Corner, Brentwood", w3w: "native.wizard.scuba", lat: 51.6212, long: 0.3062 },
];

export const ALL_STOPS = [...MORNING_STOPS, ...AFTERNOON_STOPS];

export function haversineKm(a: { lat: number; long: number }, b: { lat: number; long: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.long - a.long);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Rough road distance + ETA from straight-line distance. */
export function estimate(distanceKm: number) {
  const roadKm = distanceKm * 1.3;
  const avgKmh = roadKm > 15 ? 55 : roadKm > 5 ? 40 : 25;
  return { roadKm, minutes: Math.max(1, Math.round((roadKm / avgKmh) * 60)) };
}
