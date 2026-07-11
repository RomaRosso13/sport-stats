import { supabase } from '../libs/supabase'

const BUCKET = 'images'

export async function uploadImage(blob, folder) {
  const ext = blob.type === 'image/png' ? 'png' : 'jpg'
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const path = `${folder}/${uniqueId}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: blob.type
    })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
