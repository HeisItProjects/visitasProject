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

export async function fetchVisits({ page = 1, pageSize = 10, filters = {} } = {}) {
  if (!baseRestUrl || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase no está configurado correctamente.')
  }

  const offset = (page - 1) * pageSize
  const limit = pageSize

  const params = new URLSearchParams({
    select:
      'id,nombrepersona,nombreempresa,proposito,fechavisita,horavisita,fechasalida,horasalida,salida,created_at',
    order: 'created_at.desc',
  })

  if (filters.nombreempresa) {
    params.append('nombreempresa', `ilike.*${filters.nombreempresa}*`)
  }
  if (filters.nombrepersona) {
    params.append('nombrepersona', `ilike.*${filters.nombrepersona}*`)
  }
  if (filters.fromDate && filters.toDate) {
    params.append('fechavisita', `gte.${filters.fromDate}`)
    params.append('fechavisita', `lte.${filters.toDate}`)
  } else if (filters.fromDate) {
    params.append('fechavisita', `gte.${filters.fromDate}`)
  } else if (filters.toDate) {
    params.append('fechavisita', `lte.${filters.toDate}`)
  }

  const response = await fetch(`${baseRestUrl}/visitas?${params.toString()}`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
      Prefer: 'count=exact',
      Range: `${offset}-${offset + limit - 1}`,
    },
  })

  if (!response.ok) {
    let message = 'No se pudo obtener las visitas.'
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  const contentRange = response.headers.get('content-range')
  const total = contentRange ? Number(contentRange.split('/')[1]) : undefined
  const data = await response.json()
  return { data, total }
}

export async function fetchOpenVisits() {
  if (!baseRestUrl || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase no está configurado correctamente.')
  }

  const params = new URLSearchParams({
    select: 'id,nombrepersona,nombreempresa,fechavisita,horavisita',
    salida: 'eq.false',
    order: 'created_at.desc',
  })

  const response = await fetch(`${baseRestUrl}/visitas?${params.toString()}`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    let message = 'No se pudo obtener la lista de visitas.'
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  return response.json()
}

export async function searchOpenVisits(filters = {}) {
  if (!baseRestUrl || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase no está configurado correctamente.')
  }

  const params = new URLSearchParams({
    select: 'id,nombrepersona,nombreempresa,fechavisita,horavisita',
    salida: 'eq.false',
    order: 'created_at.desc',
  })

  if (filters.nombrepersona && filters.nombrepersona.trim()) {
    params.append('nombrepersona', `ilike.*${filters.nombrepersona.trim()}*`)
  }
  if (filters.nombreempresa && filters.nombreempresa.trim()) {
    params.append('nombreempresa', `ilike.*${filters.nombreempresa.trim()}*`)
  }

  const response = await fetch(`${baseRestUrl}/visitas?${params.toString()}`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    let message = 'No se pudo buscar las visitas.'
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  return response.json()
}

export async function markVisitAsExited(id, { fechasalida, horasalida }) {
  if (!baseRestUrl || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase no está configurado correctamente.')
  }
  const params = new URLSearchParams({
    id: `eq.${id}`,
    select: 'id,salida,fechasalida,horasalida',
  })
  const payload = {
    salida: true,
    fechasalida,
    horasalida,
  }
  const response = await fetch(`${baseRestUrl}/visitas?${params.toString()}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = 'No se pudo registrar la salida.'
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  const json = await response.json()
  return Array.isArray(json) ? json[0] : json
}

export function getTodayDateString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getCurrentTimeString() {
  const d = new Date()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export async function loginUser(nombre, contrasena) {
  if (!baseRestUrl || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase no está configurado correctamente.')
  }

  const params = new URLSearchParams({
    select: 'id,nombre,contrasena',
    nombre: `eq.${nombre}`,
    contrasena: `eq.${contrasena}`,
  })

  const response = await fetch(`${baseRestUrl}/users?${params.toString()}`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    let message = 'Error al verificar las credenciales.'
    try {
      const body = await response.json()
      if (body?.message) message = body.message
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  const data = await response.json()
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Usuario o contraseña incorrectos.')
  }

  return data[0]
}

