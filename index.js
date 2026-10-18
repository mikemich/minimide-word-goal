// Word Goal for Minimide: the status bar shows "✍️ 120 / 500" and celebrates once you reach it.
export function activate(mide) {
  const item = mide.statusBar.addItem({ text: '', tooltip: 'Word goal: click to change it', align: 'right', onClick: setGoal });
  const celebrated = new Set();

  async function update() {
    const info = await mide.workspace.getActiveEditor();
    if (!info) return item.setText('');
    const text = (await mide.editor.getText()) || '';
    const words = text.split(/\s+/).filter(Boolean).length;
    const goal = mide.config.get('word-goal.goal', 500);
    item.setText(`✍️ ${words} / ${goal}`);
    if (words >= goal && info.path && !celebrated.has(info.path)) {
      celebrated.add(info.path);
      mide.notify.success('Goal reached! 🎉', `${words} words in ${info.path.split('/').pop()}`);
    }
  }

  async function setGoal() {
    const value = await mide.ui.prompt({ title: 'Word goal', value: String(mide.config.get('word-goal.goal', 500)) });
    const n = parseInt(value, 10);
    if (n > 0) { await mide.config.set('word-goal.goal', n); celebrated.clear(); }
  }

  mide.workspace.onDidChangeActiveEditor(update);
  mide.editor.onDidChange(update);
  mide.config.onDidChange('word-goal.goal', update);
  mide.commands.add('word-goal:set-goal', 'Set Goal…', setGoal);
  update();
}
