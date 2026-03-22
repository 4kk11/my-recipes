const fs = require('fs');
const path = require('path');

const recipesDir = path.join(__dirname, 'recipes');
const dirs = fs.readdirSync(recipesDir).filter(d =>
  fs.statSync(path.join(recipesDir, d)).isDirectory()
);

const recipes = dirs.map(dir => {
  const dirPath = path.join(recipesDir, dir);
  const files = fs.readdirSync(dirPath);

  const cookFile = files.find(f => f.endsWith('.cook'));
  const imageFile = files.find(f => /\.(webp|jpg|jpeg|png)$/i.test(f));

  if (!cookFile) return null;

  // フロントマターに publish: true がないものはスキップ
  const cookContent = fs.readFileSync(path.join(dirPath, cookFile), 'utf-8');
  const frontmatterMatch = cookContent.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch || !/^publish:\s*true$/m.test(frontmatterMatch[1])) return null;

  return {
    id: dir,
    cookFile: `recipes/${dir}/${cookFile}`,
    image: imageFile ? `recipes/${dir}/${imageFile}` : null
  };
}).filter(Boolean).sort((a, b) => a.id.localeCompare(b.id, 'ja'));

const manifest = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  recipes
};

fs.writeFileSync(
  path.join(__dirname, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(`Generated manifest with ${recipes.length} recipes`);
