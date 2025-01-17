/* 
混合盘规则编写dts
*/

declare global {
  const hun: HunGlobal;
}

interface HunGlobal {
  events: HunEvents;
}

interface HunEvents {
  onSearch: (ctx: OnSearchContext) => void;
  onList: (ctx: OnListContext) => void;
  onInfo: (ctx: OnInfoContext) => void;
  onTab: (ctx: onTabContext) => void;
}

interface ItemData {
  title: string;
  image?: string;
  url: string;
  info: string;
  tags?: string[];
  copyable?: number[];
  payloads?: Record<string, any>;
}

interface InfoData {
  url: string;
  title: string;
}

interface OnSearchContext {
  page?: number;
  query?: string;
  res: ItemData[];

  settings?: Record<string, any>;
  filters?: Record<string, any>;
}

interface onTabContext {
  res: TabData[];

  settings?: Record<string, any>;
}

interface TabData {
  label: string;
  value: string;

  payloads?: Record<string, any>;
}

interface OnInfoContext {
  res: InfoData[];
  origin_url?: string;
  payloads?: Record<string, any>;
  settings?: Record<string, any>;
}

interface OnListContext {
  res: ItemData[];
}

export {
  HunGlobal,
  HunEvents,
  ItemData,
  InfoData,
  TabData,
  OnSearchContext,
  OnInfoContext,
  OnListContext,
};
