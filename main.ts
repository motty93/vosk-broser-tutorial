import { type KaldiRecognizer, createModel } from 'vosk-browser'

const SAMPLE_RATE = 16_000

async function init() {
  const model = await createModel('/model/model.tar.gz')
  const rec: KaldiRecognizer = new model.KaldiRecognizer(SAMPLE_RATE)

  const caption = document.querySelector<HTMLDivElement>('caption')
  if (!caption) {
    throw new Error('Caption element not found')
  }

  rec.on('result', (message) => {
    if (message.event !== 'result') return

    caption.textContent = message.result.text
  })
  rec.on('partialresult', (message) => {
    if (message.event !== 'partialresult') return

    caption.textContent = message.result.partial
  })

  const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
  await ctx.audioWorklet.addModule(new URL('./worklet/vosk-worklet.js', import.meta.url).href)

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const source = ctx.createMediaStreamSource(stream)
  const node = new AudioWorkletNode(ctx, 'vosk-worklet')

  // Worklet → recognizer へ Float32Array を転送
  node.port.onmessage = ({ data }) => rec.acceptWaveformFloat(data, SAMPLE_RATE)

  source.connect(node)
}

window.onload = init
