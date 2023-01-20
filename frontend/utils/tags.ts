export const tagMapping: {
  [key: string]: number;
} = {
  "2-sat": 0,
  "binary search": 1,
  bitmasks: 2,
  "brute force": 3,
  "chinese remainder theorem": 4,
  combinatorics: 5,
  "constructive algorithms": 6,
  "data structures": 7,
  "dfs and similar": 8,
  "divide and conquer": 9,
  dp: 10,
  dsu: 11,
  "expression parsing": 12,
  fft: 13,
  flows: 14,
  games: 15,
  geometry: 16,
  "graph matchings": 17,
  graphs: 18,
  greedy: 19,
  hashing: 20,
  implementation: 21,
  interactive: 22,
  math: 23,
  matrices: 24,
  "meet-in-the-middle": 25,
  "number theory": 26,
  probabilities: 27,
  schedules: 28,
  "shortest paths": 29,
  sortings: 30,
  "string suffix structures": 31,
  strings: 32,
  "ternary search": 33,
  trees: 34,
  "two pointers": 35,
};

export const tagMappingReverse: {
  [key: number]: string;
} = {};
Object.entries(tagMapping).map(([key, value]) => {
  tagMappingReverse[value] = key;
});

export const convertTagsToId = (tags: string[]): number[] => {
  const conv = tags.map((tag) => tagMapping[tag]);
  return conv.filter((tag) => tag !== undefined);
};
