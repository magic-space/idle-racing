import uuid from 'uuid-random';

import { ATTRIBUTE_TYPES } from './utils';

import carsFile from '../assets/lists/cars.json';

import tracksFile from '../assets/lists/tracks.json';

import raceSponsorsFile from '../assets/lists/raceSponsors.json';

import raceEventsFile from '../assets/lists/raceEvents.json';

const inDev = process.env.NODE_ENV === 'development';

const devDuration = inDev && 1 * 1000;

export const availableColors = [

  'blue',

  'darkgray',

  'gray',

  'green',

  'lightblue',

  'lightgray',

  'orange',

  'pink',

  'purple',

  'red',

  'yellow',

];

export const dealerBrands = [

  { type: 'compact', name: 'compact' },

  { type: 'city', name: 'city' },

  { type: 'family', name: 'family' },

  { type: 'offroad', name: 'offroad' },

  { type: 'supercar', name: 'supercar' },

  { type: 'f1', name: 'f1' },

  { type: 'racer', name: 'racer' },

  { type: 'nascar', name: 'nascar' },

  { type: 'prototype', name: 'prototype' },

  { type: 'heavy', name: 'heavy' },

];

const generateRaceEvent = raceEvent => ({
  name: raceEvent.name,
  type: raceEvent.type,
  exp: raceEvent.exp,
  unlockedTracks: raceEvent['unlocked_tracks'],
  unlockRequirements: {
    type: raceEvent['req_type'],
    value: raceEvent['req_value'],
  },
});

export const raceEvents = raceEventsFile.reduce(
  (results, raceEvent) =>
    raceEvent?.type.length > 0
      ? [...results, generateRaceEvent(raceEvent)]
      : results,
  []
);

const generateAttribute = (base, unit, max, basePrice, upgrade) => {
  const value = base + unit * upgrade;
  const nextValue = base + unit * (upgrade + 1);
  const price = Math.round(
    basePrice + (Math.pow(basePrice * 0.5, 1 + upgrade / 10) - 1)
  );

  return {
    base,
    unit,
    max,
    basePrice,
    value,
    upgrade,
    upgradeValue: upgrade < max ? nextValue : value,
    price: upgrade < max ? price : undefined,
    priceRaw: price,
  };
};

export const generateCarPrice = car =>
  car.basePrice +
  200 * car[ATTRIBUTE_TYPES.ACCELERATION].upgrade +
  200 * car[ATTRIBUTE_TYPES.SPEED].upgrade +
  200 * car[ATTRIBUTE_TYPES.HANDLING].upgrade;

const generateCar = car => {
  const categories = parseStringArray(car.categories);

  return {
    id: car.id,
    name: car.name,
    type: car.type,
    [ATTRIBUTE_TYPES.ACCELERATION]: generateAttribute(
      car.acc,
      1,
      car['acc ups'],
      ~~(car.price / 10),
      0
    ),
    [ATTRIBUTE_TYPES.SPEED]: generateAttribute(
      car.spd,
      1,
      car['spd ups'],
      ~~(car.price / 10),
      0
    ),
    [ATTRIBUTE_TYPES.HANDLING]: generateAttribute(
      car.hnd,
      1,
      car['hnd ups'],
      ~~(car.price / 10),
      0
    ),
    brand: car.brand,
    price: car.price,
    reward: categories.includes('reward'),
    total: car.total,
    totalUp: car['total up'],
    defaultColors: car['default colors'].trim().slice(1, -1).split(','),
    imageFile: car['image file'],
    categories,
  };
};

const carDevaluation = 0.5;

export const generateGarageCar = (car, color, reward = false) => ({
  id: uuid(),
  name: car.name,
  type: car.type,
  [ATTRIBUTE_TYPES.ACCELERATION]: car[ATTRIBUTE_TYPES.ACCELERATION],
  [ATTRIBUTE_TYPES.SPEED]: car[ATTRIBUTE_TYPES.SPEED],
  [ATTRIBUTE_TYPES.HANDLING]: car[ATTRIBUTE_TYPES.HANDLING],
  basePrice: ~~(car.price * carDevaluation),
  price: ~~(car.price * carDevaluation),
  dealerCar: car.id,
  brand: car.brand,
  race: undefined,
  timestamp: new Date().getTime(),
  reward,
  tuning: {
    [ATTRIBUTE_TYPES.ACCELERATION]: 0,
    [ATTRIBUTE_TYPES.SPEED]: 0,
    [ATTRIBUTE_TYPES.HANDLING]: 0,
  },
  color,
  imageFile: car.imageFile,
  categories: car.categories,
});

export const upgradeAttribute = attribute => {
  if (attribute.upgrade >= attribute.max) {
    return attribute;
  }

  return generateAttribute(
    attribute.base,
    attribute.unit,
    attribute.max,
    attribute.basePrice,
    attribute.upgrade + 1
  );
};

const parseRequirement = rawRequirement => {
  if (rawRequirement.startsWith('no_ups')) {
    return {
      type: 'no_ups',
    };
  }

  if (rawRequirement.startsWith('car_')) {
    return {
      type: 'car',
      value: rawRequirement.split('_')[1],
    };
  }

  if (rawRequirement.startsWith('cat_')) {
    return {
      type: 'cat',
      value: rawRequirement.split('_')[1],
    };
  }

  if (rawRequirement.startsWith('type_')) {
    return {
      type: 'type',
      value: rawRequirement.split('_')[1],
    };
  }

  if (rawRequirement.startsWith('attr_')) {
    const splitAttrLimiter = rawRequirement.split('_');
    return {
      type: 'attr',
      value: {
        attr: splitAttrLimiter[1],
        compare: splitAttrLimiter[2],
        value: splitAttrLimiter[3],
      },
    };
  }
};

const parseStringArray = string => {
  return string.trim().slice(1, -1).split(',');
};

const parseRequirements = rawRequirements => {
  return parseStringArray(rawRequirements)
    .filter(item => item.length > 0)
    .map(requirement => parseRequirement(requirement));
};

const generateTrack = track => ({
  id: track.id,
  name: track.name,
  duration: devDuration || track.duration * 1000,
  price: track.price,
  prizes: [track['prize 1'], track['prize 2'], track['prize 3']],
  category: track.category,
  [ATTRIBUTE_TYPES.ACCELERATION]: track.acc > 1 ? 1 : track.acc,
  [ATTRIBUTE_TYPES.SPEED]: track.spd > 1 ? 1 : track.spd,
  [ATTRIBUTE_TYPES.HANDLING]: track.hnd > 1 ? 1 : track.hnd,
  max: track.max,
  requirements: parseRequirements(track.requirements),
  image: track.image,
});

export const generateRace = (car, track, auto) => ({
  id: uuid(),
  car: car.id,
  track: track.id,
  start: new Date().getTime(),
  startOriginal: new Date().getTime(),
  duration: track.duration,
  name: track.name,
  auto,
  resets: 0,
});

export const resetRace = (race, resets) => ({
  ...race,
  start: new Date().getTime(),
  resets: resets ?? ~~race.resets + 1,
});

export const generatePastRace = (
  race,
  car,
  track,
  reward,
  position,
  results,
  prizes
) => ({
  id: uuid(),
  race: race.id,
  car: car.id,
  dealerCar: car.dealerCar,
  track: track.id,
  timestamp: new Date().getTime(),
  checked: false,
  reward,
  position,
  results,
  prizes: [...prizes],
});

export const generateToast = (title, subtitle, type, extra = {}) => ({
  id: uuid(),
  title,
  subtitle,
  type,
  extra,
});

const generateSponsors = () => {
  const sponsors = raceEvents.reduce((result, raceEvent) => {
    const eventTracksSponsors = tracks
      .filter(track => track.category === raceEvent.type)
      .map(track => ({
        event: raceEvent.type,
        type: 'win',
        times: 1,
        reward: 'money',
        track: track.id,
        id: `${track.id}_sponsor`,
      }));

    return [...result, ...eventTracksSponsors];
  }, []);

  const allSponsors = raceEvents.reduce((result, raceEvent) => {
    const transformAllSponsors = raceSponsorsFile
      .filter(sponsor => sponsor?.event === 'all')
      .map(sponsor => ({
        ...sponsor,
        event: raceEvent.type,
        id: `${sponsor.id}_${raceEvent.type}`,
      }));
    return [...result, ...transformAllSponsors];
  }, []);

  return [
    ...allSponsors,
    ...raceSponsorsFile.filter(
      sponsor => sponsor?.event.length > 0 && sponsor.event !== 'all'
    ),
    ...sponsors,
  ];
};

export const cars = carsFile.reduce(
  (results, car) =>
    car?.id.length > 0 ? [...results, generateCar(car)] : results,
  []
);

export const tracks = tracksFile.reduce(
  (results, track) =>
    track?.id.length > 0 && track['prize 1']
      ? [...results, generateTrack(track)]
      : results,
  []
);

export const raceSponsors = generateSponsors();
