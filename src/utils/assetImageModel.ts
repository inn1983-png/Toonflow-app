import { getModelList } from "@/utils/vendor";

const DERIVE_IMAGE_MODEL_NAME = "comfyui-derive-image";
const STORYBOARD_IMAGE_MODEL_NAME = "comfyui-storyboard-image";
const ASSET_IMAGE_MODEL_BY_TYPE: Record<string, string> = {
  role: "comfyui-role-image",
  scene: "comfyui-scene-image",
  tool: "comfyui-tool-image",
};

type AssetLike = {
  assetsId?: number | null;
  type?: string | null;
};

function splitModelKey(modelKey: string | null | undefined) {
  const [vendorId, modelName] = String(modelKey || "").split(/:(.+)/);
  return { vendorId, modelName };
}

export function isDerivativeAsset(asset: AssetLike) {
  return asset.assetsId !== undefined && asset.assetsId !== null;
}

export async function resolveImageModelForAsset(modelKey: string | null | undefined, asset: AssetLike) {
  const fallback = String(modelKey || "");
  const { vendorId, modelName } = splitModelKey(fallback);
  if (!vendorId || !modelName) return fallback;

  try {
    const models = await getModelList(vendorId);
    const imageModelNames = new Set(models.filter((model: any) => model?.type === "image").map((model: any) => model?.modelName));
    const targetModelName = isDerivativeAsset(asset) ? DERIVE_IMAGE_MODEL_NAME : ASSET_IMAGE_MODEL_BY_TYPE[String(asset.type || "")];
    return targetModelName && imageModelNames.has(targetModelName) ? `${vendorId}:${targetModelName}` : fallback;
  } catch {
    return fallback;
  }
}

export async function resolveImageModelForStoryboard(modelKey: string | null | undefined) {
  const fallback = String(modelKey || "");
  const { vendorId, modelName } = splitModelKey(fallback);
  if (!vendorId || !modelName) return fallback;

  try {
    const models = await getModelList(vendorId);
    const imageModelNames = new Set(models.filter((model: any) => model?.type === "image").map((model: any) => model?.modelName));
    return imageModelNames.has(STORYBOARD_IMAGE_MODEL_NAME) ? `${vendorId}:${STORYBOARD_IMAGE_MODEL_NAME}` : fallback;
  } catch {
    return fallback;
  }
}

export function isDeriveImageModel(modelKey: string | null | undefined) {
  return splitModelKey(modelKey).modelName === DERIVE_IMAGE_MODEL_NAME;
}
