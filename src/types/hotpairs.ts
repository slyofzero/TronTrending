interface Exchange {
  name: string;
  factory: string;
}

interface Token {
  name: string;
  symbol: string;
  address: string;
}

export interface DataEntry {
  rank: number;
  creationBlock?: number;
  creationTime: string;
  exchange: Exchange;
  address: string;
  mainToken: Token;
  sideToken: Token;
}

export interface HotPairs {
  statusCode: number;
  data: DataEntry[];
}
