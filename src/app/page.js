// src/app/page.js
'use client'

import { useState } from 'react'

export default function HomePage() {
  const [selectedStudents, setSelectedStudents] = useState([])
  
  // ダミーデータ（後でAPIから取得）
  const students = [
    {
      id: 1,
      name: '山田太郎',
      classes: ['水曜16:30', '金曜17:30']
    },
    {
      id: 2,
      name: '山田花子',
      classes: ['月曜15:00', '木曜15:00']
    }
  ]

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map(s => s.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* 生徒選択セクション */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-800">生徒を選択</h2>
        
        <div className="space-y-3">
          {students.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              isSelected={selectedStudents.includes(student.id)}
              onSelect={() => handleStudentSelect(student.id)}
            />
          ))}
          
          {/* 全選択ボタン */}
          <div 
            onClick={selectAllStudents}
            className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <span className="text-gray-600 font-medium">
              {selectedStudents.length === students.length ? '☑️' : '⭕'} すべての生徒を選択
            </span>
          </div>
        </div>
      </section>

      {/* アクションボタン */}
      <section className="space-y-3">
        <ActionButton
          href="/absence"
          title="欠席連絡をする"
          description="今日・明日以降の欠席を連絡"
          color="red"
          disabled={selectedStudents.length === 0}
        />
        
        <ActionButton
          href="/makeup"
          title="振替予約をする"
          description="空いているクラスに振替予約"
          color="blue"
          disabled={selectedStudents.length === 0}
        />
        
        <ActionButton
          href="/history"
          title="履歴を確認する"
          description="欠席・振替の履歴を確認"
          color="green"
        />
      </section>
    </div>
  )
}

// 生徒カードコンポーネント
function StudentCard({ student, isSelected, onSelect }) {
  return (
    <div 
      onClick={onSelect}
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center">
        <span className="text-xl mr-3">
          {isSelected ? '☑️' : '⬜'}
        </span>
        <div>
          <h3 className="font-bold text-gray-800">{student.name}</h3>
          <p className="text-sm text-gray-600">
            {student.classes.join(' / ')}
          </p>
        </div>
      </div>
    </div>
  )
}

// アクションボタンコンポーネント
function ActionButton({ href, title, description, color, disabled = false }) {
  const colors = {
    red: disabled ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600',
    blue: disabled ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600',
    green: disabled ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'
  }

  return (
    <a 
      href={disabled ? '#' : href}
      className={`block w-full ${colors[color]} text-white rounded-lg p-4 text-center transition-colors ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </a>
  )
}