// Lists the top-level screens that differ between two versions of a .pen
// file (for preview images on pull requests).
//   node tools/changed-screens.mjs base.pen head.pen
import fs from "fs";

const read = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return { children: [] };
  }
};
const [base, head] = process.argv.slice(2).map(read);
const before = new Map(base.children.map((node) => [node.id, JSON.stringify(node)]));
// Components and variables affect every screen that uses them.
const shared = JSON.stringify(base.variables) !== JSON.stringify(head.variables);
const changed = head.children.filter((node) => (node.type === "frame" || node.type === "ref") && (shared || before.get(node.id) !== JSON.stringify(node)));
console.log(changed.map((node) => node.id).join(" "));
