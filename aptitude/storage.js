// Storage abstraction: Supabaseが設定されていればクラウド、なければlocalStorage。
// データ構造はlocalStorage時代と互換: { id, name, submittedAt, totalTimeMs, answers, questionTimes, scores, recommendation }

const Storage = {
  isCloud: false,
  client: null,

  init() {
    const cfg = window.SUPABASE_CONFIG;
    if (!cfg || !cfg.url || !cfg.anonKey) return false;
    if (typeof window.supabase === 'undefined') {
      console.warn('Supabase JS SDK not loaded; falling back to localStorage');
      return false;
    }
    this.client = window.supabase.createClient(cfg.url, cfg.anonKey);
    this.isCloud = true;
    return true;
  },

  // 応募者が回答送信
  async save(submission) {
    if (this.isCloud) {
      const { error } = await this.client.from('responses').insert({
        name: submission.name,
        submitted_at: submission.submittedAt,
        total_time_ms: submission.totalTimeMs,
        data: submission,
      });
      if (error) throw error;
      return;
    }
    const list = JSON.parse(localStorage.getItem('aptitude_responses') || '[]');
    list.push(submission);
    localStorage.setItem('aptitude_responses', JSON.stringify(list));
  },

  // 管理画面で一覧取得
  async list() {
    if (this.isCloud) {
      const { data, error } = await this.client
        .from('responses')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      // dataカラム(jsonb)を展開してidとsubmitted_atで上書き
      return (data || []).map((row) => ({
        ...(row.data || {}),
        id: row.id,
        submittedAt: row.submitted_at,
      }));
    }
    const list = JSON.parse(localStorage.getItem('aptitude_responses') || '[]');
    return list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  // 管理画面から削除
  async delete(id) {
    if (this.isCloud) {
      const { error } = await this.client.from('responses').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const list = JSON.parse(localStorage.getItem('aptitude_responses') || '[]')
      .filter((r) => r.id !== id);
    localStorage.setItem('aptitude_responses', JSON.stringify(list));
  },

  // localStorage専用: デモ用一括削除
  async clearLocal() {
    if (this.isCloud) return false;
    localStorage.removeItem('aptitude_responses');
    return true;
  },
};

const Auth = {
  // 現在のセッション取得 (Supabaseモードのみ意味あり)
  async getSession() {
    if (!Storage.isCloud) return { mode: 'local' };
    const { data } = await Storage.client.auth.getSession();
    return data?.session || null;
  },

  async signIn(email, password) {
    if (!Storage.isCloud) throw new Error('localStorageモードでは認証不要です');
    const { data, error } = await Storage.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!Storage.isCloud) return;
    await Storage.client.auth.signOut();
  },

  // セッション変更を監視 (ログイン/ログアウトでUIを更新するため)
  onChange(cb) {
    if (!Storage.isCloud) return;
    Storage.client.auth.onAuthStateChange((_event, session) => cb(session));
  },
};
