const fs = require('fs');
const path = require('path');

// Get the src directory path (relative to the current script)
const srcDir = path.join(__dirname, '..', 'src');

// Function to recursively find all JSON files
function findJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findJsonFiles(filePath, fileList);
        } else if (path.extname(file) === '.json') {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Function to process each JSON file
function processJsonFile(filePath) {
    try {
        // Read and parse JSON file
        const content = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(content);

        // Add group field if it doesn't exist
        if (!jsonData.hasOwnProperty('group') || jsonData.group === "") {
            jsonData.group = '网盘';
        }

        // Write back the modified JSON
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log(`Processed: ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Main execution
try {
    const jsonFiles = findJsonFiles(srcDir);
    console.log(`Found ${jsonFiles.length} JSON files`);
    
    jsonFiles.forEach(file => {
        processJsonFile(file);
    });

    console.log('Processing completed');
} catch (error) {
    console.error('Error:', error.message);
}