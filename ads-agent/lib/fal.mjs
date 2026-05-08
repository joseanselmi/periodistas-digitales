const FAL_KEY = process.env.FAL_API_KEY

export async function generateImage(prompt, { size = 'square_hd', steps = 28 } = {}) {
  const res = await fetch('https://fal.run/fal-ai/flux-pro', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, image_size: size, num_inference_steps: steps, num_images: 1 }),
  })

  const data = await res.json()
  if (!data.images?.[0]?.url) throw new Error(`Fal error: ${JSON.stringify(data)}`)
  return data.images[0].url
}

export async function downloadImage(url) {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer)
}
