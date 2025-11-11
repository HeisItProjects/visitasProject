import heisLogo from '../assets/branding/heis_logo.png'

/**
 * Formatea la fecha en formato DD/MM/YYYY
 */
function formatDate(date) {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Escapa caracteres especiales para ZPL
 */
function escapeZPL(text) {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\^/g, '\\^')
    .replace(/~/g, '\\~')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
}

/**
 * Convierte una imagen PNG a formato ZPL (hexadecimal comprimido)
 * Esta es una versión simplificada - para mejor calidad, usar una librería especializada
 */
async function convertImageToZPL(imagePath) {
  try {
    const response = await fetch(imagePath)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    
    // Convertir a hexadecimal
    let hex = ''
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0')
    }
    
    // Para Godex, podemos usar ^GF (Graphic Field) con datos hexadecimales
    // Pero es más simple usar una imagen base64 o crear una versión simplificada
    return hex
  } catch (error) {
    console.error('Error al convertir imagen:', error)
    return null
  }
}

/**
 * Genera código ZPL para la etiqueta de visita
 * Compatible con impresoras Godex
 */
async function generateZPL({ nombrepersona, nombreempresa, fechavisita }) {
  // Formatear fecha
  const fechaFormateada = fechavisita ? formatDate(fechavisita) : formatDate(new Date())

  // Escapar texto
  const nombreEscapado = escapeZPL(nombrepersona || '')
  const empresaEscapada = escapeZPL(nombreempresa || '')

  // Dimensiones típicas para etiqueta de visitante (100mm x 50mm a 203 DPI)
  // ^LH = Label Home (origen)
  // ^LL = Label Length (longitud de etiqueta)
  // ^FO = Field Origin (posición X,Y)
  // ^A0 = Fuente por defecto (A0N = normal, A0B = bold)
  // ^FD = Field Data (texto)
  // ^FS = Field Separator
  // ^XZ = Fin de etiqueta

  // Generar código ZPL básico con texto
  // Nota: Para incluir el logo en ZPL, necesitarías convertirlo a formato específico
  // Por ahora, el logo se mostrará en la versión HTML de impresión
  
  let zpl = `^XA
^LH0,0
^LL200
^FO20,20^A0B,35,35^FDHEIS GLOBAL^FS
^FO120,50^A0B,40,40^FD${nombreEscapado}^FS`

  if (empresaEscapada) {
    zpl += `\n^FO120,95^A0B,32,32^FD${empresaEscapada}^FS`
  }

  zpl += `\n^FO120,140^A0B,28,28^FDFecha: ${fechaFormateada}^FS
^XZ`

  return zpl
}

/**
 * Imprime la etiqueta enviando el código ZPL directamente a la impresora
 * Para impresoras Godex conectadas por USB o red
 */
export async function printLabel({ nombrepersona, nombreempresa, fechavisita }) {
  try {
    const zpl = await generateZPL({ nombrepersona, nombreempresa, fechavisita })

    // Opción 1: Intentar usar WebUSB para impresoras USB (si está disponible)
    if (navigator.usb) {
      try {
        // Esto requiere que la impresora soporte WebUSB y esté configurada
        // Por ahora, usamos el método alternativo
        console.log('WebUSB disponible, pero requiere configuración específica de la impresora')
      } catch (usbError) {
        console.log('WebUSB no disponible o error:', usbError)
      }
    }

    // Opción 2: Crear un blob con el código ZPL y descargarlo/enviarlo
    // Esto permite que el usuario lo envíe manualmente a la impresora
    // o que un servicio intermedio lo procese
    
    const blob = new Blob([zpl], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    // Crear un enlace temporal para descargar/enviar
    const link = document.createElement('a')
    link.href = url
    link.download = `etiqueta_${nombrepersona.replace(/\s+/g, '_')}_${Date.now()}.zpl`
    
    // Intentar enviar directamente a la impresora usando RawPrint
    // Si el sistema tiene configurada una impresora de etiquetas como predeterminada,
    // podemos intentar imprimir directamente
    
    // Método alternativo: usar una ventana de impresión con el código ZPL
    const printWindow = window.open('', '_blank', 'width=400,height=200')
    if (!printWindow) {
      // Si no se puede abrir ventana, ofrecer descarga
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return true
    }

    // Convertir logo a base64 para incluirlo en la etiqueta
    let logoBase64 = ''
    try {
      const logoResponse = await fetch(heisLogo)
      const logoBlob = await logoResponse.blob()
      const logoReader = new FileReader()
      logoBase64 = await new Promise((resolve) => {
        logoReader.onloadend = () => resolve(logoReader.result)
        logoReader.readAsDataURL(logoBlob)
      })
    } catch (logoError) {
      console.log('No se pudo cargar el logo:', logoError)
    }

    // Crear contenido para imprimir
    const fechaFormateada = fechavisita ? formatDate(fechavisita) : formatDate(new Date())
    const nombreEscapado = nombrepersona.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const empresaEscapada = nombreempresa ? nombreempresa.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta de Visita - ${nombreEscapado}</title>
          <style>
            @page {
              size: 100mm 50mm;
              margin: 0;
            }
            @media print {
              body { 
                margin: 0;
                padding: 1mm;
                font-family: Arial, sans-serif;
                background: white;
              }
              .label-container {
                display: flex;
                align-items: center;
                height: 48mm;
                gap: 2mm;
              }
              .logo-container {
                flex-shrink: 0;
                width: 35mm;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .logo-img {
                max-height: 45mm;
                max-width: 100%;
                object-fit: contain;
              }
              .info-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding-left: 1mm;
              }
              .nombre {
                font-size: 22pt;
                font-weight: bold;
                margin-bottom: 1mm;
                text-align: left;
                color: #000;
                line-height: 1.2;
              }
              .empresa {
                font-size: 16pt;
                font-weight: bold;
                margin-bottom: 1mm;
                color: #000;
                text-align: left;
                line-height: 1.2;
              }
              .fecha {
                font-size: 14pt;
                font-weight: bold;
                color: #000;
                text-align: left;
                line-height: 1.2;
              }
            }
            body {
              padding: 1mm;
              font-family: Arial, sans-serif;
              background: white;
            }
            .label-container {
              display: flex;
              align-items: center;
              height: 48mm;
              gap: 2mm;
            }
            .logo-container {
              flex-shrink: 0;
              width: 35mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .logo-img {
              max-height: 45mm;
              max-width: 100%;
              object-fit: contain;
            }
            .info-container {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              padding-left: 1mm;
            }
            .nombre {
              font-size: 22pt;
              font-weight: bold;
              margin-bottom: 1mm;
              text-align: left;
              color: #000;
              line-height: 1.2;
            }
            .empresa {
              font-size: 16pt;
              font-weight: bold;
              margin-bottom: 1mm;
              color: #000;
              text-align: left;
              line-height: 1.2;
            }
            .fecha {
              font-size: 14pt;
              font-weight: bold;
              color: #000;
              text-align: left;
              line-height: 1.2;
            }
            .zpl-code {
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="logo-container">
              ${logoBase64 ? `<img src="${logoBase64}" alt="HEIS Global" class="logo-img" />` : '<div style="font-size: 20pt; font-weight: bold; color: #000;">HEIS GLOBAL</div>'}
            </div>
            <div class="info-container">
              <div class="nombre">${nombreEscapado}</div>
              ${empresaEscapada ? `<div class="empresa">${empresaEscapada}</div>` : ''}
              <div class="fecha">Fecha: ${fechaFormateada}</div>
            </div>
          </div>
          <div class="zpl-code">${zpl}</div>
          <script>
            window.onload = function() {
              // Intentar imprimir automáticamente
              setTimeout(function() {
                window.print();
                // Cerrar después de imprimir (con delay para dar tiempo)
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 250);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()

    // También guardar el código ZPL en el portapapeles para uso manual
    try {
      await navigator.clipboard.writeText(zpl)
      console.log('Código ZPL copiado al portapapeles')
    } catch (clipboardError) {
      console.log('No se pudo copiar al portapapeles:', clipboardError)
    }

    return true
  } catch (error) {
    console.error('Error al imprimir etiqueta:', error)
    throw error
  }
}

/**
 * Envía el código ZPL directamente a una impresora (requiere configuración adicional)
 * Esta función puede ser usada si tienes una API o servicio que maneje la impresión directa
 */
export async function sendZPLToPrinter(zpl, printerName) {
  try {
    // Para impresoras de red o USB, necesitarías usar una API del sistema
    // o un servicio intermedio. Esta es una implementación básica.
    
    // Opción 1: Usar WebUSB API (si la impresora lo soporta)
    if (navigator.usb) {
      // Implementación con WebUSB
      console.log('WebUSB disponible, pero requiere configuración específica')
    }

    // Opción 2: Enviar a una URL que maneje la impresión
    // Por ejemplo, un servicio local que reciba ZPL y lo envíe a la impresora
    const response = await fetch('/api/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ zpl, printer: printerName }),
    })

    if (!response.ok) {
      throw new Error('Error al enviar a la impresora')
    }

    return true
  } catch (error) {
    console.error('Error al enviar ZPL a impresora:', error)
    throw error
  }
}

