// eye mor 適性検査 - バイアス回避設計
//
// 設計原則:
// 1. 強制選択(Ipsative): 両方ポジティブな選択肢を並べる→「正解」が見えない
// 2. 仕事と無関係な題材: 採用バイアスをかけにくい
// 3. 思考実験: 本性が出やすい
// 4. 間接質問: 「あなたは？」ではなく「友達はあなたをどう思う？」
// 5. ライスケール: 「一度もない」系で嘘を検出
// 6. 反応時間記録: 即答=直感, 長考=取り繕い

const QUESTIONS = [
  // ========== ウォームアップ ==========
  {
    id: 'q_name',
    type: 'text',
    category: 'meta',
    question: 'お名前を教えてください',
    placeholder: '山田 さくら',
    maxLength: 30,
  },

  // ========== 強制選択（A or B どっちも良い） ==========
  {
    id: 'q1',
    type: 'forced-choice',
    category: 'work-style',
    question: '友達と旅行を計画するとき、私は',
    options: [
      { value: 'A', text: '行きたい場所をまず提案する', traits: { initiative: 2 } },
      { value: 'B', text: 'みんなの希望をまとめる', traits: { cooperation: 2 } },
    ],
  },
  {
    id: 'q2',
    type: 'forced-choice',
    category: 'lifestyle',
    question: '初めての店に入るとき、私は',
    options: [
      { value: 'A', text: '事前に口コミを調べてから行く', traits: { detail: 2 } },
      { value: 'B', text: 'とりあえず入って雰囲気で決める', traits: { optimism: 2 } },
    ],
  },
  {
    id: 'q3',
    type: 'forced-choice',
    category: 'lifestyle',
    question: '料理をするとき、私は',
    options: [
      { value: 'A', text: 'レシピ通りに正確に作る', traits: { detail: 2 } },
      { value: 'B', text: '目分量でアレンジする', traits: { optimism: 2 } },
    ],
  },
  {
    id: 'q4',
    type: 'forced-choice',
    category: 'social',
    question: '初対面の人と話すとき、私は',
    options: [
      { value: 'A', text: '自分から話題を振る', traits: { initiative: 2 } },
      { value: 'B', text: '相手の話に乗っかる', traits: { cooperation: 2 } },
    ],
  },
  {
    id: 'q5',
    type: 'forced-choice',
    category: 'social',
    question: '友達が落ち込んでいるとき、私は',
    options: [
      { value: 'A', text: '解決策を一緒に考える', traits: { initiative: 2 } },
      { value: 'B', text: 'ひたすら話を聞く', traits: { cooperation: 2 } },
    ],
  },
  {
    id: 'q6',
    type: 'forced-choice',
    category: 'recovery',
    question: '失敗した翌日、私は',
    options: [
      { value: 'A', text: '切り替えて次のことを考える', traits: { optimism: 2 } },
      { value: 'B', text: 'もう一度なぜ失敗したか振り返る', traits: { detail: 2 } },
    ],
  },
  {
    id: 'q7',
    type: 'forced-choice',
    category: 'social',
    question: '誰かに褒められたとき、私は',
    options: [
      { value: 'A', text: '「ありがとう！」と素直に受け取る', traits: { optimism: 2 } },
      { value: 'B', text: '「いやいや」と謙遜する', traits: { detail: 1 } },
    ],
  },
  {
    id: 'q8',
    type: 'forced-choice',
    category: 'lifestyle',
    question: '予定がない休日、私は',
    options: [
      { value: 'A', text: '外に出かけたくなる', traits: { initiative: 1, optimism: 1 } },
      { value: 'B', text: '家でゆっくりしたい', traits: { detail: 1 } },
    ],
  },
  {
    id: 'q9',
    type: 'forced-choice',
    category: 'work-style',
    question: '新しいことを学ぶとき、私は',
    options: [
      { value: 'A', text: 'まずやってみて分からない所を調べる', traits: { initiative: 2, optimism: 1 } },
      { value: 'B', text: '一通り調べてから始める', traits: { detail: 2 } },
    ],
  },
  {
    id: 'q10',
    type: 'forced-choice',
    category: 'social',
    question: '友達の悩みを聞いた後、私は',
    options: [
      { value: 'A', text: '自分の経験談を話す', traits: { initiative: 1 } },
      { value: 'B', text: '相手の話の続きを聞く', traits: { cooperation: 2 } },
    ],
  },

  // ========== ライスケール（嘘発見） ==========
  // 「一度もない」系の質問は、はい=嘘確定
  {
    id: 'q_lie1',
    type: 'forced-choice',
    category: 'lie-scale',
    question: '誰かに対してイラッとしたことは一度もない',
    options: [
      { value: 'yes', text: 'はい', traits: { lie: 2 } },
      { value: 'no', text: 'いいえ', traits: {} },
    ],
  },
  {
    id: 'q_lie2',
    type: 'forced-choice',
    category: 'lie-scale',
    question: '決めたことを途中でやめたことは一度もない',
    options: [
      { value: 'yes', text: 'はい', traits: { lie: 2 } },
      { value: 'no', text: 'いいえ', traits: {} },
    ],
  },
  {
    id: 'q_lie3',
    type: 'forced-choice',
    category: 'lie-scale',
    question: '約束に遅刻したことは一度もない',
    options: [
      { value: 'yes', text: 'はい', traits: { lie: 2 } },
      { value: 'no', text: 'いいえ', traits: {} },
    ],
  },

  // ========== 思考実験 ==========
  {
    id: 'q_island',
    type: 'forced-choice',
    category: 'thought-experiment',
    question: '無人島に1つだけ持っていくなら？',
    options: [
      { value: 'A', text: '本（自分と向き合う）', traits: { detail: 1 } },
      { value: 'B', text: '音楽プレーヤー（楽しむ）', traits: { optimism: 2 } },
      { value: 'C', text: '日記帳（記録する）', traits: { detail: 2 } },
      { value: 'D', text: 'ナイフ（生き抜く）', traits: { initiative: 2 } },
    ],
  },
  {
    id: 'q_lottery',
    type: 'forced-choice',
    category: 'thought-experiment',
    question: '宝くじで100万円当たったら、最初の1ヶ月で',
    options: [
      { value: 'A', text: '全額使い切る', traits: { optimism: 2 } },
      { value: 'B', text: '半分くらい使う', traits: { optimism: 1, cooperation: 1 } },
      { value: 'C', text: '少し使って大半は貯金', traits: { detail: 2 } },
      { value: 'D', text: '全額貯金する', traits: { detail: 2 } },
    ],
  },

  // ========== 間接質問（自由記述） ==========
  {
    id: 'q_friend',
    type: 'episode',
    category: 'self-image',
    question: '友達はあなたを一言で表すと、どんな人だと言いますか？',
    placeholder: '例：いつも笑ってる人',
    maxLength: 100,
  },
  {
    id: 'q_fun',
    type: 'episode',
    category: 'optimism',
    question: '直近1週間で、一番楽しかった瞬間を教えてください',
    placeholder: '具体的にどんな場面で何があったか、200字以内で',
    maxLength: 200,
  },
];

// 採点ロジック
function scoreResponse(answers) {
  const scores = { initiative: 0, cooperation: 0, optimism: 0, detail: 0, lie: 0 };
  const maxScores = { initiative: 0, cooperation: 0, optimism: 0, detail: 0, lie: 0 };

  // 強制選択の集計
  for (const q of QUESTIONS) {
    if (q.type !== 'forced-choice') continue;
    const answer = answers[q.id];
    if (!answer) continue;

    // 各選択肢の最大値を計算
    for (const opt of q.options) {
      for (const [trait, val] of Object.entries(opt.traits)) {
        if (val > (maxScores[trait] || 0) - (maxScores[trait] || 0)) {
          // この質問でその特性に与えうる最大値
        }
      }
    }
    const optMax = {};
    for (const opt of q.options) {
      for (const [trait, val] of Object.entries(opt.traits)) {
        optMax[trait] = Math.max(optMax[trait] || 0, val);
      }
    }
    for (const [trait, val] of Object.entries(optMax)) {
      maxScores[trait] = (maxScores[trait] || 0) + val;
    }

    // 選んだ選択肢の点数
    const selectedOpt = q.options.find((o) => o.value === answer.value);
    if (selectedOpt) {
      for (const [trait, val] of Object.entries(selectedOpt.traits)) {
        scores[trait] = (scores[trait] || 0) + val;
      }
    }
  }

  // 楽観性のエピソード分析
  const funAnswer = answers['q_fun']?.value || '';
  const optimismKeywords = ['楽しい', '楽しかった', '嬉しい', '最高', '良かった', 'よかった', 'わくわく', '笑', '幸せ', '面白', 'ハマ', '感動'];
  const negativeKeywords = ['不安', '心配', '辛い', 'しんどい', '疲れた', 'だるい', '面倒', '無理'];
  let optimismBonus = 0;
  for (const kw of optimismKeywords) {
    if (funAnswer.includes(kw)) optimismBonus += 1;
  }
  for (const kw of negativeKeywords) {
    if (funAnswer.includes(kw)) optimismBonus -= 1;
  }
  // 文字数：100字超は細かい傾向、50字以下は大雑把＝楽観的
  if (funAnswer.length > 0 && funAnswer.length <= 80) optimismBonus += 1;
  if (funAnswer.length > 150) optimismBonus -= 1;

  // 0-100に正規化
  const normalize = (score, max) => Math.round(Math.max(0, Math.min(100, (score / Math.max(max, 1)) * 100)));

  return {
    initiative: normalize(scores.initiative, maxScores.initiative),
    cooperation: normalize(scores.cooperation, maxScores.cooperation),
    optimism: normalize(scores.optimism + optimismBonus * 2, maxScores.optimism + 6),
    detail: normalize(scores.detail, maxScores.detail),
    lie: normalize(scores.lie, maxScores.lie),
    raw: scores,
    funKeywords: { positive: optimismKeywords.filter((kw) => funAnswer.includes(kw)), negative: negativeKeywords.filter((kw) => funAnswer.includes(kw)) },
  };
}

// 総合判定
function getRecommendation(scores) {
  const { initiative, cooperation, optimism, lie } = scores;
  if (lie >= 67) return { rank: '要注意', stars: 1, color: '#c0392b', reason: '取り繕い傾向が高い' };
  const total = initiative + cooperation + optimism;
  if (total >= 240) return { rank: '推奨', stars: 5, color: '#27ae60', reason: '主体性・協調性・楽観性すべて高い' };
  if (total >= 200) return { rank: '良い', stars: 4, color: '#2ecc71', reason: 'バランスが良い' };
  if (total >= 160) return { rank: '面接推奨', stars: 3, color: '#f39c12', reason: '伸びしろあり' };
  if (total >= 120) return { rank: '要面接', stars: 2, color: '#e67e22', reason: '深掘りが必要' };
  return { rank: '不向き', stars: 1, color: '#c0392b', reason: 'eye morの欲しい人物像から離れる' };
}

const CATEGORY_LABELS = {
  initiative: '主体性',
  cooperation: '協調性',
  optimism: '楽観性',
  detail: '慎重さ',
  lie: '取り繕い度',
};
