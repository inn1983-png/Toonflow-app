type AssetLike = {
  id?: number;
  type?: string;
  name?: string;
  prompt?: string | null;
  describe?: string | null;
};

type StoryboardLike = {
  videoDesc?: string | null;
  prompt?: string | null;
  duration?: number | string | null;
};

function cleanText(value?: string | null) {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, max = 80) {
  const text = cleanText(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function typeName(type?: string) {
  if (type === "role") return "角色";
  if (type === "scene") return "场景";
  if (type === "tool") return "道具";
  if (type === "audio") return "音频";
  return type || "素材";
}

function removePromptNoise(value?: string | null) {
  return cleanText(value)
    .replace(/\b(8k|4k|2k|hd|uhd|high quality|masterpiece|best quality|cinematic|film|movie|realistic|photorealistic)\b/gi, "")
    .replace(/\b(negative prompt|no text|no watermark|watermark|logo|subtitles|captions)\b/gi, "")
    .replace(/[,，、；;]+/g, "，")
    .replace(/\s*，\s*/g, "，")
    .replace(/^，|，$/g, "")
    .trim();
}

function buildAssetAnchor(asset: AssetLike) {
  const visibleDescription = truncate(removePromptNoise(asset.describe || asset.prompt || ""), 80);
  const name = cleanText(asset.name) || `${typeName(asset.type)}${asset.id ?? ""}`;

  if (asset.type === "role") {
    return visibleDescription
      ? `- ${name}：${visibleDescription}。`
      : `- ${name}：按四宫格中可见的服装、位置、道具和气质识别，保持身份一致。`;
  }

  if (asset.type === "scene") {
    return visibleDescription ? `- 场景-${name}：${visibleDescription}。` : `- 场景-${name}：保持四宫格中的空间、光源和时代背景一致。`;
  }

  if (asset.type === "tool") {
    return visibleDescription ? `- 道具-${name}：${visibleDescription}。` : `- 道具-${name}：保持四宫格中的关键道具位置和形态一致。`;
  }

  return visibleDescription ? `- ${typeName(asset.type)}-${name}：${visibleDescription}。` : "";
}

function uniqueAssets(assets: AssetLike[]) {
  const map = new Map<string, AssetLike>();
  for (const asset of assets) {
    const key = asset.id != null ? `id:${asset.id}` : `${asset.type}:${asset.name}`;
    if (!map.has(key)) map.set(key, asset);
  }
  return [...map.values()];
}

function limitAnchors(items: string[], max: number) {
  return items.slice(0, max);
}

export function isLtx23FourGridModel(model?: string) {
  const value = String(model || "").toLowerCase();
  return value.includes("comfyui_ltx23_fourgrid") || value.includes("ltx23-fourgrid-video") || (value.includes("ltx2.3") && value.includes("fourgrid"));
}

export function buildLtx23FourGridPrompt(params: {
  assets: AssetLike[];
  storyboard: StoryboardLike[];
  duration?: number | string | null;
}) {
  const storyboard = params.storyboard || [];
  const assets = uniqueAssets(params.assets || []);
  const duration = Number(params.duration || storyboard[0]?.duration || 12) || 12;

  const roleAnchors = limitAnchors(assets.filter((item) => item.type === "role").map(buildAssetAnchor).filter(Boolean), 4);
  const sceneAnchors = limitAnchors(assets.filter((item) => item.type === "scene").map(buildAssetAnchor).filter(Boolean), 2);
  const toolAnchors = limitAnchors(assets.filter((item) => item.type === "tool").map(buildAssetAnchor).filter(Boolean), 3);

  const storyIntent = truncate(
    storyboard
      .map((item, index) => {
        const desc = cleanText(item.videoDesc || item.prompt || "");
        if (!desc) return "";
        return storyboard.length > 1 ? `${index + 1}. ${desc}` : desc;
      })
      .filter(Boolean)
      .join("；"),
    280,
  );

  const anchorLines = [...roleAnchors, ...sceneAnchors, ...toolAnchors];

  return [
    `古风短剧，写实电影感。根据四宫格图片顺序生成 ${duration} 秒剧情视频。`,
    anchorLines.length ? `识别锚点：\n${anchorLines.join("\n")}` : "识别锚点：请根据四宫格中可见的服装、位置、道具和气质区分不同人物，保持谁是谁不变。",
    `剧情重点：${storyIntent || "严格跟随四宫格画面内容，让人物完成一段克制、连贯的剧情动作。"}`,
    "连续性：人物身份、外貌、服装、场景、道具、光源保持一致。",
    "动作：只做小幅度动作，以眼神、转头、手部、衣袖轻动为主，不要大幅打斗或夸张表演。",
    "镜头：稳定镜头，轻微推进，真实电视剧质感，不要乱切、乱转、乱变焦。",
    "禁止：字幕、文字、水印、现代物品、换脸、换衣服、换场景、额外人物。",
  ].join("\n");
}
