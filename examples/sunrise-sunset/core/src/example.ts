import {
  calculateSunTimes,
  getBrowserTimeZone,
  resolveSolarLocation,
} from "@theme-kit/core";

/** Explicit coordinates: resolved as-is. */
const kathmandu = resolveSolarLocation({ latitude: 27.7172, longitude: 85.324 });
console.log("resolved location:", kathmandu);

/** Or resolve from an IANA timezone instead of coordinates. */
const fromZone = resolveSolarLocation({ timeZone: "Asia/Kathmandu" });
console.log("from timezone:", fromZone.latitude, fromZone.longitude);

/** Today's sunrise/sunset for a location. */
const { sunrise, sunset } = calculateSunTimes(new Date(), 27.7172, 85.324);
console.log("sunrise:", sunrise.toISOString());
console.log("sunset:", sunset.toISOString());

/** On the server there is no browser timezone; `null` signals that. */
console.log("browser timezone:", getBrowserTimeZone() ?? "(unavailable)");
