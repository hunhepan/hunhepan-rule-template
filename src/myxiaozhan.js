import { flarumOnInfo, flarumOnList, flarumOnSearch, flarumOnTab } from './templates/flarum';

hun.events.onList = flarumOnList(3);
hun.events.onInfo = flarumOnInfo;
hun.events.onTab = flarumOnTab;
hun.events.onSearch = flarumOnSearch