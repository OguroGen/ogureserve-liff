# そろばん教室予約・振替システム

LINE公式アカウント上で動作するそろばん教室向けの欠席連絡・振替予約システム

## 概要

- LINE公式アカウント上のミニアプリとして動作
- 保護者が生徒の欠席連絡・振替予約を簡単に行える
- 複数の教室に対応（マルチテナント）
- URLパラメータで教室を自動識別

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 19, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の値を設定してください：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. データベースセットアップ

Supabaseでデータベースを作成し、以下のテーブルを作成してください：

```sql
-- 1. organizations（教室の経営体）
CREATE TABLE organizations (
  organization_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- URLパラメータ用
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. locations（教室）
CREATE TABLE locations (
  location_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(organization_id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. class_sessions（クラス）
CREATE TABLE class_sessions (
  class_session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(location_id) NOT NULL,
  name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0:日〜6:土
  start_time TIME NOT NULL,
  end_time TIME,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. guardians（保護者）
CREATE TABLE guardians (
  guardian_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  line_display_name TEXT,
  organization_id UUID REFERENCES organizations(organization_id) NOT NULL,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. students（生徒）
CREATE TABLE students (
  student_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_name TEXT NOT NULL,
  given_name TEXT NOT NULL,
  family_name_kana TEXT NOT NULL,
  given_name_kana TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  school_name TEXT,
  start_date DATE,
  end_date DATE,
  remaining_makeups INTEGER DEFAULT 0,
  organization_student_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. student_guardian_relations（生徒と保護者の関係）
CREATE TABLE student_guardian_relations (
  relation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(student_id) NOT NULL,
  guardian_id UUID REFERENCES guardians(guardian_id) NOT NULL,
  relation_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (student_id, guardian_id)
);

-- 7. enrollments（固定の通塾登録）
CREATE TABLE enrollments (
  enrollment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(student_id) NOT NULL,
  class_session_id UUID REFERENCES class_sessions(class_session_id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (student_id, class_session_id)
);
```

### 4. サンプルデータの投入

```sql
-- サンプル組織
INSERT INTO organizations (name, code) VALUES 
('石川塾', 'ishikawa-juku'),
('山田そろばん教室', 'yamada-soroban');

-- サンプル教室
INSERT INTO locations (organization_id, name, address) 
SELECT organization_id, '若宮谷教室', '東京都北区若宮1-1-1' 
FROM organizations WHERE code = 'ishikawa-juku';

INSERT INTO locations (organization_id, name, address) 
SELECT organization_id, '北赤羽教室', '東京都北区北赤羽2-2-2' 
FROM organizations WHERE code = 'ishikawa-juku';

-- サンプルクラス
INSERT INTO class_sessions (location_id, name, day_of_week, start_time, end_time, capacity)
SELECT location_id, '水曜15:00クラス', 3, '15:00', '16:00', 10 
FROM locations WHERE name = '若宮谷教室';

INSERT INTO class_sessions (location_id, name, day_of_week, start_time, end_time, capacity)
SELECT location_id, '水曜16:30クラス', 3, '16:30', '17:30', 10 
FROM locations WHERE name = '若宮谷教室';

INSERT INTO class_sessions (location_id, name, day_of_week, start_time, end_time, capacity)
SELECT location_id, '金曜17:30クラス', 5, '17:30', '18:30', 10 
FROM locations WHERE name = '北赤羽教室';
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

## 使用方法

### 教室固有URLの生成

各教室には固有のURLパラメータを付けてアクセスします：

```
石川塾の場合:
http://localhost:3000?org=ishikawa-juku

山田そろばん教室の場合:
http://localhost:3000?org=yamada-soroban
```

### 保護者の初回登録フロー

1. **LINE認証**: LINEからミニアプリにアクセス
2. **保護者情報登録**: 名前、電話番号、所属教室（自動設定）
3. **生徒情報登録**: 生徒の基本情報と受講クラス選択
4. **ホーム画面**: 欠席連絡・振替予約機能が利用可能

### 主要機能

- ✅ **初回登録機能**: 保護者・生徒情報の登録
- ✅ **教室固有URL**: URLパラメータによる教室自動識別
- ✅ **生徒管理**: 複数生徒の登録・管理
- ⭕ **欠席連絡**: 体調不良時の欠席連絡（未実装）
- ⭕ **振替予約**: 欠席分の振替予約（未実装）
- ⭕ **履歴確認**: 過去の欠席・振替履歴（未実装）

## ファイル構成

```
src/
├── app/
│   ├── api/
│   │   ├── guardians/          # 保護者関連API
│   │   ├── students/           # 生徒関連API
│   │   └── organizations/      # 教室関連API
│   ├── register/
│   │   ├── guardian/          # 保護者登録画面
│   │   └── student/           # 生徒登録画面
│   ├── error/                 # エラー画面
│   ├── layout.js              # 共通レイアウト
│   └── page.js                # ホーム画面
├── contexts/
│   └── AppContext.js          # アプリ状態管理
└── lib/
    └── supabase.js            # Supabaseクライアント
```

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定
3. 自動デプロイが実行される

### LINE公式アカウントとの連携

1. LINEアプリからリッチメニューまたはメッセージで教室固有URLを設定
2. 保護者はLINEからミニアプリにアクセス
3. 初回登録後、継続してシステムを利用

## 今後の実装予定

1. **欠席連絡機能**: 
   - 欠席日・クラス選択
   - 振替可能回数の自動増加

2. **振替予約機能**:
   - 空き状況確認
   - 振替クラス予約

3. **履歴確認機能**:
   - 欠席・振替履歴表示
   - 振替予約キャンセル

4. **教師向け管理機能**:
   - 出席確認
   - 生徒一覧管理
   - システム設定

5. **LINE LIFF SDK連携**:
   - 本格的なLINE認証
   - プロフィール情報取得

## ライセンス

Private project - 無断転載禁止
