export interface Program {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  category: string;
  image?: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  programs: Program[];
}
