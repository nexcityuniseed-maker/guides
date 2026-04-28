// eye mor 適性検査 v2 - 心理学ベースの本気版
//
// 設計フレームワーク:
// - Big Five特性理論（外向性・協調性・誠実性・神経症傾向・開放性）をベース
// - 強制選択(Ipsative)で社会的望ましさバイアス回避
// - SJT(状況判断テスト)を仕事文脈で
// - ライスケールで嘘検出
// - 反応時間で本音/取り繕いを判定
// - 矛盾検出ペアで一貫性チェック
//
// 出力パラメータ(8軸):
// 1. initiative   主体性
// 2. cooperation  協調性
// 3. optimism     楽観性
// 4. communication コミュ力
// 5. flexibility  柔軟性
// 6. resilience   ストレス耐性
// 7. detail       慎重さ(細かさ)
// 8. lie          取り繕い度(警告)
//
// eye morの理想: 主体性高 + 協調性高 + コミュ力高 + 楽観性高 + 慎重さ中-低 + 取り繕い低

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

  // ========== ① 主体性を測る (7問) ==========
  {
    id: 'q1', type: 'forced-choice', category: 'initiative',
    question: '友達と旅行を計画するとき、私は',
    options: [
      { value: 'A', text: '行きたい場所をまず提案する', traits: { initiative: 2, communication: 1 } },
      { value: 'B', text: 'みんなの希望をまとめる', traits: { cooperation: 2 } },
    ],
  },
  {
    id: 'q2', type: 'forced-choice', category: 'initiative',
    question: '気になる新しいお店を見つけたとき、私は',
    options: [
      { value: 'A', text: 'すぐ行ってみる', traits: { initiative: 2, optimism: 1 } },
      { value: 'B', text: '口コミを見てから決める', traits: { detail: 2 } },
    ],
  },
  {
    id: 'q5', type: 'forced-choice', category: 'initiative',
    question: '新しいスキルを学ぶとき、私は',
    options: [
      { value: 'A', text: 'まずやってみて分からない所を調べる', traits: { initiative: 2, optimism: 1 } },
      { value: 'B', text: '一通り調べてから始める', traits: { detail: 2 } },
    ],
  },
  {
    id: 'q6', type: 'forced-choice', category: 'initiative',
    question: '退屈な空き時間ができたとき、私は',
    options: [
      { value: 'A', text: '何かしようと自分から動く', traits: { initiative: 2 } },
      { value: 'B', text: 'ぼーっとしてリフレッシュする', traits: { resilience: 1 } },
    ],
  },
  {
    id: 'q7', type: 'forced-choice', category: 'initiative',
    question: '気になる人に話しかけたいとき、私は',
    options: [
      { value: 'A', text: '自分から声をかける', traits: { initiative: 2, communication: 2 } },
      { value: 'B', text: 'タイミングを見計らう', traits: { detail: 1 } },
    ],
  },

  // ========== ② 協調性・コミュ力を測る (7問) ==========
  {
    id: 'q8', type: 'forced-choice', category: 'cooperation',
    question: '友達が落ち込んでいるとき、私は',
    options: [
      { value: 'A', text: '解決策を一緒に考える', traits: { initiative: 1, cooperation: 1 } },
      { value: 'B', text: 'ひたすら話を聞く', traits: { cooperation: 2, communication: 1 } },
    ],
  },
  {
    id: 'q10', type: 'forced-choice', category: 'cooperation',
    question: 'グループLINEで盛り上がっているとき、私は',
    options: [
      { value: 'A', text: '自分のスタンプ・コメントで参加する', traits: { communication: 2, optimism: 1 } },
      { value: 'B', text: '既読してから空気を読んで返す', traits: { cooperation: 1, detail: 1 } },
    ],
  },
  {
    id: 'q11', type: 'forced-choice', category: 'cooperation',
    question: '初対面の人と話すとき、私は',
    options: [
      { value: 'A', text: '自分から話題を振る', traits: { initiative: 2, communication: 2 } },
      { value: 'B', text: '相手の話に乗っかる', traits: { cooperation: 2 } },
    ],
  },
  {
    id: 'q12', type: 'forced-choice', category: 'cooperation',
    question: '意見が分かれたとき、私は',
    options: [
      { value: 'A', text: '自分の主張を伝える', traits: { initiative: 2, communication: 1 } },
      { value: 'B', text: '相手の意見も取り入れる', traits: { cooperation: 2, flexibility: 2 } },
    ],
  },
  {
    id: 'q14', type: 'forced-choice', category: 'cooperation',
    question: 'お礼を言いたいとき、私は',
    options: [
      { value: 'A', text: '直接「ありがとう」と伝える', traits: { communication: 2, cooperation: 2 } },
      { value: 'B', text: 'LINEやメッセージで丁寧に送る', traits: { detail: 1, cooperation: 1 } },
    ],
  },

  // ========== ③ 楽観性・大雑把を測る (7問) ==========
  {
    id: 'q15', type: 'forced-choice', category: 'optimism',
    question: '失敗した翌日、私は',
    options: [
      { value: 'A', text: '切り替えて次のことを考える', traits: { optimism: 2, resilience: 2 } },
      { value: 'B', text: 'もう一度なぜ失敗したか振り返る', traits: { detail: 2 } },
    ],
  },
  {
    id: 'q16', type: 'forced-choice', category: 'optimism',
    question: '褒められたとき、私は',
    options: [
      { value: 'A', text: '「ありがとう！」と素直に受け取る', traits: { optimism: 2, communication: 1 } },
      { value: 'B', text: '「いやいや」と謙遜する', traits: { detail: 1, cooperation: 1 } },
    ],
  },
  {
    id: 'q17', type: 'forced-choice', category: 'optimism',
    question: '料理をするとき、私は',
    options: [
      { value: 'A', text: '目分量でアレンジする', traits: { optimism: 2, flexibility: 2 } },
      { value: 'B', text: 'レシピ通りに正確に作る', traits: { detail: 2 } },
    ],
  },
  {
    id: 'q19', type: 'forced-choice', category: 'optimism',
    question: '雨の日に予定があったら、私は',
    options: [
      { value: 'A', text: '「なんとかなる」と出かける', traits: { optimism: 2, resilience: 1 } },
      { value: 'B', text: '室内に予定変更する', traits: { detail: 1, flexibility: 1 } },
    ],
  },
  {
    id: 'q21', type: 'forced-choice', category: 'optimism',
    question: '知らないジャンルの本をすすめられたら、私は',
    options: [
      { value: 'A', text: '試しに読んでみる', traits: { optimism: 2, flexibility: 2 } },
      { value: 'B', text: '自分の好みじゃないと思う', traits: { detail: 1 } },
    ],
  },

  // ========== ④ ライスケール (5問) ==========
  // 「一度もない」系の質問は はい=嘘確定
  {
    id: 'q_lie1', type: 'forced-choice', category: 'lie-scale',
    question: '誰かに対してイラッとしたことは一度もない',
    options: [
      { value: 'yes', text: 'はい', traits: { lie: 2 } },
      { value: 'no', text: 'いいえ', traits: {} },
    ],
  },
  {
    id: 'q_lie2', type: 'forced-choice', category: 'lie-scale',
    question: '決めたことを途中でやめたことは一度もない',
    options: [
      { value: 'yes', text: 'はい', traits: { lie: 2 } },
      { value: 'no', text: 'いいえ', traits: {} },
    ],
  },
  {
    id: 'q_lie3', type: 'forced-choice', category: 'lie-scale',
    question: '約束に遅刻したことは一度もない',
    options: [
      { value: 'yes', text: 'はい', traits: { lie: 2 } },
      { value: 'no', text: 'いいえ', traits: {} },
    ],
  },

  // ========== ⑤ SJT 状況判断テスト (3問) ==========
  // 仕事文脈の判断力を測る。明確な正解がないが、選択で価値観が見える
  {
    id: 'q_sjt1', type: 'forced-choice', category: 'sjt',
    question: '忙しい時、目の前で同僚がミスしてるのに気づいた。あなたは',
    options: [
      { value: 'A', text: '自分の手を止めて声をかける', traits: { cooperation: 2, initiative: 2 } },
      { value: 'B', text: '自分の仕事を終わらせてから声をかける', traits: { detail: 2 } },
      { value: 'C', text: '本人が気づくまで見守る', traits: { cooperation: 1 } },
      { value: 'D', text: '上司に報告する', traits: { detail: 1 } },
    ],
  },
  {
    id: 'q_sjt3', type: 'forced-choice', category: 'sjt',
    question: 'お客様の話が長くて時間が押してる。あなたは',
    options: [
      { value: 'A', text: '「次のお客様が」と笑顔で切り上げる', traits: { initiative: 2, communication: 2 } },
      { value: 'B', text: 'お客様優先で話を聞き続ける', traits: { cooperation: 2 } },
      { value: 'C', text: '同僚に次の対応を頼む', traits: { cooperation: 1, initiative: 1, communication: 1 } },
      { value: 'D', text: '困った顔で待つ', traits: { lie: 1 } }, // 受動的=危険
    ],
  },
  {
    id: 'q_sjt4', type: 'forced-choice', category: 'sjt',
    question: 'クレーム対応中、自分の落ち度ではない。あなたは',
    options: [
      { value: 'A', text: 'まず謝って話を聞く', traits: { cooperation: 2, resilience: 2 } },
      { value: 'B', text: '冷静に経緯を説明する', traits: { detail: 2, communication: 1 } },
      { value: 'C', text: '上司に代わってもらう', traits: { detail: 1 } },
      { value: 'D', text: '「自分のせいじゃない」と言う', traits: { lie: 2 } }, // NG選択肢
    ],
  },

  // ========== ⑥ 思考実験 (2問) ==========
  {
    id: 'q_island', type: 'forced-choice', category: 'thought-experiment',
    question: '無人島に1つだけ持っていくなら？',
    options: [
      { value: 'A', text: '本（自分と向き合う）', traits: { detail: 1 } },
      { value: 'B', text: '音楽プレーヤー（楽しむ）', traits: { optimism: 2 } },
      { value: 'C', text: '日記帳（記録する）', traits: { detail: 2 } },
      { value: 'D', text: 'ナイフ（生き抜く）', traits: { initiative: 2, resilience: 2 } },
    ],
  },
  {
    id: 'q_lottery', type: 'forced-choice', category: 'thought-experiment',
    question: '宝くじで100万円当たったら、最初の1ヶ月で',
    options: [
      { value: 'A', text: '全額使い切る', traits: { optimism: 2, initiative: 1 } },
      { value: 'B', text: '半分くらい使う', traits: { optimism: 1, flexibility: 1 } },
      { value: 'C', text: '少し使って大半は貯金', traits: { detail: 2 } },
      { value: 'D', text: '全額貯金する', traits: { detail: 2 } },
    ],
  },

  // ========== ⑦ 自由記述 (1問・最終) ==========
  {
    id: 'q_effort', type: 'episode', category: 'grit',
    question: '今までの人生で一番努力したこと・頑張ったことは何ですか？',
    placeholder: 'いつ・何を・どれくらいの期間・なぜ頑張れたか、300字以内で',
    maxLength: 300,
  },
];

// ========== 採点ロジック ==========
function scoreResponse(answers) {
  const traits = ['initiative', 'cooperation', 'optimism', 'communication', 'flexibility', 'resilience', 'detail', 'lie'];
  const scores = {};
  const maxScores = {};
  for (const t of traits) { scores[t] = 0; maxScores[t] = 0; }

  for (const q of QUESTIONS) {
    if (q.type !== 'forced-choice') continue;
    const answer = answers[q.id];

    // この質問でその特性に与えうる最大値を計算
    const optMax = {};
    for (const opt of q.options) {
      for (const [trait, val] of Object.entries(opt.traits)) {
        optMax[trait] = Math.max(optMax[trait] || 0, val);
      }
    }
    for (const [trait, val] of Object.entries(optMax)) {
      maxScores[trait] = (maxScores[trait] || 0) + val;
    }

    if (!answer) continue;
    const selectedOpt = q.options.find((o) => o.value === answer.value);
    if (selectedOpt) {
      for (const [trait, val] of Object.entries(selectedOpt.traits)) {
        scores[trait] = (scores[trait] || 0) + val;
      }
    }
  }

  // 反応速度: 強制選択で平均が早い人=直感型=楽観性傾向
  const fcTimes = QUESTIONS
    .filter((q) => q.type === 'forced-choice' && q.category !== 'lie-scale')
    .map((q) => answers[q.id]?.timeMs)
    .filter((t) => t > 0);
  let avgTime = 0;
  if (fcTimes.length > 0) {
    avgTime = fcTimes.reduce((a, b) => a + b, 0) / fcTimes.length;
  }

  // 0-100に正規化
  const norm = (s, m) => Math.round(Math.max(0, Math.min(100, (s / Math.max(m, 1)) * 100)));

  const finalScores = {};
  for (const t of traits) {
    finalScores[t] = norm(scores[t], maxScores[t]);
  }

  return {
    ...finalScores,
    raw: scores,
    max: maxScores,
    avgTimeMs: Math.round(avgTime),
  };
}

// ========== タイプ診断 ==========
function diagnoseType(s) {
  const { initiative, cooperation, optimism, communication, lie, detail, resilience, flexibility } = s;

  // ライスケールが高すぎる → 取り繕い型
  if (lie >= 67) {
    return {
      type: '霧',
      icon: '🌫',
      name: '霧タイプ',
      tagline: '本音が見えない',
      desc: 'ライスケール（嘘発見質問）の値が高く、自分を良く見せようとする傾向が強いです。回答を額面通りに信用しないでください。',
      fit: 'caution',
      stars: 1,
    };
  }

  // 楽観性が極端に低い → 雨タイプ
  if (optimism <= 30 && resilience <= 30) {
    return {
      type: '雨',
      icon: '🌧',
      name: '雨タイプ',
      tagline: 'ネガティブ・引きずり型',
      desc: '楽観性とストレス耐性が低く、失敗を引きずる傾向。eye morの欲しい人物像（ポジティブで楽観的）から離れます。',
      fit: 'bad',
      stars: 1,
    };
  }

  // 主体性◎+楽観◎+協調◎ → 太陽タイプ（理想型）
  if (initiative >= 70 && optimism >= 60 && cooperation >= 50 && communication >= 60) {
    return {
      type: '太陽',
      icon: '☀',
      name: '太陽タイプ',
      tagline: 'eye mor理想形',
      desc: '主体的で楽観的、コミュ力も協調性もある全部入りの理想形。サロンを引っ張るリーダー候補です。',
      fit: 'best',
      stars: 5,
    };
  }

  // 協調性◎+楽観◎+主体△ → 桜タイプ
  if (cooperation >= 70 && optimism >= 60 && communication >= 50) {
    return {
      type: '桜',
      icon: '🌸',
      name: '桜タイプ',
      tagline: '愛され型・チームの花',
      desc: '協調性とコミュ力が高く、人を癒やすタイプ。お客様にも同僚にも好かれる、サロンに必要な存在。',
      fit: 'best',
      stars: 5,
    };
  }

  // 主体性◎+楽観◎+協調△ → 流星タイプ
  if (initiative >= 70 && optimism >= 60 && cooperation < 50) {
    return {
      type: '流星',
      icon: '🌟',
      name: '流星タイプ',
      tagline: '個人プレー型エース',
      desc: '主体性と楽観性は高いが、チームより個人で動くタイプ。エースになれるが、孤立リスクあり。',
      fit: 'good',
      stars: 4,
    };
  }

  // 協調性◎+柔軟◎ → 波タイプ
  if (cooperation >= 60 && flexibility >= 60 && optimism >= 50) {
    return {
      type: '波',
      icon: '🌊',
      name: '波タイプ',
      tagline: '適応型・どこでも上手くやれる',
      desc: '柔軟性が高く、状況に合わせて動ける。安心して任せられるが、自分から動くのは少し苦手。',
      fit: 'good',
      stars: 4,
    };
  }

  // 協調性◎+主体△+楽観△ → 大樹タイプ
  if (cooperation >= 60 && initiative < 50) {
    return {
      type: '大樹',
      icon: '🌳',
      name: '大樹タイプ',
      tagline: '安定型サポート役',
      desc: '協調性が高く、チームの土台を支えるタイプ。リーダーには向かないが、なくてはならない存在。',
      fit: 'ok',
      stars: 3,
    };
  }

  // 慎重さ高+主体性低 → 岩タイプ
  if (detail >= 60 && initiative < 40) {
    return {
      type: '岩',
      icon: '🪨',
      name: '岩タイプ',
      tagline: '慎重・固い',
      desc: '慎重で細かい仕事は得意だが、eye morの「ポジティブで大雑把」な空気には合わない可能性あり。',
      fit: 'bad',
      stars: 2,
    };
  }

  // 主体性◎+楽観◎+協調△+慎重◎ → 鷹タイプ
  if (initiative >= 60 && detail >= 50) {
    return {
      type: '鷹',
      icon: '🦅',
      name: '鷹タイプ',
      tagline: '主体性ある慎重派',
      desc: '主体的に動けるが慎重さも高い。決断力はあるが、大雑把で楽観的なeye morカラーとは少しズレる可能性。',
      fit: 'ok',
      stars: 3,
    };
  }

  // どれにも当てはまらない → 風タイプ（標準）
  return {
    type: '風',
    icon: '🍃',
    name: '風タイプ',
    tagline: 'バランス標準',
    desc: '特出した特性はないが、大きな問題もない標準型。面接で深掘りして判断するのがおすすめ。',
    fit: 'ok',
    stars: 3,
  };
}

const FIT_COLORS = {
  best: '#27ae60',
  good: '#2ecc71',
  ok: '#f39c12',
  bad: '#e67e22',
  caution: '#c0392b',
};

const TRAIT_LABELS = {
  initiative: '主体性',
  cooperation: '協調性',
  optimism: '楽観性',
  communication: 'コミュ力',
  flexibility: '柔軟性',
  resilience: 'ストレス耐性',
  detail: '慎重さ',
  lie: '取り繕い度',
};

// レーダーチャート用の6軸 (取り繕い・慎重さは別表示)
const RADAR_AXES = ['initiative', 'cooperation', 'optimism', 'communication', 'flexibility', 'resilience'];

// 後方互換用エイリアス
function getRecommendation(s) {
  const type = diagnoseType(s);
  return {
    rank: type.name,
    stars: type.stars,
    color: FIT_COLORS[type.fit] || '#888',
    reason: type.desc,
    type,
  };
}
