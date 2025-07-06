import { z } from 'zod'

export const teamSchema = z.object({
  name: z
    .string()
    .min(1, 'チーム名は必須です')
    .max(50, 'チーム名は50文字以内で入力してください'),
  
  members: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, '名前は必須です')
          .max(30, '名前は30文字以内で入力してください'),
        email: z
          .string()
          .email('有効なメールアドレスを入力してください'),
        role: z.enum(['leader', 'member'], {
          required_error: '役割を選択してください'
        })
      })
    )
    .min(1, '最低1名のメンバーが必要です')
    .max(10, 'メンバー数は10名までです')
    .refine(
      (members) => members.filter(m => m.role === 'leader').length === 1,
      { message: 'リーダーは1名である必要があります' }
    ),
  
  gcpProjectId: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^[a-z][a-z0-9\-]{4,28}[a-z0-9]$/.test(value),
      { message: 'GCPプロジェクトIDの形式が正しくありません' }
    )
})

export type TeamSchemaType = z.infer<typeof teamSchema>