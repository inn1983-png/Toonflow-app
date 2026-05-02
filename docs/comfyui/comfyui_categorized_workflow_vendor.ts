/**
 * Toonflow ComfyUI 分类工作流供应商模板
 *
 * 目标：
 * - 一个 ComfyUI 供应商里按分类配置不同 workflow。
 * - 支持角色图、场景图、道具图、通用分镜图、LTX2.3 四宫格视频。
 * - 适合本地 ComfyUI + Toonflow 全流程生产。
 *
 * 使用方式：
 * 1. Toonflow 设置中心 → 供应商配置 → 新增供应商。
 * 2. 粘贴本文件完整内容。
 * 3. baseUrl 填本地 ComfyUI 地址，例如 http://127.0.0.1:8188。
 * 4. 分别粘贴 roleWorkflow / sceneWorkflow / toolWorkflow / storyboardWorkflow / videoWorkflow。
 * 5. 每个 workflow 建议使用 ComfyUI 的 API Format；普通 UI workflow 也会尝试转换。
 *
 * 默认约定：
 * - 图片类 workflow：promptNodeId 默认 6，negativeNodeId 默认 7，save/output 节点自动从 history 找第一张图片。
 * - 视频 workflow：imageNodeId 默认 88，promptNodeId 默认 158，negativeNodeId 默认 7，durationNodeId 默认 165，fpsNodeId 默认 3，videoCombineNodeId 默认 82。
 */

exports.vendor = {
  id: "comfyui_categorized",
  name: "ComfyUI 分类工作流",
  author: "Toonflow Custom",
  description: "按角色、场景、道具、分镜、视频分类调用不同 ComfyUI 工作流。",
  icon: "",
  inputs: [
    { key: "baseUrl", label: "ComfyUI 地址", type: "url", required: true, placeholder: "http://127.0.0.1:8188" },

    { key: "roleWorkflow", label: "角色图 workflow JSON", type: "text", required: false, placeholder: "角色图 API workflow JSON" },
    { key: "sceneWorkflow", label: "场景图 workflow JSON", type: "text", required: false, placeholder: "场景图 API workflow JSON" },
    { key: "toolWorkflow", label: "道具图 workflow JSON", type: "text", required: false, placeholder: "道具图 API workflow JSON" },
    { key: "storyboardWorkflow", label: "分镜图 workflow JSON", type: "text", required: false, placeholder: "分镜图/四宫格图 API workflow JSON" },
    { key: "videoWorkflow", label: "视频 workflow JSON", type: "text", required: false, placeholder: "LTX2.3 四宫格视频 workflow JSON" },

    { key: "imagePromptNodeId", label: "图片正向提示词节点 ID", type: "text", required: false, placeholder: "6" },
    { key: "imageNegativeNodeId", label: "图片负向提示词节点 ID", type: "text", required: false, placeholder: "7" },
    { key: "imageLoadNodeIds", label: "图片参考图 LoadImage 节点 ID，逗号分隔", type: "text", required: false, placeholder: "21,22,23,24" },

    { key: "videoImageNodeId", label: "视频四宫格输入图节点 ID", type: "text", required: false, placeholder: "88" },
    { key: "videoPromptNodeId", label: "视频提示词节点 ID", type: "text", required: false, placeholder: "158" },
    { key: "videoNegativeNodeId", label: "视频负向提示词节点 ID", type: "text", required: false, placeholder: "7" },
    { key: "videoDurationNodeId", label: "视频时长节点 ID", type: "text", required: false, placeholder: "165" },
    { key: "videoFpsNodeId", label: "视频 FPS 节点 ID", type: "text", required: false, placeholder: "3" },
    { key: "videoCombineNodeId", label: "视频输出合成节点 ID", type: "text", required: false, placeholder: "82" },

    { key: "defaultImageNegative", label: "默认图片负向提示词", type: "text", required: false, placeholder: "no text, no watermark..." },
    { key: "defaultVideoNegative", label: "默认视频负向提示词", type: "text", required: false, placeholder: "no subtitles, no morphing..." },
    { key: "filenamePrefix", label: "ComfyUI 输出文件名前缀", type: "text", required: false, placeholder: "Toonflow/comfyui" },
    { key: "pollIntervalMs", label: "轮询间隔毫秒", type: "text", required: false, placeholder: "1500" },
    { key: "timeoutMs", label: "超时时间毫秒", type: "text", required: false, placeholder: "3600000" },
  ],
  inputValues: {
    baseUrl: "http://127.0.0.1:8188",
    roleWorkflow: "{}",
    sceneWorkflow: "{}",
    toolWorkflow: "{}",
    storyboardWorkflow: "{}",
    videoWorkflow: "{}",
    imagePromptNodeId: "6",
    imageNegativeNodeId: "7",
    imageLoadNodeIds: "",
    videoImageNodeId: "88",
    videoPromptNodeId: "158",
    videoNegativeNodeId: "7",
    videoDurationNodeId: "165",
    videoFpsNodeId: "3",
    videoCombineNodeId: "82",
    defaultImageNegative:
      "不要字幕，不要文字，不要水印，不要logo，不要现代物品，不要欧美脸，不要卡通风，不要3D渲染，不要多余人物，不要畸形肢体，不要低清模糊。",
    defaultVideoNegative:
      "pc game, console game, video game, cartoon, childish, subtitles, captions, written text, watermark, logo, modern objects, western face, extra people, identity change, face change, clothing change, scene change, melting, morphing, blurry, low quality",
    filenamePrefix: "Toonflow/comfyui",
    pollIntervalMs: "1500",
    timeoutMs: "3600000",
  },
  models: [
    { name: "ComfyUI 角色图工作流", modelName: "comfyui-role-image", type: "image", mode: ["text", "singleImage", "multiReference"] },
    { name: "ComfyUI 场景图工作流", modelName: "comfyui-scene-image", type: "image", mode: ["text", "singleImage", "multiReference"] },
    { name: "ComfyUI 道具图工作流", modelName: "comfyui-tool-image", type: "image", mode: ["text", "singleImage", "multiReference"] },
    { name: "ComfyUI 分镜图工作流", modelName: "comfyui-storyboard-image", type: "image", mode: ["text", "singleImage", "multiReference"] },
    {
      name: "ComfyUI LTX2.3 四宫格视频",
      modelName: "comfyui-ltx23-fourgrid-video",
      type: "video",
      mode: [["imageReference:1"]],
      audio: false,
      durationResolutionMap: [{ duration: [4, 6, 8, 10, 12, 15], resolution: ["480p", "720p", "1080p"] }],
    },
  ],
};

function getInputValue(key, fallback) {
  const values = exports.vendor.inputValues || {};
  const value = values[key];
  return value === undefined || value === null || value === "" ? fallback : value;
}

function cleanBaseUrl() {
  return String(getInputValue("baseUrl", "http://127.0.0.1:8188")).replace(/\/$/, "");
}

function parseNodeIds(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseWorkflow(value, name) {
  if (!value || value === "{}") throw new Error(`${name} 未配置 workflow JSON`);
  if (typeof value === "object") return JSON.parse(JSON.stringify(value));
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${name} 不是合法 JSON：${error && error.message ? error.message : String(error)}`);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function stripBase64Prefix(base64) {
  return String(base64 || "").replace(/^data:[^;]+;base64,/, "");
}

function imageMime(base64) {
  const s = String(base64 || "");
  if (s.startsWith("data:image/png")) return { ext: "png", mime: "image/png" };
  if (s.startsWith("data:image/webp")) return { ext: "webp", mime: "image/webp" };
  return { ext: "jpg", mime: "image/jpeg" };
}

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64ToUint8Array(base64) {
  const clean = String(base64 || "").replace(/\s/g, "").replace(/=+$/, "");
  const output = [];
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < clean.length; i++) {
    const value = BASE64_CHARS.indexOf(clean[i]);
    if (value < 0) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output.push((buffer >> bits) & 0xff);
    }
  }

  return new Uint8Array(output);
}

function uint8ArrayToBase64(bytes) {
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triple = (a << 16) | (b << 8) | c;
    result += BASE64_CHARS[(triple >> 18) & 63];
    result += BASE64_CHARS[(triple >> 12) & 63];
    result += i + 1 < bytes.length ? BASE64_CHARS[(triple >> 6) & 63] : "=";
    result += i + 2 < bytes.length ? BASE64_CHARS[triple & 63] : "=";
  }
  return result;
}

function utf8Bytes(text) {
  return new TextEncoder().encode(String(text));
}

function concatUint8Arrays(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function buildMultipartBody(boundary, fields) {
  const parts = [];
  for (const field of fields) {
    if (field.filename) {
      parts.push(
        utf8Bytes(
          `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="${field.name}"; filename="${field.filename}"\r\n` +
            `Content-Type: ${field.contentType || "application/octet-stream"}\r\n\r\n`,
        ),
      );
      parts.push(field.value);
      parts.push(utf8Bytes("\r\n"));
    } else {
      parts.push(utf8Bytes(`--${boundary}\r\nContent-Disposition: form-data; name="${field.name}"\r\n\r\n${field.value}\r\n`));
    }
  }
  parts.push(utf8Bytes(`--${boundary}--\r\n`));
  return concatUint8Arrays(parts);
}

async function uploadImage(base64, prefix) {
  const { ext, mime } = imageMime(base64);
  const bytes = base64ToUint8Array(stripBase64Prefix(base64));
  if (!bytes.length) throw new Error("参考图为空，无法上传到 ComfyUI");

  const filename = `${prefix || "toonflow_ref"}_${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
  const boundary = `----toonflow-comfyui-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const body = buildMultipartBody(boundary, [
    { name: "image", filename, contentType: mime, value: bytes },
    { name: "type", value: "input" },
    { name: "overwrite", value: "true" },
  ]);

  const res = await axios.post(`${cleanBaseUrl()}/upload/image`, body, {
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  if (!res.data || !res.data.name) throw new Error(`ComfyUI 上传图片失败：${JSON.stringify(res.data || {})}`);
  return res.data.name;
}

function toLinkMap(workflow) {
  const map = {};
  for (const link of workflow.links || []) map[link[0]] = [String(link[1]), link[2]];
  return map;
}

function isUiWorkflow(workflow) {
  return workflow && Array.isArray(workflow.nodes);
}

function uiWorkflowToApi(uiWorkflow) {
  const linkMap = toLinkMap(uiWorkflow);
  const api = {};

  for (const node of uiWorkflow.nodes || []) {
    const inputs = {};
    const widgetValues = node.widgets_values;
    let widgetIndex = 0;

    for (const input of node.inputs || []) {
      const inputName = input.name;
      if (!inputName) continue;
      if (input.link !== undefined && input.link !== null && linkMap[input.link]) {
        inputs[inputName] = linkMap[input.link];
      } else if (input.widget) {
        if (Array.isArray(widgetValues)) inputs[inputName] = widgetValues[widgetIndex];
        else if (widgetValues && typeof widgetValues === "object" && Object.prototype.hasOwnProperty.call(widgetValues, inputName)) inputs[inputName] = widgetValues[inputName];
      }
      if (input.widget) widgetIndex += 1;
    }

    api[String(node.id)] = { class_type: node.type, inputs };
    if (node.title) api[String(node.id)]._meta = { title: node.title };
  }

  return api;
}

function getUiNode(workflow, nodeId) {
  const id = String(nodeId);
  return (workflow.nodes || []).find((node) => String(node.id) === id);
}

function setUiWidget(workflow, nodeId, inputName, value) {
  const node = getUiNode(workflow, nodeId);
  if (!node) return;
  const widgets = node.widgets_values;
  const inputs = node.inputs || [];
  let widgetIndex = 0;

  for (const input of inputs) {
    if (input.widget) {
      if (input.name === inputName) {
        if (Array.isArray(widgets)) widgets[widgetIndex] = value;
        else if (widgets && typeof widgets === "object") widgets[inputName] = value;
        else node.widgets_values = [value];
        return;
      }
      widgetIndex += 1;
    }
  }
  if (Array.isArray(node.widgets_values)) node.widgets_values[0] = value;
}

function setApiInput(workflow, nodeId, inputName, value) {
  const node = workflow[String(nodeId)];
  if (!node) return;
  node.inputs = node.inputs || {};
  node.inputs[inputName] = value;
}

function patchText(workflow, nodeId, value) {
  if (!nodeId) return;
  if (isUiWorkflow(workflow)) setUiWidget(workflow, nodeId, "text", value);
  else setApiInput(workflow, nodeId, "text", value);
}

function patchImage(workflow, nodeId, filename) {
  if (!nodeId) return;
  if (isUiWorkflow(workflow)) setUiWidget(workflow, nodeId, "image", filename);
  else setApiInput(workflow, nodeId, "image", filename);
}

function patchNumber(workflow, nodeId, value) {
  if (!nodeId) return;
  if (isUiWorkflow(workflow)) setUiWidget(workflow, nodeId, "value", value);
  else setApiInput(workflow, nodeId, "value", value);
}

function workflowToApi(workflow) {
  return isUiWorkflow(workflow) ? uiWorkflowToApi(workflow) : workflow;
}

async function queuePrompt(apiWorkflow) {
  const clientId = `toonflow_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const res = await axios.post(`${cleanBaseUrl()}/prompt`, { prompt: apiWorkflow, client_id: clientId });
  if (!res.data || !res.data.prompt_id) throw new Error(`ComfyUI 提交任务失败：${JSON.stringify(res.data || {})}`);
  return res.data.prompt_id;
}

async function waitHistory(promptId) {
  const interval = Number(getInputValue("pollIntervalMs", "1500")) || 1500;
  const timeout = Number(getInputValue("timeoutMs", "3600000")) || 3600000;
  const result = await pollTask(
    async () => {
      const res = await axios.get(`${cleanBaseUrl()}/history/${promptId}`);
      const data = res.data && res.data[promptId];
      if (!data) return { completed: false };
      if (data.status && (data.status.status_str === "error" || (data.status.completed === false && data.status.messages))) {
        const message = JSON.stringify(data.status);
        if (message.includes("error")) return { completed: false, error: message };
      }
      if (data.outputs && Object.keys(data.outputs).length > 0) return { completed: true, data: JSON.stringify(data.outputs) };
      return { completed: false };
    },
    interval,
    timeout,
  );
  if (result.error) throw new Error(`ComfyUI 生成失败：${result.error}`);
  if (!result.completed) throw new Error("ComfyUI 生成超时");
  return JSON.parse(result.data);
}

function collectOutputFiles(outputs) {
  const files = [];
  for (const nodeId of Object.keys(outputs || {})) {
    const output = outputs[nodeId] || {};
    for (const key of ["videos", "gifs", "images"]) {
      const arr = output[key];
      if (Array.isArray(arr)) for (const file of arr) files.push({ key, file });
    }
  }
  return files;
}

function chooseOutputFile(outputs, preferVideo) {
  const files = collectOutputFiles(outputs);
  const chosen = files.find((item) => {
    const filename = String(item.file.filename || "").toLowerCase();
    if (preferVideo) return item.key === "videos" || item.key === "gifs" || filename.endsWith(".mp4") || filename.endsWith(".webm") || filename.endsWith(".mov");
    return item.key === "images" || filename.endsWith(".png") || filename.endsWith(".jpg") || filename.endsWith(".jpeg") || filename.endsWith(".webp");
  });
  if (chosen) return chosen.file;
  if (files[0]) return files[0].file;
  throw new Error(`ComfyUI 历史记录里没有找到输出文件：${JSON.stringify(outputs)}`);
}

async function downloadOutputFile(file) {
  const params = new URLSearchParams({ filename: file.filename, subfolder: file.subfolder || "", type: file.type || "output" });
  const res = await axios.get(`${cleanBaseUrl()}/view?${params.toString()}`, { responseType: "arraybuffer" });
  return uint8ArrayToBase64(new Uint8Array(res.data));
}

function workflowKeyForModel(modelName) {
  if (modelName === "comfyui-role-image") return "roleWorkflow";
  if (modelName === "comfyui-scene-image") return "sceneWorkflow";
  if (modelName === "comfyui-tool-image") return "toolWorkflow";
  if (modelName === "comfyui-storyboard-image") return "storyboardWorkflow";
  if (modelName === "comfyui-ltx23-fourgrid-video") return "videoWorkflow";
  return "storyboardWorkflow";
}

function buildImagePrompt(input, modelName) {
  const base = String(input.prompt || "").trim();
  const aspect = input.aspectRatio ? `画幅比例：${input.aspectRatio}。` : "";

  if (modelName === "comfyui-role-image") {
    return ["角色资产图。单人优先，正面清晰，身份稳定，服装完整，背景简洁，真人写实古风电视剧质感。", aspect, base].filter(Boolean).join("\n");
  }
  if (modelName === "comfyui-scene-image") {
    return ["场景资产图。不要人物，突出空间结构、时代背景、光源方向和可复用场景细节，古风写实电视剧质感。", aspect, base].filter(Boolean).join("\n");
  }
  if (modelName === "comfyui-tool-image") {
    return ["道具资产图。单一道具优先，形态清晰，材质真实，背景简洁，适合后续分镜融合。", aspect, base].filter(Boolean).join("\n");
  }
  return ["分镜图。严格依据剧情生成可用于四宫格视频的连续关键帧画面，古风写实电视剧质感，人物身份稳定。", aspect, base].filter(Boolean).join("\n");
}

exports.imageRequest = async function imageRequest(input, model) {
  const modelName = model.modelName;
  const workflowKey = workflowKeyForModel(modelName);
  const workflow = parseWorkflow(getInputValue(workflowKey, "{}"), workflowKey);
  const working = clone(workflow);
  const prompt = buildImagePrompt(input, modelName);
  const negative = getInputValue("defaultImageNegative", "");

  patchText(working, getInputValue("imagePromptNodeId", "6"), prompt);
  patchText(working, getInputValue("imageNegativeNodeId", "7"), negative);

  const loadNodeIds = parseNodeIds(getInputValue("imageLoadNodeIds", ""));
  const references = Array.isArray(input.referenceList) ? input.referenceList.filter((item) => item && item.type === "image" && item.base64) : [];
  for (let i = 0; i < references.length && i < loadNodeIds.length; i++) {
    const name = await uploadImage(references[i].base64, `toonflow_${modelName}_ref`);
    patchImage(working, loadNodeIds[i], name);
  }

  const promptId = await queuePrompt(workflowToApi(working));
  const outputs = await waitHistory(promptId);
  const file = chooseOutputFile(outputs, false);
  return await downloadOutputFile(file);
};

exports.videoRequest = async function videoRequest(input, model) {
  const workflow = parseWorkflow(getInputValue("videoWorkflow", "{}"), "videoWorkflow");
  const working = clone(workflow);
  const references = Array.isArray(input.referenceList) ? input.referenceList.filter((item) => item && item.type === "image" && item.base64) : [];
  if (!references.length) throw new Error("ComfyUI LTX2.3 四宫格视频需要 1 张四宫格分镜图。请只传最终四宫格图，不要传角色/场景/道具参考图。");

  const imageName = await uploadImage(references[0].base64, "toonflow_fourgrid");
  const prompt = String(input.prompt || "").trim() || "根据四宫格图片顺序生成稳定连贯的古风短剧视频。";
  const negative = getInputValue("defaultVideoNegative", "");
  const duration = Number(input.duration || 12) || 12;
  const fps = 24;

  patchImage(working, getInputValue("videoImageNodeId", "88"), imageName);
  patchText(working, getInputValue("videoPromptNodeId", "158"), prompt);
  patchText(working, getInputValue("videoNegativeNodeId", "7"), negative);
  patchNumber(working, getInputValue("videoDurationNodeId", "165"), duration);
  patchNumber(working, getInputValue("videoFpsNodeId", "3"), fps);

  if (isUiWorkflow(working)) {
    setUiWidget(working, getInputValue("videoCombineNodeId", "82"), "frame_rate", fps);
    setUiWidget(working, getInputValue("videoCombineNodeId", "82"), "filename_prefix", `${getInputValue("filenamePrefix", "Toonflow/comfyui")}/video/${Date.now()}`);
  } else {
    setApiInput(working, getInputValue("videoCombineNodeId", "82"), "frame_rate", fps);
    setApiInput(working, getInputValue("videoCombineNodeId", "82"), "filename_prefix", `${getInputValue("filenamePrefix", "Toonflow/comfyui")}/video/${Date.now()}`);
  }

  const promptId = await queuePrompt(workflowToApi(working));
  const outputs = await waitHistory(promptId);
  const file = chooseOutputFile(outputs, true);
  return await downloadOutputFile(file);
};

exports.textRequest = function textRequest() {
  throw new Error("ComfyUI 分类工作流供应商不处理文本模型。文本请使用 llama.cpp 本地 LLM 供应商。");
};

exports.ttsRequest = async function ttsRequest() {
  throw new Error("ComfyUI 分类工作流供应商不处理 TTS。");
};
