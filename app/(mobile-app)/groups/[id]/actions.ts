'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function sendMessage(groupId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")
  if (!content.trim()) return

  try {
    const newMessage = await prisma.message.create({
      data: {
        content,
        groupId,
        senderId: user.id
      },
      include: {
        sender: {
          select: { name: true }
        }
      }
    })
    return newMessage
  } catch (e) {
    console.error("Error sending message:", e)
    return null
  }
}