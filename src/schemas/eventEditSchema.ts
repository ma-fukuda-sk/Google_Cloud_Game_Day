import { z } from 'zod'

export const eventEditSchema = z.object({
  name: z
    .string()
    .min(1, 'イベント名は必須です')
    .max(100, 'イベント名は100文字以内で入力してください'),
  
  description: z
    .string()
    .max(1000, '説明は1000文字以内で入力してください')
    .optional(),
  
  status: z.enum(['draft', 'published', 'active', 'completed', 'cancelled'], {
    required_error: 'ステータスを選択してください'
  }),
  
  startDate: z
    .date({
      required_error: '開始日時は必須です'
    }),
  
  endDate: z
    .date({
      required_error: '終了日時は必須です'
    }),
  
  duration: z
    .number()
    .min(30, '開催時間は30分以上で設定してください')
    .max(1440, '開催時間は24時間以内で設定してください'),
  
  maxTeams: z
    .number()
    .min(1, '最大参加チーム数は1以上で設定してください')
    .max(100, '最大参加チーム数は100以下で設定してください'),
  
  registrationDeadline: z
    .date()
    .nullable()
    .optional(),
  
  scenarios: z
    .array(z.string())
    .min(1, '最低1つのシナリオを選択してください'),
  
  scoringType: z.enum(['time', 'points', 'hybrid'], {
    required_error: '採点方式を選択してください'
  }),
  
  settings: z.object({
    allowLateRegistration: z.boolean(),
    autoStartScoring: z.boolean(),
    showLeaderboard: z.boolean(),
    notificationEnabled: z.boolean(),
  })
}).refine(data => data.endDate > data.startDate, {
  message: '終了日時は開始日時より後に設定してください',
  path: ['endDate']
}).refine(data => {
  if (data.registrationDeadline) {
    return data.registrationDeadline <= data.startDate
  }
  return true
}, {
  message: '参加登録締切は開始日時以前に設定してください',
  path: ['registrationDeadline']
})

export type EventEditSchemaType = z.infer<typeof eventEditSchema>