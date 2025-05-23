export async function onRequest() {
  const modelUrl = 'https://alphacephei.com/vosk/models/vosk-model-small-ja-0.22.tar.gz'

  try {
    const response = await fetch(modelUrl)

    if (!response.ok) {
      return new Response('Failed to fetch model', { status: 404 })
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'application/gzip',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    return new Response('Error fetching model', { status: 500 })
  }
}
