import fs from 'fs';
import path from 'path';

const defaultJSON = {
  name: 'RuleName',
  url: 'https://hunhepan.com',
  version: 'v0.0.1',
  weight: 1,
  group: '',
  warn_text: '',
  search_filters: [
    {
      field: 'exact',
      default: false,
      label: '精确匹配',
      type: 'checkbox',
    },
  ],
  list_filters: [],
  settings: [
    {
      field: 'base_url',
      default: 'https://hunhepan.com',
      label: '网站地址',
      type: 'text',
    },
  ],
};

export default function createJsonFiles() {
  return {
    name: 'create-json-files',

    buildStart() {
      const srcDir = path.resolve('src');
      if (!fs.existsSync(srcDir)) {
        this.error('src directory not found');
        return;
      }

      const files = fs.readdirSync(srcDir);

      files.forEach((file) => {
        const filePath = path.join(srcDir, file);
        const stat = fs.statSync(filePath);

        if (!stat.isDirectory() && file.endsWith('.js')) {
          const jsonPath = filePath.replace(/\.js$/, '.json');

          if (!fs.existsSync(jsonPath)) {
            try {
              fs.writeFileSync(
                jsonPath,
                JSON.stringify(defaultJSON, null, 2),
                'utf-8'
              );
              console.log(`Created JSON file: ${jsonPath}`);
            } catch (error) {
              this.error(`Failed to create JSON file: ${jsonPath}\n${error}`);
            }
          }
        }
      });
    },
  };
}
