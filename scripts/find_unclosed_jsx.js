const fs = require('fs');
const path = process.argv[2];
if(!path) { console.error('Usage: node find_unclosed_jsx.js <file>'); process.exit(2); }
const s = fs.readFileSync(path, 'utf8');
const lines = s.split('\n');
const stack = [];
const voidTags = new Set(['input','img','br','hr','path','rect','circle','line','meta','link','source']);
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const regex = /<\s*(\/?)\s*([A-Za-z0-9_:-]+)([^>]*)>/g;
  let m;
  while ((m = regex.exec(line))) {
    const isClosing = !!m[1];
    const tag = m[2];
    const rest = m[3];
    const full = m[0];
    if (!tag) continue;
    if (!isClosing) {
      const selfClosing = /\/>\s*$/.test(full) || rest.trim().endsWith('/');
      if (selfClosing) continue;
      if (voidTags.has(tag.toLowerCase())) continue;
      stack.push({ tag, line: i + 1, col: m.index + 1, txt: line.trim() });
    } else {
      if (stack.length === 0) {
        console.log('Unmatched closing tag </' + tag + '> at line', i + 1);
        process.exit(0);
      }
      const last = stack[stack.length - 1];
      if (last.tag.toLowerCase() === tag.toLowerCase()) {
        stack.pop();
      } else {
        console.log('Mismatched closing tag </' + tag + '> at line', i + 1, 'expected </' + last.tag + '> for opening at line', last.line);
        process.exit(0);
      }
    }
  }
}
if (stack.length > 0) {
  console.log('Unclosed tags (top first):');
  for (let j = stack.length - 1; j >= 0; j--) {
    const e = stack[j];
    console.log(`#${stack.length - j}: <${e.tag}> opened at line ${e.line}: ${e.txt.slice(0, 120)}`);
  }
} else {
  console.log('All tags balanced');
}
