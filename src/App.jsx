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
  const [isLiffInitialized, setIsLiffInitialized] = useState(false);

  // デバッグログ用の状態
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

  // デバッグログを追加する関数
  const addDebugLog = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    
    setDebugLogs(prevLogs => [...prevLogs, logEntry]);
    console.log(`[APP DEBUG] ${message}`, data || '');
  };

  // LIFFの初期化
  useEffect(() => {
    const initializeLiff = async () => {
      addDebugLog('App: LIFF初期化を開始します');
      
      try {
        addDebugLog('App: initLiff()を呼び出します');
        await initLiff();
        addDebugLog('App: initLiff()が成功しました');
        
        setIsLiffInitialized(true);
        setError(null); // エラーをクリア
        
        // LIFFが初期化され、ログインしているかチェック
        const isLoggedIn = liff.isLoggedIn();
        addDebugLog('App: liff.isLoggedIn()の結果', { isLoggedIn });
        
        if (isLoggedIn) {
          setIsLoggedIn(true);
          try {
            addDebugLog('App: liff.getProfile()を呼び出します');
            const profile = await liff.getProfile();
            addDebugLog('App: プロフィール取得成功', { 
              userId: profile.userId,
              displayName: profile.displayName,
              hasPicture: !!profile.pictureUrl
            });
            
            setUserProfile(profile);
            setName(profile.displayName); // ユーザー名を自動入力
          } catch (error) {
            addDebugLog('App: プロフィール取得エラー', { 
              name: error.name,
              message: error.message,
              code: error.code
            });
            console.error('プロフィール取得エラー', error);
            // プロフィール取得エラーは致命的ではないので、アプリは引き続き使用可能
          }
        }
      } catch (error) {
        addDebugLog('App: LIFF初期化エラー', { 
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code
        });
        console.error('LIFF初期化エラー', error);
        
        // エラーメッセージを設定するが、isLiffInitializedはtrueに設定
        // これにより、LINEから開いた場合でもアプリが使用可能になる
        setError(`LIFFの初期化中にエラーが発生しました: ${error.message}`);
        setIsLiffInitialized(true);
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
      
      {/* デバッグ情報表示切り替えボタン */}
      <button 
        onClick={() => setShowDebug(!showDebug)} 
        className="debug-toggle-button"
      >
        {showDebug ? 'デバッグ情報を隠す' : 'デバッグ情報を表示'}
      </button>
      
      {/* デバッグ情報表示エリア */}
      {showDebug && (
        <div className="debug-container">
          <h3>デバッグ情報</h3>
          <div id="liff-debug" className="debug-logs">
            {debugLogs.map((log, index) => (
              <div key={index} className="debug-log-entry">
                <div className="debug-timestamp">{log.timestamp}</div>
                <div className="debug-message">{log.message}</div>
                {log.data && <pre className="debug-data">{log.data}</pre>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
      
      {isLiffInitialized && (
        <>
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
        </>
      )}
    </div>
  );
}

export default App;
