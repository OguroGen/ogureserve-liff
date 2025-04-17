// src/App.jsx
import { useState, useEffect } from 'react';
import { initLiff, liff } from './liff';
import './App.css';

const API_URL = 'https://ogureserve-api.onrender.com/api/reservations';

function App() {
  const [reservations, setReservations] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // LIFFの初期化
  useEffect(() => {
    const initializeLiff = async () => {
      await initLiff();
      
      // LIFFが初期化され、ログインしているかチェック
      if (liff.isLoggedIn()) {
        setIsLoggedIn(true);
        try {
          const profile = await liff.getProfile();
          setUserProfile(profile);
          setName(profile.displayName); // ユーザー名を自動入力
        } catch (error) {
          console.error('プロフィール取得エラー', error);
        }
      }
    };
    
    initializeLiff();
  }, []);

  // 予約データの取得
  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // データが配列であることを確認
      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        console.error("APIが配列を返しませんでした:", data);
        setReservations([]); // レスポンスが期待通りでない場合は空配列をセット
        setError("サーバーから無効なデータ形式を受信しました。");
      }
    } catch (e) {
      console.error("予約の取得に失敗:", e);
      setError(`予約の取得に失敗しました: ${e.message}`);
      setReservations([]); // エラー時は予約をクリア
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントマウント時に予約を取得
  useEffect(() => {
    fetchReservations();
  }, []); // 空の依存配列は、マウント時に一度だけ実行することを意味します

  // フォーム送信処理
  const handleSubmit = async (event) => {
    event.preventDefault(); // デフォルトのフォーム送信動作を防止
    setLoading(true);
    setError(null);

    // 基本的なバリデーション
    if (!name || !date || !time) {
      setError("すべてのフィールドを入力してください。");
      setLoading(false);
      return;
    }

    try {
      // 日付と時間をISO 8601形式の日時に結合
      const datetime = `${date}T${time}:00`;
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, datetime }),
      });

      if (!response.ok) {
        // レスポンスボディからエラーメッセージを取得
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch (parseError) {
          // レスポンスボディがJSONでないか空の場合は無視
        }
        throw new Error(errorMessage);
      }

      // フォームをクリアしてリストを更新
      setDate('');
      setTime('');
      fetchReservations(); // 送信成功後にリストを更新
    } catch (e) {
      console.error("予約の作成に失敗:", e);
      setError(`予約の作成に失敗しました: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>おぐリザーブ</h1>
      
      {/* ユーザープロフィール表示 */}
      {isLoggedIn && userProfile && (
        <div className="user-profile">
          <img src={userProfile.pictureUrl} alt={userProfile.displayName} className="profile-image" />
          <p>ようこそ、{userProfile.displayName}さん</p>
        </div>
      )}

      {/* 予約作成フォーム */}
      <form onSubmit={handleSubmit} className="reservation-form">
        <h2>新しい予約を作成</h2>
        <div className="form-group">
          <label htmlFor="name">名前:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">日付:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="time">時間:</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? '作成中...' : '予約を作成'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>

      {/* 予約リスト */}
      <div className="reservation-list">
        <h2>既存の予約</h2>
        {loading && <p>読み込み中...</p>}
        {!loading && !error && reservations.length === 0 && <p>予約はありません。</p>}
        {!loading && reservations.length > 0 && (
          <ul>
            {reservations.map((reservation) => (
              <li key={reservation._id || reservation.id} className="reservation-item">
                <strong>{reservation.name}</strong> - {
                  reservation.datetime 
                    ? new Date(reservation.datetime).toLocaleString('ja-JP')
                    : `${new Date(reservation.date).toLocaleDateString()} ${reservation.time}`
                }
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
