export async function generateImage(prompt, model, styleTags = []) {
  const cleanPrompt = prompt.replace(/['"]/g, "").trim();
  const styleStr = styleTags.length > 0 ? styleTags.join(", ") + ", " : "";

  const response = await fetch("https://api.together.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "black-forest-labs/FLUX.1-schnell",
      prompt: `${styleStr}${cleanPrompt}, textless, mute`,
      negative_prompt: "text, title, label, letter, word, number, writing, font, typography, watermark, signature, logo, caption, subtitle, inscription, banner, stamp, badge, name, heading, credit",
      width: 512,
      height: 512,
      response_format: "b64_json",
      n: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Together.ai error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].b64_json;
}
