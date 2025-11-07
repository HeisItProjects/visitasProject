const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SIGNATURE_BUCKET = import.meta.env.VITE_SUPABASE_SIGNATURE_BUCKET

if (!SUPABASE_URL) {
  console.warn('VITE_SUPABASE_URL no está configurada. Añádela al archivo .env.')
}

if (!SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_ANON_KEY no está configurada. Añádela al archivo .env.')
}

const baseRestUrl = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : ''
const baseStorageUrl = SUPABASE_URL ? `${SUPABASE_URL}/storage/v1` : ''

export async function createVisit(visitData) {
  if (!baseRestUrl || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase no está configurado correctamente.')
  }

  const response = await fetch(`${baseRestUrl}/visitas`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(visitData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'No se pudo registrar la visita.')
  }

  return response.json()
}

export async function uploadSignature(dataUrl) {
  if (!baseStorageUrl || !SUPABASE_ANON_KEY || !SUPABASE_SIGNATURE_BUCKET) {
    throw new Error('Supabase storage no está configurado correctamente.')
  }

  const fileName = `firma-${Date.now()}-${crypto.randomUUID()}.png`

  const blob = await dataUrlToBlob(dataUrl)

  const response = await fetch(
    `${baseStorageUrl}/object/${encodeURIComponent(SUPABASE_SIGNATURE_BUCKET)}/${fileName}`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'image/png',
      },
      body: blob,
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'No se pudo guardar la firma en Supabase Storage.')
  }

  const publicUrl = `${baseStorageUrl}/object/public/${encodeURIComponent(
    SUPABASE_SIGNATURE_BUCKET,
  )}/${fileName}`

  return {
    path: `${SUPABASE_SIGNATURE_BUCKET}/${fileName}`,
    publicUrl,
  }
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}

