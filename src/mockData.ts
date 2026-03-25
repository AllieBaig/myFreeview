import { addHours, startOfHour, setMinutes, setSeconds, addMinutes } from 'date-fns';
import { Channel, Program } from './types';

const CATEGORIES = ['News', 'Drama', 'Comedy', 'Documentary', 'Sports', 'Movies', 'Kids'];

const TITLES: Record<string, string[]> = {
  News: ['BBC News at Ten', 'Breakfast', 'Newsnight', 'Global Report', 'Local News'],
  Drama: ['EastEnders', 'Casualty', 'Doctor Who', 'Sherlock', 'The Crown', 'Line of Duty'],
  Comedy: ['The Office', 'Peep Show', 'Taskmaster', 'Fawlty Towers', 'Blackadder'],
  Documentary: ['Planet Earth', 'The Blue Planet', 'Horizon', 'Louis Theroux', 'Great British Bake Off'],
  Sports: ['Match of the Day', 'Wimbledon Live', 'Formula 1: The Race', 'Cricket Highlights'],
  Movies: ['The Great Escape', 'Skyfall', 'Harry Potter', 'Paddington', 'The King\'s Speech'],
  Kids: ['Bluey', 'Peppa Pig', 'Hey Duggee', 'Horrible Histories', 'Danger Mouse'],
};

const DESCRIPTIONS = [
  "An in-depth look at the latest events shaping our world today.",
  "Tensions rise as secrets are revealed in this gripping installment.",
  "A hilarious take on everyday life with unexpected twists.",
  "Explore the wonders of the natural world in stunning detail.",
  "High-stakes competition as the world's best athletes face off.",
  "A cinematic masterpiece that will leave you on the edge of your seat.",
  "Fun and educational adventures for the whole family to enjoy."
];

function generatePrograms(channelId: string, startTime: Date): Program[] {
  const programs: Program[] = [];
  let currentStart = startTime;
  const endTime = addHours(startTime, 24);

  let i = 0;
  while (currentStart < endTime) {
    const durationMinutes = [30, 60, 90, 120][Math.floor(Math.random() * 4)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const titles = TITLES[category];
    const title = titles[Math.floor(Math.random() * titles.length)];
    
    const end = addMinutes(currentStart, durationMinutes);
    
    programs.push({
      id: `${channelId}-prog-${i}`,
      title,
      description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
      start: currentStart,
      end: end > endTime ? endTime : end,
      category,
      image: `https://picsum.photos/seed/${channelId}-${i}/400/225`,
    });

    currentStart = end;
    i++;
  }

  return programs;
}

export function getMockChannels(): Channel[] {
  const now = startOfHour(new Date());
  const startTime = setMinutes(setSeconds(now, 0), 0);

  const channels: Partial<Channel>[] = [
    { id: 'bbc1', name: 'BBC One', logo: 'https://picsum.photos/seed/bbc1/100/100' },
    { id: 'bbc2', name: 'BBC Two', logo: 'https://picsum.photos/seed/bbc2/100/100' },
    { id: 'itv1', name: 'ITV1', logo: 'https://picsum.photos/seed/itv1/100/100' },
    { id: 'ch4', name: 'Channel 4', logo: 'https://picsum.photos/seed/ch4/100/100' },
    { id: 'ch5', name: 'Channel 5', logo: 'https://picsum.photos/seed/ch5/100/100' },
    { id: 'sky-news', name: 'Sky News', logo: 'https://picsum.photos/seed/skynews/100/100' },
    { id: 'sky-sports', name: 'Sky Sports', logo: 'https://picsum.photos/seed/skysports/100/100' },
    { id: 'e4', name: 'E4', logo: 'https://picsum.photos/seed/e4/100/100' },
    { id: 'film4', name: 'Film4', logo: 'https://picsum.photos/seed/film4/100/100' },
    { id: 'dave', name: 'Dave', logo: 'https://picsum.photos/seed/dave/100/100' },
  ];

  return channels.map(channel => ({
    id: channel.id!,
    name: channel.name!,
    logo: channel.logo!,
    programs: generatePrograms(channel.id!, startTime),
  }));
}
