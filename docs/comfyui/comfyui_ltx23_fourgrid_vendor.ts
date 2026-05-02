/**
 * Toonflow ComfyUI LTX2.3 四宫格图生视频供应商模板
 *
 * 用法：
 * 1. Toonflow 设置中心 → 供应商配置 → 新增供应商。
 * 2. 粘贴本文件完整内容。
 * 3. baseUrl 填本地 ComfyUI 地址，例如 http://127.0.0.1:8188。
 * 4. videoWorkflow 粘贴 ComfyUI 的 API workflow JSON；也支持直接粘贴 UI workflow JSON。
 * 5. 在项目的视频模型里选择「ComfyUI LTX2.3 四宫格视频」。
 *
 * 当前适配的上传工作流关键节点：
 * - 88：LoadImage，输入四宫格分镜图。
 * - 158：Text Multiline，用户视频提示词。
 * - 7：CLIPTextEncode Negative Prompt，负向提示词。
 * - 165：INTConstant，视频时长，后续与 fps 相乘得到 length。
 * - 3：PrimitiveFloat，fps。
 * - 82：VHS_VideoCombine，最终 mp4 输出。
 */

exports.vendor = {
  id: "comfyui_ltx23_fourgrid",
  name: "ComfyUI LTX2.3 四宫格视频",
  author: "Toonflow Custom",
  description: "把 Toonflow 视频节点接到本地 ComfyUI LTX2.3 四宫格图生视频工作流。",
  icon: "",
  inputs: [
    {
      key: "baseUrl",
      label: "ComfyUI 地址",
      type: "url",
      required: true,
      placeholder: "http://127.0.0.1:8188",
    },
    {
      key: "videoWorkflow",
      label: "视频工作流 JSON",
      type: "text",
      required: true,
      placeholder: "粘贴 LTX2.3 四宫格图生视频工作流 JSON，API 格式或普通 UI 格式都可以",
    },
    {
      key: "imageNodeId",
      label: "四宫格输入图节点 ID",
      type: "text",
      required: true,
      placeholder: "88",
    },
    {
      key: "promptNodeId",
      label: "视频提示词节点 ID",
      type: "text",
      required: true,
      placeholder: "158",
    },
    {
      key: "negativeNodeId",
      label: "负向提示词节点 ID",
      type: "text",
      required: false,
      placeholder: "7",
    },
    {
      key: "durationNodeId",
      label: "时长节点 ID",
      type: "text",
      required: false,
      placeholder: "165",
    },
    {
      key: "fpsNodeId",
      label: "FPS 节点 ID",
      type: "text",
      required: false,
      placeholder: "3",
    },
    {
      key: "videoCombineNodeId",
      label: "视频合成输出节点 ID",
      type: "text",
      required: false,
      placeholder: "82",
    },
    {
      key: "defaultNegative",
      label: "默认负向提示词",
      type: "text",
      required: false,
      placeholder: "cartoon, modern objects, text...",
    },
    {
      key: "filenamePrefix",
      label: "ComfyUI 输出文件名前缀",
      type: "text",
      required: false,
      placeholder: "Toonflow/ltx23-fourgrid",
    },
    {
      key: "pollIntervalMs",
      label: "轮询间隔毫秒",
      type: "text",
      required: false,
      placeholder: "1500",
    },
    {
      key: "timeoutMs",
      label: "超时时间毫秒",
      type: "text",
      required: false,
      placeholder: "3600000",
    },
  ],
  inputValues: {
    baseUrl: "http://127.0.0.1:8188",
    videoWorkflow: "{}",
    imageNodeId: "88",
    promptNodeId: "158",
    negativeNodeId: "7",
    durationNodeId: "165",
    fpsNodeId: "3",
    videoCombineNodeId: "82",
    defaultNegative:
      "pc game, console game, video game, cartoon, childish, ugly, subtitles, captions, on-screen text, written text, letters, words, Chinese characters, English text, random text, garbled text, watermark, logo, title overlay, lower third text, UI text, interface text, modern objects, western face, deformed body, extra people, blurry, low quality",
    filenamePrefix: "Toonflow/ltx23-fourgrid",
    pollIntervalMs: "1500",
    timeoutMs: "3600000",
  },
  models: [
    {
      name: "ComfyUI LTX2.3 四宫格视频",
      modelName: "ltx23-fourgrid-video",
      type: "video",
      mode: [["imageReference:1"]],
      audio: false,
      durationResolutionMap: [
        {
          duration: [4, 6, 8, 10, 12, 15],
          resolution: ["480p", "720p", "1080p"],
        },
      ],
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

function parseJsonMaybe(value, name) {
  if (!value) throw new Error(`${name} 不能为空`);
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
      parts.push(
        utf8Bytes(
          `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="${field.name}"\r\n\r\n` +
            `${field.value}\r\n`,
        ),
      );
    }
  }

  parts.push(utf8Bytes(`--${boundary}--\r\n`));
  return concatUint8Arrays(parts);
}

async function uploadImage(base64) {
  const { ext, mime } = imageMime(base64);
  const bytes = base64ToUint8Array(stripBase64Prefix(base64));
  if (!bytes.length) throw new Error("四宫格参考图为空，无法上传到 ComfyUI");

  const filename = `toonflow_fourgrid_${Date.now()}.${ext}`;
  const boundary = `----toonflow-comfyui-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const body = buildMultipartBody(boundary, [
    {
      name: "image",
      filename,
      contentType: mime,
      value: bytes,
    },
    {
      name: "type",
      value: "input",
    },
    {
      name: "overwrite",
      value: "true",
    },
  ]);

  const res = await axios.post(`${cleanBaseUrl()}/upload/image`, body, {
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  if (!res.data || !res.data.name) {
    throw new Error(`ComfyUI 上传图片失败：${JSON.stringify(res.data || {})}`);
  }

  return res.data.name;
}

function toLinkMap(workflow) {
  const map = {};
  for (const link of workflow.links || []) {
    const linkId = link[0];
    map[linkId] = [String(link[1]), link[2]];
  }
  return map;
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
        if (Array.isArray(widgetValues)) {
          inputs[inputName] = widgetValues[widgetIndex];
        } else if (widgetValues && typeof widgetValues === "object" && Object.prototype.hasOwnProperty.call(widgetValues, inputName)) {
          inputs[inputName] = widgetValues[inputName];
        }
      }

      if (input.widget) widgetIndex += 1;
    }

    api[String(node.id)] = {
      class_type: node.type,
      inputs,
    };

    if (node.title) {
      api[String(node.id)]._meta = { title: node.title };
    }
  }

  return api;
}

function isUiWorkflow(workflow) {
  return workflow && Array.isArray(workflow.nodes);
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

function patchWorkflow(rawWorkflow, patch) {
  const workflow = clone(rawWorkflow);

  if (isUiWorkflow(workflow)) {
    setUiWidget(workflow, patch.imageNodeId, "image", patch.imageName);
    setUiWidget(workflow, patch.promptNodeId, "text", patch.prompt);
    setUiWidget(workflow, patch.negativeNodeId, "text", patch.negative);
    setUiWidget(workflow, patch.durationNodeId, "value", patch.duration);
    setUiWidget(workflow, patch.fpsNodeId, "value", patch.fps);
    setUiWidget(workflow, patch.videoCombineNodeId, "frame_rate", patch.fps);
    setUiWidget(workflow, patch.videoCombineNodeId, "filename_prefix", patch.filenamePrefix);
    return uiWorkflowToApi(workflow);
  }

  setApiInput(workflow, patch.imageNodeId, "image", patch.imageName);
  setApiInput(workflow, patch.promptNodeId, "text", patch.prompt);
  setApiInput(workflow, patch.negativeNodeId, "text", patch.negative);
  setApiInput(workflow, patch.durationNodeId, "value", patch.duration);
  setApiInput(workflow, patch.fpsNodeId, "value", patch.fps);
  setApiInput(workflow, patch.videoCombineNodeId, "frame_rate", patch.fps);
  setApiInput(workflow, patch.videoCombineNodeId, "filename_prefix", patch.filenamePrefix);

  return workflow;
}

async function queuePrompt(apiWorkflow) {
  const clientId = `toonflow_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const res = await axios.post(`${cleanBaseUrl()}/prompt`, {
    prompt: apiWorkflow,
    client_id: clientId,
  });

  if (!res.data || !res.data.prompt_id) {
    throw new Error(`ComfyUI 提交任务失败：${JSON.stringify(res.data || {})}`);
  }

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

      if (data.outputs && Object.keys(data.outputs).length > 0) {
        return { completed: true, data: JSON.stringify(data.outputs) };
      }

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
      if (Array.isArray(arr)) {
        for (const file of arr) files.push({ key, file });
      }
    }
  }
  return files;
}

function chooseVideoFile(outputs) {
  const files = collectOutputFiles(outputs);

  const video = files.find((item) => {
    const filename = String(item.file.filename || "").toLowerCase();
    return item.key === "videos" || item.key === "gifs" || filename.endsWith(".mp4") || filename.endsWith(".webm") || filename.endsWith(".mov");
  });

  if (video) return video.file;

  const first = files[0] && files[0].file;
  if (first) return first;

  throw new Error(`ComfyUI 历史记录里没有找到视频文件：${JSON.stringify(outputs)}`);
}

async function downloadOutputFile(file) {
  const params = new URLSearchParams({
    filename: file.filename,
    subfolder: file.subfolder || "",
    type: file.type || "output",
  });

  const res = await axios.get(`${cleanBaseUrl()}/view?${params.toString()}`, {
    responseType: "arraybuffer",
  });

  return uint8ArrayToBase64(new Uint8Array(res.data));
}

function buildPrompt(input) {
  return String(input.prompt || "").trim() || "根据四宫格图片顺序生成稳定连贯的古风短剧视频。";
}

exports.videoRequest = async function videoRequest(input, model) {
  const references = Array.isArray(input.referenceList) ? input.referenceList.filter((item) => item && item.type === "image" && item.base64) : [];

  if (!references.length) {
    throw new Error("ComfyUI LTX2.3 四宫格视频模型需要 1 张四宫格分镜参考图。请在 Toonflow 视频节点里选择分镜图作为参考图。");
  }

  const imageName = await uploadImage(references[0].base64);
  const rawWorkflow = parseJsonMaybe(getInputValue("videoWorkflow", "{}"), "videoWorkflow");

  const duration = Number(input.duration || 12);
  const fps = 24;
  const filenamePrefix = `${getInputValue("filenamePrefix", "Toonflow/ltx23-fourgrid")}/${Date.now()}`;

  const apiWorkflow = patchWorkflow(rawWorkflow, {
    imageName,
    prompt: buildPrompt(input),
    negative: getInputValue("defaultNegative", ""),
    duration,
    fps,
    filenamePrefix,
    imageNodeId: getInputValue("imageNodeId", "88"),
    promptNodeId: getInputValue("promptNodeId", "158"),
    negativeNodeId: getInputValue("negativeNodeId", "7"),
    durationNodeId: getInputValue("durationNodeId", "165"),
    fpsNodeId: getInputValue("fpsNodeId", "3"),
    videoCombineNodeId: getInputValue("videoCombineNodeId", "82"),
  });

  const promptId = await queuePrompt(apiWorkflow);
  const outputs = await waitHistory(promptId);
  const videoFile = chooseVideoFile(outputs);
  return await downloadOutputFile(videoFile);
};

exports.imageRequest = async function imageRequest() {
  throw new Error("该供应商只用于 ComfyUI LTX2.3 四宫格视频生成，不处理图片生成。图片生成请继续使用原图片模型。");
};

exports.ttsRequest = async function ttsRequest() {
  throw new Error("该供应商不处理 TTS。");
};

exports.textRequest = function textRequest() {
  throw new Error("该供应商不处理文本模型。");
};
