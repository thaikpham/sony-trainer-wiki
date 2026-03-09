const mammoth = require("mammoth");
const fs = require("fs");

const filePath = process.argv[2];

if (!filePath) {
    console.error("Please provide a file path");
    process.exit(1);
}

mammoth.extractRawText({ path: filePath })
    .then(function (result) {
        const text = result.value;
        fs.writeFileSync("docx-content.txt", text);
        console.log("Extracted text to docx-content.txt");
    })
    .catch(function (error) {
        console.error(error);
    });
