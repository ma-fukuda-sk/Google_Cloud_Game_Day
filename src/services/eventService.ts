import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Event, EventFormData, Team } from '../types/event'

// Events Collection
const EVENTS_COLLECTION = 'events'
const TEAMS_COLLECTION = 'teams'

export const eventService = {
  // イベント作成
  async createEvent(eventData: EventFormData, userId: string): Promise<string> {
    const event: Omit<Event, 'id'> = {
      name: eventData.name,
      description: eventData.description,
      status: eventData.status,
      startDate: Timestamp.fromDate(eventData.startDate),
      endDate: Timestamp.fromDate(eventData.endDate),
      duration: eventData.duration,
      maxTeams: eventData.maxTeams,
      currentTeamCount: 0,
      scenarios: eventData.scenarios,
      scoringType: eventData.scoringType,
      settings: eventData.settings,
      createdBy: userId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    }
    
    // registrationDeadlineがある場合のみ追加
    if (eventData.registrationDeadline) {
      event.registrationDeadline = Timestamp.fromDate(eventData.registrationDeadline)
    }
    
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), event)
    return docRef.id
  },

  // イベント一覧取得
  async getEvents(): Promise<Event[]> {
    const snapshot = await getDocs(collection(db, EVENTS_COLLECTION))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Event))
  },

  // イベント詳細取得
  async getEvent(eventId: string): Promise<Event | null> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId)
    const snapshot = await getDoc(docRef)
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Event
    }
    return null
  },

  // イベント更新
  async updateEvent(eventId: string, eventData: Partial<EventFormData>): Promise<void> {
    const updateData: Partial<Event> & { updatedAt: Timestamp } = {
      updatedAt: serverTimestamp() as Timestamp,
    }
    
    // EventFormDataからEventへの変換
    if (eventData.name !== undefined) updateData.name = eventData.name
    if (eventData.description !== undefined) updateData.description = eventData.description
    if (eventData.status !== undefined) updateData.status = eventData.status
    if (eventData.duration !== undefined) updateData.duration = eventData.duration
    if (eventData.maxTeams !== undefined) updateData.maxTeams = eventData.maxTeams
    if (eventData.scenarios !== undefined) updateData.scenarios = eventData.scenarios
    if (eventData.scoringType !== undefined) updateData.scoringType = eventData.scoringType
    if (eventData.settings !== undefined) updateData.settings = eventData.settings
    
    // Date型をTimestamp型に変換（undefinedの場合は追加しない）
    if (eventData.startDate) {
      updateData.startDate = Timestamp.fromDate(eventData.startDate)
    }
    if (eventData.endDate) {
      updateData.endDate = Timestamp.fromDate(eventData.endDate)
    }
    if (eventData.registrationDeadline) {
      updateData.registrationDeadline = Timestamp.fromDate(eventData.registrationDeadline)
    }
    
    const docRef = doc(db, EVENTS_COLLECTION, eventId)
    await updateDoc(docRef, updateData)
  },

  // イベント削除
  async deleteEvent(eventId: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, eventId)
    await deleteDoc(docRef)
  },


  // イベントのチーム取得
  async getEventTeams(eventId: string): Promise<Team[]> {
    const q = query(
      collection(db, TEAMS_COLLECTION),
      where('eventId', '==', eventId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Team))
  },

  // イベントのチーム数を更新
  async updateTeamCount(eventId: string, increment: number): Promise<void> {
    const event = await this.getEvent(eventId)
    if (!event) {
      throw new Error('イベントが見つかりません')
    }

    const newCount = Math.max(0, event.currentTeamCount + increment)
    const docRef = doc(db, EVENTS_COLLECTION, eventId)
    await updateDoc(docRef, {
      currentTeamCount: newCount
    })
  }
}