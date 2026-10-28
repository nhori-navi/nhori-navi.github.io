// シリーズ名（仮）。名前が決まったら、この1行だけ書き換える（共有したときの絵 img/og.png は作り直す）
const SERIES_NAME = 'ミル シリーズ';

document.querySelectorAll('.series').forEach(e => { e.textContent = SERIES_NAME; });
document.title = document.title.replace('ミル シリーズ', SERIES_NAME);
