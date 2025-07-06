import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

export const testFirestoreConnection = async () => {
  try {
    console.log('Firestore接続テスト開始...')
    
    // テストデータを作成
    const testData = {
      name: 'Test Event',
      createdAt: new Date(),
      test: true
    }
    
    // データを書き込み
    const docRef = await addDoc(collection(db, 'test'), testData)
    console.log('テストドキュメント作成成功:', docRef.id)
    
    // データを読み込み
    const querySnapshot = await getDocs(collection(db, 'test'))
    console.log('テストドキュメント読み込み成功:', querySnapshot.size, '件')
    
    return true
  } catch (error) {
    console.error('Firestore接続テスト失敗:', error)
    return false
  }
}