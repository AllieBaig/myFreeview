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

  const baseChannels: Partial<Channel>[] = [
    { id: 'bbc1', name: 'BBC One', logo: 'https://picsum.photos/seed/bbc1/100/100', category: 'Entertainment' },
    { id: 'bbc2', name: 'BBC Two', logo: 'https://picsum.photos/seed/bbc2/100/100', category: 'Entertainment' },
    { id: 'itv1', name: 'ITV1', logo: 'https://picsum.photos/seed/itv1/100/100', category: 'Entertainment' },
    { id: 'ch4', name: 'Channel 4', logo: 'https://picsum.photos/seed/ch4/100/100', category: 'Entertainment' },
    { id: 'ch5', name: 'Channel 5', logo: 'https://picsum.photos/seed/ch5/100/100', category: 'Entertainment' },
    { id: 'itv2', name: 'ITV2', logo: 'https://picsum.photos/seed/itv2/100/100', category: 'Entertainment' },
    { id: 'bbc3', name: 'BBC Three', logo: 'https://picsum.photos/seed/bbc3/100/100', category: 'Entertainment' },
    { id: 'bbc4', name: 'BBC Four', logo: 'https://picsum.photos/seed/bbc4/100/100', category: 'Entertainment' },
    { id: 'itv3', name: 'ITV3', logo: 'https://picsum.photos/seed/itv3/100/100', category: 'Entertainment' },
    { id: 'itv4', name: 'ITV4', logo: 'https://picsum.photos/seed/itv4/100/100', category: 'Sports' },
    { id: 'itvbe', name: 'ITVBe', logo: 'https://picsum.photos/seed/itvbe/100/100', category: 'Lifestyle' },
    { id: 'e4', name: 'E4', logo: 'https://picsum.photos/seed/e4/100/100', category: 'Entertainment' },
    { id: 'more4', name: 'More4', logo: 'https://picsum.photos/seed/more4/100/100', category: 'Entertainment' },
    { id: 'film4', name: 'Film4', logo: 'https://picsum.photos/seed/film4/100/100', category: 'Movies' },
    { id: '4seven', name: '4seven', logo: 'https://picsum.photos/seed/4seven/100/100', category: 'Entertainment' },
    { id: '5star', name: '5STAR', logo: 'https://picsum.photos/seed/5star/100/100', category: 'Entertainment' },
    { id: '5usa', name: '5USA', logo: 'https://picsum.photos/seed/5usa/100/100', category: 'Entertainment' },
    { id: '5action', name: '5Action', logo: 'https://picsum.photos/seed/5action/100/100', category: 'Entertainment' },
    { id: 'sky-news', name: 'Sky News', logo: 'https://picsum.photos/seed/skynews/100/100', category: 'News' },
    { id: 'sky-sports', name: 'Sky Sports', logo: 'https://picsum.photos/seed/skysports/100/100', category: 'Sports' },
    { id: 'dave', name: 'Dave', logo: 'https://picsum.photos/seed/dave/100/100', category: 'Entertainment' },
    { id: 'yesterday', name: 'Yesterday', logo: 'https://picsum.photos/seed/yesterday/100/100', category: 'Documentary' },
    { id: 'drama', name: 'Drama', logo: 'https://picsum.photos/seed/drama/100/100', category: 'Entertainment' },
    { id: 'really', name: 'Really', logo: 'https://picsum.photos/seed/really/100/100', category: 'Lifestyle' },
    { id: 'w', name: 'W', logo: 'https://picsum.photos/seed/w/100/100', category: 'Entertainment' },
    { id: 'quest', name: 'Quest', logo: 'https://picsum.photos/seed/quest/100/100', category: 'Entertainment' },
    { id: 'quest-red', name: 'Quest Red', logo: 'https://picsum.photos/seed/questred/100/100', category: 'Entertainment' },
    { id: 'dmax', name: 'DMAX', logo: 'https://picsum.photos/seed/dmax/100/100', category: 'Entertainment' },
    { id: 'hgntv', name: 'HGTV', logo: 'https://picsum.photos/seed/hgtv/100/100', category: 'Lifestyle' },
    { id: 'food-network', name: 'Food Network', logo: 'https://picsum.photos/seed/foodnetwork/100/100', category: 'Lifestyle' },
    { id: 'cbbc', name: 'CBBC', logo: 'https://picsum.photos/seed/cbbc/100/100', category: 'Kids' },
    { id: 'cbeebies', name: 'CBeebies', logo: 'https://picsum.photos/seed/cbeebies/100/100', category: 'Kids' },
    { id: 'citv', name: 'CITV', logo: 'https://picsum.photos/seed/citv/100/100', category: 'Kids' },
    { id: 'pop', name: 'POP', logo: 'https://picsum.photos/seed/pop/100/100', category: 'Kids' },
    { id: 'tiny-pop', name: 'Tiny Pop', logo: 'https://picsum.photos/seed/tinypop/100/100', category: 'Kids' },
    { id: 'great-movies', name: 'GREAT! movies', logo: 'https://picsum.photos/seed/greatmovies/100/100', category: 'Movies' },
    { id: 'great-action', name: 'GREAT! action', logo: 'https://picsum.photos/seed/greataction/100/100', category: 'Movies' },
    { id: 'great-romance', name: 'GREAT! romance', logo: 'https://picsum.photos/seed/greatromance/100/100', category: 'Movies' },
    { id: 'talking-pictures', name: 'Talking Pictures TV', logo: 'https://picsum.photos/seed/talkingpictures/100/100', category: 'Movies' },
    { id: 'pbs-america', name: 'PBS America', logo: 'https://picsum.photos/seed/pbsamerica/100/100', category: 'Documentary' },
    { id: 'smithsonian', name: 'Smithsonian Channel', logo: 'https://picsum.photos/seed/smithsonian/100/100', category: 'Documentary' },
    { id: 'pick', name: 'Pick', logo: 'https://picsum.photos/seed/pick/100/100', category: 'Entertainment' },
    { id: 'challenge', name: 'Challenge', logo: 'https://picsum.photos/seed/challenge/100/100', category: 'Entertainment' },
    { id: 'tbn-uk', name: 'TBN UK', logo: 'https://picsum.photos/seed/tbnuk/100/100', category: 'Religious' },
    { id: 'god-tv', name: 'GOD TV', logo: 'https://picsum.photos/seed/godtv/100/100', category: 'Religious' },
    { id: 'qvc', name: 'QVC', logo: 'https://picsum.photos/seed/qvc/100/100', category: 'Shopping' },
    { id: 'qvc-style', name: 'QVC Style', logo: 'https://picsum.photos/seed/qvcstyle/100/100', category: 'Shopping' },
    { id: 'ideal-world', name: 'Ideal World', logo: 'https://picsum.photos/seed/idealworld/100/100', category: 'Shopping' },
    { id: 'create-and-craft', name: 'Create and Craft', logo: 'https://picsum.photos/seed/createcraft/100/100', category: 'Shopping' },
    { id: 'tg4', name: 'TG4', logo: 'https://picsum.photos/seed/tg4/100/100', category: 'Entertainment' },
  ];

  return baseChannels.map(channel => ({
    id: channel.id!,
    name: channel.name!,
    logo: channel.logo!,
    category: channel.category!,
    programs: generatePrograms(channel.id!, startTime),
  }));
}
