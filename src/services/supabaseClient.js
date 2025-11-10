const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL) {
  console.warn('VITE_SUPABASE_URL no está configurada. Añádela al archivo .env.')
}

if (!SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_ANON_KEY no está configurada. Añádela al archivo .env.')
}

const baseRestUrl = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : ''

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
      Accept: 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(visitData),
  })

  if (!response.ok) {
    let message = 'No se pudo registrar la visita.'
    try {
      const errorBody = await response.json()
      if (errorBody && errorBody.message) {
        message = errorBody.message
      }
    } catch (jsonError) {
      const errorText = await response.text()
      if (errorText) {
        message = errorText
      }
    }
    throw new Error(message)
  }

  return response.json()
}

