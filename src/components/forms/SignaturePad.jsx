import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const SignaturePad = forwardRef(function SignaturePad({ onChange }, ref) {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      const wrapper = wrapperRef.current
      if (!canvas || !wrapper) return

      const { width, height } = wrapper.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1

      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const context = canvas.getContext('2d')
      context.scale(ratio, ratio)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.lineWidth = 3
      context.strokeStyle = '#0b8894'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const getCoordinates = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return { x, y }
  }

  const startDrawing = (event) => {
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    const { x, y } = getCoordinates(event)
    context.beginPath()
    context.moveTo(x, y)
    event.target.setPointerCapture?.(event.pointerId)
    setIsDrawing(true)
  }

  const draw = (event) => {
    if (!isDrawing) return
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    const { x, y } = getCoordinates(event)
    context.lineTo(x, y)
    context.stroke()
    if (!hasSignature) {
      setHasSignature(true)
      if (onChange) {
        onChange(true)
      }
    }
  }

  const endDrawing = (event) => {
    if (!isDrawing) return
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    context.closePath()
    event.target.releasePointerCapture?.(event.pointerId)
    setIsDrawing(false)
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    if (hasSignature) {
      setHasSignature(false)
      if (onChange) {
        onChange(false)
      }
    }
  }

  useImperativeHandle(ref, () => ({
    clear,
    isEmpty: () => !hasSignature,
    getDataUrl: () => canvasRef.current?.toDataURL('image/png'),
  }))

  return (
    <div className="signature-pad" ref={wrapperRef}>
      <canvas
        ref={canvasRef}
        className="signature-pad__canvas"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={endDrawing}
        onPointerCancel={endDrawing}
        onPointerLeave={endDrawing}
      />
      <button type="button" className="signature-pad__clear" onClick={clear}>
        Limpiar firma
      </button>
    </div>
  )
})

export default SignaturePad

