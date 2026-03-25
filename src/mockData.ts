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
    { id: 'bbc1', name: 'BBC One', number: 1, logo: 'https://picsum.photos/seed/bbc1/100/100', category: 'Entertainment' },
    { id: 'bbc2', name: 'BBC Two', number: 2, logo: 'https://picsum.photos/seed/bbc2/100/100', category: 'Entertainment' },
    { id: 'itv1', name: 'ITV1', number: 3, logo: 'https://picsum.photos/seed/itv1/100/100', category: 'Entertainment' },
    { id: 'ch4', name: 'Channel 4', number: 4, logo: 'https://picsum.photos/seed/ch4/100/100', category: 'Entertainment' },
    { id: 'ch5', name: 'Channel 5', number: 5, logo: 'https://picsum.photos/seed/ch5/100/100', category: 'Entertainment' },
    { id: 'itv2', name: 'ITV2', number: 6, logo: 'https://picsum.photos/seed/itv2/100/100', category: 'Entertainment' },
    { id: 'bbc3', name: 'BBC Three', number: 7, logo: 'https://picsum.photos/seed/bbc3/100/100', category: 'Entertainment' },
    { id: 'bbc4', name: 'BBC Four', number: 9, logo: 'https://picsum.photos/seed/bbc4/100/100', category: 'Entertainment' },
    { id: 'itv3', name: 'ITV3', number: 10, logo: 'https://picsum.photos/seed/itv3/100/100', category: 'Entertainment' },
    { id: 'itv4', name: 'ITV4', number: 24, logo: 'https://picsum.photos/seed/itv4/100/100', category: 'Sports' },
    { id: 'itvbe', name: 'ITVBe', number: 26, logo: 'https://picsum.photos/seed/itvbe/100/100', category: 'Lifestyle' },
    { id: 'e4', name: 'E4', number: 28, logo: 'https://picsum.photos/seed/e4/100/100', category: 'Entertainment' },
    { id: 'more4', name: 'More4', number: 29, logo: 'https://picsum.photos/seed/more4/100/100', category: 'Entertainment' },
    { id: 'film4', name: 'Film4', number: 14, logo: 'https://picsum.photos/seed/film4/100/100', category: 'Movies' },
    { id: 'sky-cinema-action', name: 'Sky Cinema Action', number: 301, logo: 'https://picsum.photos/seed/skyaction/100/100', category: 'Movies' },
    { id: 'sky-cinema-comedy', name: 'Sky Cinema Comedy', number: 302, logo: 'https://picsum.photos/seed/skycomedy/100/100', category: 'Movies' },
    { id: 'sky-cinema-drama', name: 'Sky Cinema Drama', number: 303, logo: 'https://picsum.photos/seed/skydrama/100/100', category: 'Movies' },
    { id: 'sky-cinema-scifi', name: 'Sky Cinema Sci-Fi', number: 304, logo: 'https://picsum.photos/seed/skyscifi/100/100', category: 'Movies' },
    { id: '4seven', name: '4seven', number: 47, logo: 'https://picsum.photos/seed/4seven/100/100', category: 'Entertainment' },
    { id: '5star', name: '5STAR', number: 30, logo: 'https://picsum.photos/seed/5star/100/100', category: 'Entertainment' },
    { id: '5usa', name: '5USA', number: 21, logo: 'https://picsum.photos/seed/5usa/100/100', category: 'Entertainment' },
    { id: '5action', name: '5Action', number: 32, logo: 'https://picsum.photos/seed/5action/100/100', category: 'Entertainment' },
    { id: 'sky-news', name: 'Sky News', number: 233, logo: 'https://picsum.photos/seed/skynews/100/100', category: 'News' },
    { id: 'bbc-news', name: 'BBC News', number: 231, logo: 'https://picsum.photos/seed/bbcnews/100/100', category: 'News' },
    { id: 'al-jazeera', name: 'Al Jazeera', number: 235, logo: 'https://picsum.photos/seed/aljazeera/100/100', category: 'News' },
    { id: 'cnn', name: 'CNN International', number: 236, logo: 'https://picsum.photos/seed/cnn/100/100', category: 'News' },
    { id: 'sky-sports-main', name: 'Sky Sports Main Event', number: 401, logo: 'https://picsum.photos/seed/skysportsmain/100/100', category: 'Sports' },
    { id: 'sky-sports-football', name: 'Sky Sports Football', number: 403, logo: 'https://picsum.photos/seed/skysportsfootball/100/100', category: 'Sports' },
    { id: 'sky-sports-cricket', name: 'Sky Sports Cricket', number: 404, logo: 'https://picsum.photos/seed/skysportscricket/100/100', category: 'Sports' },
    { id: 'bt-sport-1', name: 'BT Sport 1', number: 413, logo: 'https://picsum.photos/seed/btsport1/100/100', category: 'Sports' },
    { id: 'eurosport-1', name: 'Eurosport 1', number: 410, logo: 'https://picsum.photos/seed/eurosport1/100/100', category: 'Sports' },
    { id: 'dave', name: 'Dave', number: 19, logo: 'https://picsum.photos/seed/dave/100/100', category: 'Entertainment' },
    { id: 'yesterday', name: 'Yesterday', number: 27, logo: 'https://picsum.photos/seed/yesterday/100/100', category: 'Documentary' },
    { id: 'nat-geo', name: 'National Geographic', number: 129, logo: 'https://picsum.photos/seed/natgeo/100/100', category: 'Documentary' },
    { id: 'discovery', name: 'Discovery Channel', number: 125, logo: 'https://picsum.photos/seed/discovery/100/100', category: 'Documentary' },
    { id: 'history', name: 'History Channel', number: 130, logo: 'https://picsum.photos/seed/history/100/100', category: 'Documentary' },
    { id: 'drama', name: 'Drama', number: 20, logo: 'https://picsum.photos/seed/drama/100/100', category: 'Entertainment' },
    { id: 'really', name: 'Really', number: 17, logo: 'https://picsum.photos/seed/really/100/100', category: 'Lifestyle' },
    { id: 'w', name: 'W', number: 25, logo: 'https://picsum.photos/seed/w/100/100', category: 'Entertainment' },
    { id: 'quest', name: 'Quest', number: 12, logo: 'https://picsum.photos/seed/quest/100/100', category: 'Entertainment' },
    { id: 'quest-red', name: 'Quest Red', number: 38, logo: 'https://picsum.photos/seed/questred/100/100', category: 'Entertainment' },
    { id: 'dmax', name: 'DMAX', number: 39, logo: 'https://picsum.photos/seed/dmax/100/100', category: 'Entertainment' },
    { id: 'hgntv', name: 'HGTV', number: 44, logo: 'https://picsum.photos/seed/hgtv/100/100', category: 'Lifestyle' },
    { id: 'food-network', name: 'Food Network', number: 43, logo: 'https://picsum.photos/seed/foodnetwork/100/100', category: 'Lifestyle' },
    { id: 'cbbc', name: 'CBBC', number: 201, logo: 'https://picsum.photos/seed/cbbc/100/100', category: 'Kids' },
    { id: 'cbeebies', name: 'CBeebies', number: 202, logo: 'https://picsum.photos/seed/cbeebies/100/100', category: 'Kids' },
    { id: 'citv', name: 'CITV', number: 203, logo: 'https://picsum.photos/seed/citv/100/100', category: 'Kids' },
    { id: 'pop', name: 'POP', number: 206, logo: 'https://picsum.photos/seed/pop/100/100', category: 'Kids' },
    { id: 'tiny-pop', name: 'Tiny Pop', number: 207, logo: 'https://picsum.photos/seed/tinypop/100/100', category: 'Kids' },
    { id: 'nickelodeon', name: 'Nickelodeon', number: 604, logo: 'https://picsum.photos/seed/nickelodeon/100/100', category: 'Kids' },
    { id: 'disney-channel', name: 'Disney Channel', number: 607, logo: 'https://picsum.photos/seed/disney/100/100', category: 'Kids' },
    { id: 'cartoon-network', name: 'Cartoon Network', number: 601, logo: 'https://picsum.photos/seed/cartoon/100/100', category: 'Kids' },
    { id: 'great-movies', name: 'GREAT! movies', number: 33, logo: 'https://picsum.photos/seed/greatmovies/100/100', category: 'Movies' },
    { id: 'great-action', name: 'GREAT! action', number: 42, logo: 'https://picsum.photos/seed/greataction/100/100', category: 'Movies' },
    { id: 'great-romance', name: 'GREAT! romance', number: 52, logo: 'https://picsum.photos/seed/greatromance/100/100', category: 'Movies' },
    { id: 'talking-pictures', name: 'Talking Pictures TV', number: 82, logo: 'https://picsum.photos/seed/talkingpictures/100/100', category: 'Movies' },
    { id: 'pbs-america', name: 'PBS America', number: 84, logo: 'https://picsum.photos/seed/pbsamerica/100/100', category: 'Documentary' },
    { id: 'smithsonian', name: 'Smithsonian Channel', number: 99, logo: 'https://picsum.photos/seed/smithsonian/100/100', category: 'Documentary' },
    { id: 'pick', number: 11, name: 'Pick', logo: 'https://picsum.photos/seed/pick/100/100', category: 'Entertainment' },
    { id: 'challenge', number: 48, name: 'Challenge', logo: 'https://picsum.photos/seed/challenge/100/100', category: 'Entertainment' },
    { id: 'tbn-uk', number: 65, name: 'TBN UK', logo: 'https://picsum.photos/seed/tbnuk/100/100', category: 'Religious' },
    { id: 'god-tv', number: 67, name: 'GOD TV', logo: 'https://picsum.photos/seed/godtv/100/100', category: 'Religious' },
    { id: 'qvc', number: 16, name: 'QVC', logo: 'https://picsum.photos/seed/qvc/100/100', category: 'Shopping' },
    { id: 'qvc-style', number: 36, name: 'QVC Style', logo: 'https://picsum.photos/seed/qvcstyle/100/100', category: 'Shopping' },
    { id: 'ideal-world', number: 51, name: 'Ideal World', logo: 'https://picsum.photos/seed/idealworld/100/100', category: 'Shopping' },
    { id: 'create-and-craft', number: 68, name: 'Create and Craft', logo: 'https://picsum.photos/seed/createcraft/100/100', category: 'Shopping' },
    { id: 'tg4', number: 104, name: 'TG4', logo: 'https://picsum.photos/seed/tg4/100/100', category: 'Entertainment' },
  ];

  return baseChannels.map(channel => ({
    id: channel.id!,
    name: channel.name!,
    number: channel.number!,
    logo: channel.logo!,
    category: channel.category!,
    programs: generatePrograms(channel.id!, startTime),
  }));
}
