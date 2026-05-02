/**
 * Toonflow Gemini 3.1 Flash Image Preview 图片供应商模板
 *
 * 用法：
 * 1. Toonflow 设置中心 → 供应商配置 → 新增供应商。
 * 2. 粘贴本文件完整内容。
 * 3. apiKey 填云雾/Google Gemini Key。
 * 4. baseURL 默认使用 https://yunwu.ai。
 * 5. 在分镜图片生成模型里选择「Gemini 3.1 Flash Image Preview」。
 *
 * 当前接口：
 * POST /v1beta/models/gemini-3.1-flash-image-preview:generateContent
 */

exports.vendor = {
  id: "gemini_31_flash_image_preview",
  name: "Gemini 3.1 Flash Image Preview",
  author: "Toonflow Custom",
  description: "通过 yunwu.ai / Gemini generateContent 接口生成分镜图片，支持文本生图和参考图生图。",
  icon: "",
  inputs: [
    {
      key: "baseURL",
      label: "API 地址",
      type: "url",
      required: true,
      placeholder: "https://yunwu.ai",
    },
    {
      key: "apiKey",
      label: "API Key",
      type: "password",
      required: true,
      placeholder: "填写云雾 / Gemini API Key",
    },
    {
      key: "modelName",
      label: "模型名称",
      type: "text",
      required: true,
      placeholder: "gemini-3.1-flash-image-preview",
    },
    {
      key: "defaultNegative",
      label: "默认负向约束",
      type: "text",
      required: false,
      placeholder: "no text, no watermark, no modern objects...",
    },
  ],
  inputValues: {
    baseURL: "https://yunwu.ai",
    apiKey: "",
    modelName: "gemini-3.1-flash-image-preview",
    defaultNegative:
      "不要字幕，不要文字，不要水印，不要logo，不要现代物品，不要欧美脸，不要卡通风，不要3D渲染，不要多余人物，不要畸形肢体，不要低清模糊。",
  },
  models: [
    {
      name: "Gemini 3.1 Flash Image Preview",
      modelName: "gemini-3.1-flash-image-preview",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
  ],
};

function cleanBaseURL() {
  return String(exports.vendor.inputValues.baseURL || "https://yunwu.ai").replace(/\/$/, "");
}

function stripBase64Prefix(base64) {
  return String(base64 || "").replace(/^data:[^;]+;base64,/, "");
}

function getMimeType(base64) {
  const value = String(base64 || "");
  if (value.startsWith("data:image/png")) return "image/png";
  if (value.startsWith("data:image/webp")) return "image/webp";
  return "image/jpeg";
}

function buildPrompt(input) {
  const base = String(input.prompt || "").trim();
  const aspectRatio = input.aspectRatio ? `画幅比例：${input.aspectRatio}。` : "";
  const quality = "古风短剧分镜图，电视剧电影级写实风格，中国古代语境，真实光照，人物身份稳定，服装与场景统一，画面清晰。";
  const negative = exports.vendor.inputValues.defaultNegative ? `负向约束：${exports.vendor.inputValues.defaultNegative}` : "";

  return [quality, aspectRatio, base, negative].filter(Boolean).join("\n");
}

function collectInlineImages(data) {
  const images = [];
  const candidates = data?.candidates || [];

  for (const candidate of candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      if (part?.inlineData?.data) {
        images.push(part.inlineData.data);
      }
      if (part?.inline_data?.data) {
        images.push(part.inline_data.data);
      }
    }
  }

  return images;
}

exports.imageRequest = async function imageRequest(input, model) {
  const modelName = exports.vendor.inputValues.modelName || model.modelName || "gemini-3.1-flash-image-preview";
  const url = `${cleanBaseURL()}/v1beta/models/${modelName}:generateContent`;
  const referenceList = Array.isArray(input.referenceList) ? input.referenceList.filter((item) => item && item.type === "image" && item.base64) : [];

  const parts = [
    {
      text: buildPrompt(input),
    },
  ];

  for (const ref of referenceList.slice(0, 8)) {
    parts.push({
      inlineData: {
        mimeType: getMimeType(ref.base64),
        data: stripBase64Prefix(ref.base64),
      },
    });
  }

  const res = await axios.post(
    url,
    {
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": exports.vendor.inputValues.apiKey,
      },
      timeout: 1000 * 60 * 5,
    },
  );

  const images = collectInlineImages(res.data);
  if (!images.length) {
    throw new Error(`Gemini 图片接口没有返回图片：${JSON.stringify(res.data || {})}`);
  }

  return images[0];
};

exports.textRequest = function textRequest() {
  throw new Error("Gemini 3.1 Flash Image Preview 供应商只用于图片生成，不处理文本模型。文本请使用 llama.cpp 或其他 LLM 供应商。");
};

exports.videoRequest = async function videoRequest() {
  throw new Error("Gemini 3.1 Flash Image Preview 供应商只用于图片生成，不处理视频生成。视频请使用 ComfyUI LTX2.3 四宫格供应商。");
};

exports.ttsRequest = async function ttsRequest() {
  throw new Error("Gemini 3.1 Flash Image Preview 供应商不处理 TTS。");
};
