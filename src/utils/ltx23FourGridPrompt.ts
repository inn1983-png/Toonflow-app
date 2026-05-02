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

function truncate(value: string, max = 120) {
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

function buildAssetAnchor(asset: AssetLike) {
  const visibleDescription = truncate(asset.prompt || asset.describe || "", 100);
  const name = cleanText(asset.name) || `${typeName(asset.type)}${asset.id ?? ""}`;

  if (asset.type === "role") {
    return visibleDescription
      ? `- ${name}：${visibleDescription}。`
      : `- ${name}：画面中的主要人物，请根据其可见服装、位置、道具和气质识别，保持身份一致。`;
  }

  if (asset.type === "scene") {
    return visibleDescription
      ? `- 场景-${name}：${visibleDescription}。`
      : `- 场景-${name}：画面中的主要场景，保持空间、光源和时代背景一致。`;
  }

  if (asset.type === "tool") {
    return visibleDescription ? `- 道具-${name}：${visibleDescription}。` : `- 道具-${name}：画面中的关键道具，位置和形态保持一致。`;
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

export function isLtx23FourGridModel(model?: string) {
  const value = String(model || "").toLowerCase();
  return value.includes("comfyui_ltx23_fourgrid") || value.includes("ltx23-fourgrid-video") || value.includes("ltx2.3") && value.includes("fourgrid");
}

export function buildLtx23FourGridPrompt(params: {
  assets: AssetLike[];
  storyboard: StoryboardLike[];
  duration?: number | string | null;
}) {
  const storyboard = params.storyboard || [];
  const assets = uniqueAssets(params.assets || []);
  const duration = Number(params.duration || storyboard[0]?.duration || 12) || 12;

  const roleAnchors = assets.filter((item) => item.type === "role").map(buildAssetAnchor).filter(Boolean);
  const sceneAnchors = assets.filter((item) => item.type === "scene").map(buildAssetAnchor).filter(Boolean);
  const toolAnchors = assets.filter((item) => item.type === "tool").map(buildAssetAnchor).filter(Boolean);

  const storyIntent = storyboard
    .map((item, index) => {
      const desc = cleanText(item.videoDesc || item.prompt || "");
      if (!desc) return "";
      return storyboard.length > 1 ? `${index + 1}. ${desc}` : desc;
    })
    .filter(Boolean)
    .join("；");

  const anchorLines = [...roleAnchors, ...sceneAnchors, ...toolAnchors];

  return [
    `古风短剧，写实电影感。根据四宫格图片顺序生成 ${duration} 秒剧情视频。`,
    "保持人物身份、人物外貌、服装、场景、道具、光源一致。",
    anchorLines.length ? `人物/场景/道具锚点：\n${anchorLines.join("\n")}` : "人物锚点：请根据四宫格中可见的服装、位置、道具和气质区分不同人物，保持谁是谁不变。",
    `剧情重点：${storyIntent || "严格跟随四宫格画面内容，让人物完成一段克制、连贯的剧情动作。"}`,
    "动作要求：小幅度动作，眼神、转头、手部动作、衣袖轻动为主，不要大幅打斗，不要夸张表演。",
    "镜头要求：稳定镜头，轻微推进，真实电视剧质感，不要乱切、乱转、乱变焦。",
    "禁止：字幕、文字、水印、现代物品、突然换脸、突然换衣服、突然换场景、额外人物。",
  ].join("\n");
}
