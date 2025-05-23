import { type KaldiRecognizer, createModel } from 'vosk-browser'

const SAMPLE_RATE = 16_000

async function init() {
  console.log('初期化開始')

  try {
    console.log('モデル読み込み中...')
    // CDN経由でモデルを読み込み
    const model = await createModel('https://alphacephei.com/vosk/models/vosk-model-small-ja-0.22.tar.gz')
    console.log('モデル読み込み完了')

    const rec: KaldiRecognizer = new model.KaldiRecognizer(SAMPLE_RATE)
    console.log('認識器作成完了')

    const caption = document.querySelector<HTMLDivElement>('#caption')
    if (!caption) {
      throw new Error('Caption element not found')
    }

    rec.on('result', (message) => {
      console.log('Result:', message)
      if (message.event !== 'result') return
      caption.textContent = message.result.text
    })

    rec.on('partialresult', (message) => {
      console.log('Partial result:', message)
      if (message.event !== 'partialresult') return
      caption.textContent = message.result.partial
    })

    console.log('マイクアクセス要求中...')
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate: SAMPLE_RATE,
      },
    })
    console.log('マイクアクセス許可取得')

    const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })
    console.log('AudioContext作成完了')

    // AudioWorkletではなくScriptProcessorを使用（互換性重視）
    const recognizerNode = audioContext.createScriptProcessor(4096, 1, 1)
    recognizerNode.onaudioprocess = (event) => {
      try {
        rec.acceptWaveform(event.inputBuffer)
      } catch (error) {
        console.error('acceptWaveform failed:', error)
      }
    }

    const source = audioContext.createMediaStreamSource(mediaStream)
    source.connect(recognizerNode)
    recognizerNode.connect(audioContext.destination)

    console.log('音声認識開始')
    caption.textContent = 'マイクに向かって話してください...'
  } catch (error) {
    console.error('初期化エラー:', error)
    const caption = document.querySelector<HTMLDivElement>('#caption')
    if (caption) {
      caption.textContent = `エラー: ${error}`
    }
  }
}

window.onload = init
