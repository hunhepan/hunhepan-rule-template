const fs = require('fs');
const path = require('path');

function jsonCopyPlugin() {
  return {
    name: 'json-copy',
    
    // 在生成产物时执行
    generateBundle(options, bundle) {
      // 遍历所有打包的文件
      Object.keys(bundle).forEach(fileName => {
        const file = bundle[fileName];
        
        // 获取源文件路径
        if (file.facadeModuleId) {
          const srcDir = path.dirname(file.facadeModuleId);
          const baseName = path.basename(file.facadeModuleId, path.extname(file.facadeModuleId));
          const jsonPath = path.join(srcDir, `${baseName}.json`);
          
          // 检查同名 JSON 文件是否存在
          if (fs.existsSync(jsonPath)) {
            try {
              // 读取 JSON 文件内容
              const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
              
              // 计算输出路径
              const outputFileName = `${baseName}.json`;
              const outputDir = options.dir || path.dirname(options.file);
              
              // 确保输出目录存在
              if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
              }
              
              // 写入 JSON 文件到输出目录
              const outputPath = path.join(outputDir, outputFileName);
              fs.writeFileSync(outputPath, jsonContent);
              
              console.log(`Copied JSON file: ${outputPath}`);
            } catch (error) {
              console.error(`Error copying JSON file for ${fileName}:`, error);
            }
          }
        }
      });
    }
  };
}

export default jsonCopyPlugin;