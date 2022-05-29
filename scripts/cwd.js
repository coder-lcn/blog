const { readFile, writeFile } = require('fs');
const { resolve } = require('path');
const { promisify } = require('util');

const getFileContent = promisify(readFile);
const setFileContent = promisify(writeFile);

const mainScript = resolve(__dirname, '../themes/icarus/source/js/main.js');
const cwd = process.cwd();

const main = async () => {
  let newContent = '';

  const content = await getFileContent(mainScript, 'utf-8');
  const notWrited = content.startsWith('moment.updateLocale');

  if (notWrited) {
    newContent = `window.cwd = "${cwd}";\r\n` + content;
  } else {
    const start = content.indexOf('=');
    const end = content.indexOf(';');
    newContent = `${content.slice(0, start)}= '${cwd}'${content.slice(end)}`;
  }

  await setFileContent(mainScript, newContent);
}


main();
