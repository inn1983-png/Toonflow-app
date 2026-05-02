/**
 * Toonflow 本地 llama.cpp LLM 供应商模板
 *
 * 用法：
 * 1. 启动 llama.cpp 的 OpenAI-compatible 服务：
 *    llama-server -m ./models/your-model.gguf --host 127.0.0.1 --port 8080 --ctx-size 8192
 * 2. Toonflow 设置中心 → 供应商配置 → 新增供应商。
 * 3. 粘贴本文件完整内容。
 * 4. baseURL 填 http://127.0.0.1:8080/v1。
 * 5. modelName 多数情况下填 local-model；如果 llama.cpp 服务返回其他模型名，就填对应名称。
 */

exports.vendor = {
  id: "llamacpp_local",
  name: "本地 llama.cpp",
  author: "Toonflow Custom",
  description: "通过 llama.cpp llama-server 的 OpenAI-compatible API 调用本地 GGUF 大语言模型。",
  icon: "",
  inputs: [
    {
      key: "baseURL",
      label: "llama.cpp API 地址",
      type: "url",
      required: true,
      placeholder: "http://127.0.0.1:8080/v1",
    },
    {
      key: "apiKey",
      label: "API Key，可留空",
      type: "password",
      required: false,
      placeholder: "llama.cpp 默认不需要，留空即可",
    },
    {
      key: "modelName",
      label: "模型名称",
      type: "text",
      required: true,
      placeholder: "local-model",
    },
  ],
  inputValues: {
    baseURL: "http://127.0.0.1:8080/v1",
    apiKey: "not-needed",
    modelName: "local-model",
  },
  models: [
    {
      name: "llama.cpp 本地文本模型",
      modelName: "local-model",
      type: "text",
      think: false,
    },
  ],
};

exports.textRequest = function textRequest(model, think, thinkLevel) {
  const provider = createOpenAICompatible({
    name: "llamacpp",
    baseURL: exports.vendor.inputValues.baseURL,
    apiKey: exports.vendor.inputValues.apiKey || "not-needed",
  });

  return provider(exports.vendor.inputValues.modelName || model.modelName || "local-model");
};

exports.imageRequest = async function imageRequest() {
  throw new Error("llama.cpp 本地供应商只处理文本模型，不处理图像生成。请使用图片模型供应商。");
};

exports.videoRequest = async function videoRequest() {
  throw new Error("llama.cpp 本地供应商只处理文本模型，不处理视频生成。请使用 ComfyUI 视频供应商。");
};

exports.ttsRequest = async function ttsRequest() {
  throw new Error("llama.cpp 本地供应商不处理 TTS。");
};
