import { useMemo, useRef, useState } from 'react'
import { createVisit, getTodayDateString } from '../../services/supabaseClient'
import SignaturePad from './SignaturePad'
import { printLabel } from '../../services/labelPrinter'

const initialValues = {
  nombreempresa: '',
  nombrepersona: '',
  proposito: '',
  normasvisitas: false,
  accesozonaproduccion: false,
}

function VisitEntryForm({ onSuccess }) {
  const [formValues, setFormValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const signaturePadRef = useRef(null)
  const [hasSignature, setHasSignature] = useState(false)

  const isValid = useMemo(() => {
    return formValues.nombrepersona.trim() && formValues.normasvisitas && hasSignature
  }, [formValues.nombrepersona, formValues.normasvisitas, hasSignature])

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === 'checkbox' ? event.target.checked : event.target.value

    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formValues.nombrepersona.trim()) {
      newErrors.nombrepersona = 'Introduzca el nombre y apellidos de la visita'
    }

    if (!formValues.normasvisitas) {
      newErrors.normasvisitas =
        'Debe confirmar que ha leído y aceptado las normas de visita'
    }

    if (!hasSignature) {
      newErrors.firma = 'Necesitamos la firma de la visita'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormValues(initialValues)
    setErrors({})
    setSubmitError(null)
    setHasSignature(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        nombreempresa: formValues.nombreempresa || null,
        nombrepersona: formValues.nombrepersona.trim(),
        proposito: formValues.proposito || null,
        normasvisitas: formValues.normasvisitas,
        accesozonaproduccion: formValues.accesozonaproduccion,
      }
      const signaturePad = signaturePadRef.current
      if (!signaturePad || signaturePad.isEmpty()) {
        setErrors((prev) => ({
          ...prev,
          firma: 'Necesitamos la firma de la visita',
        }))
        setIsSubmitting(false)
        return
      }

      const signatureDataUrl = signaturePad.getDataUrl()

      const visitResult = await createVisit({
        ...payload,
        firma: signatureDataUrl,
        salida: false,
        fechasalida: null,
        horasalida: null,
      })

      // Obtener la fecha de entrada de la respuesta o usar la fecha actual
      const fechavisita = Array.isArray(visitResult) && visitResult[0]?.fechavisita
        ? visitResult[0].fechavisita
        : Array.isArray(visitResult) && visitResult[0]?.created_at
        ? visitResult[0].created_at.split('T')[0]
        : !Array.isArray(visitResult) && visitResult?.fechavisita
        ? visitResult.fechavisita
        : !Array.isArray(visitResult) && visitResult?.created_at
        ? visitResult.created_at.split('T')[0]
        : getTodayDateString()

      // Imprimir la etiqueta
      try {
        await printLabel({
          nombrepersona: formValues.nombrepersona.trim(),
          nombreempresa: formValues.nombreempresa || null,
          fechavisita,
        })
      } catch (printError) {
        console.error('Error al imprimir etiqueta:', printError)
        // No bloqueamos el flujo si falla la impresión
      }

      setSubmitSuccess(true)
      resetForm()
      signaturePad.clear()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      setSubmitError(`No se ha podido registrar la visita. ${message}`)
      console.error('Error al registrar visita:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="nombrepersona">
            Nombre y apellidos de la visita
          </label>
          <input
            id="nombrepersona"
            name="nombrepersona"
            type="text"
            className="text-input"
            placeholder="Ej. Ana Gómez López"
            value={formValues.nombrepersona}
            onChange={handleChange('nombrepersona')}
            required
            autoComplete="off"
          />
          {errors.nombrepersona ? (
            <p className="form-error">{errors.nombrepersona}</p>
          ) : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="nombreempresa">
            Empresa (opcional)
          </label>
          <input
            id="nombreempresa"
            name="nombreempresa"
            type="text"
            className="text-input"
            placeholder="Nombre de la empresa"
            value={formValues.nombreempresa}
            onChange={handleChange('nombreempresa')}
            autoComplete="off"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="proposito">
            Propósito de la visita
          </label>
          <textarea
            id="proposito"
            name="proposito"
            className="text-area"
            placeholder="Ej. Reunión comercial, auditoría, entrevista"
            value={formValues.proposito}
            onChange={handleChange('proposito')}
            rows={3}
          />
        </div>

        <div className="form-field form-field--wide">
          <p className="form-label">Firma (dibujar con el dedo)</p>
          <SignaturePad
            ref={signaturePadRef}
            onChange={(value) => {
              setHasSignature(value)
              if (value) {
                setErrors((prev) => ({ ...prev, firma: undefined }))
              }
            }}
          />
          {errors.firma ? <p className="form-error">{errors.firma}</p> : null}
          <p className="form-helper">La firma se guarda de forma segura junto al registro.</p>
        </div>
      </div>

      <div className="form-divider" aria-hidden="true" />

      <fieldset className="form-toggle-group">
        <legend className="form-toggle-group__legend">
          Confirmaciones de seguridad
        </legend>
        <label className="toggle">
          <input
            className="toggle__input"
            type="checkbox"
            checked={formValues.normasvisitas}
            onChange={handleChange('normasvisitas')}
          />
          <span className="toggle__visual" aria-hidden="true" />
          <span className="toggle__label">
            He leído y acepto las normas de visita
          </span>
        </label>
        {errors.normasvisitas ? (
          <p className="form-error">{errors.normasvisitas}</p>
        ) : null}

        <label className="toggle">
          <input
            className="toggle__input"
            type="checkbox"
            checked={formValues.accesozonaproduccion}
            onChange={handleChange('accesozonaproduccion')}
          />
          <span className="toggle__visual" aria-hidden="true" />
          <span className="toggle__label">
            Necesita acceder a zona de producción
          </span>
        </label>
      </fieldset>

      {submitError ? <p className="form-alert form-alert--error">{submitError}</p> : null}
      {submitSuccess ? (
        <p className="form-alert form-alert--success">
          La visita se ha registrado correctamente.
        </p>
      ) : null}

      <div className="form-actions">
        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? 'Registrando…' : 'Registrar entrada'}
        </button>
      </div>
    </form>
  )
}

export default VisitEntryForm

