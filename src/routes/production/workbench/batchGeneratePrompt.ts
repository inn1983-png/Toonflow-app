import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { buildLtx23FourGridPrompt, isLtx23FourGridModel } from "@/utils/ltx23FourGridPrompt";
const router = express.Router();

export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
    trackData: z.array(
      z.object({
        trackId: z.number(),
        info: z.array(
          z.object({
            id: z.number(),
            sources: z.string(),
          }),
        ),
      }),
    ),
    model: z.string(),
  }),
  async (req, res) => {
    const { projectId, trackData, model } = req.body;

    async function appendStoryboardAssociatedAssets(assets: any[], storyboard: any[]) {
      const existingAssetIds = new Set(assets.map((item) => item.id).filter(Boolean));
      const associateAssetIds = [
        ...new Set(
          storyboard
            .flatMap((item) => item.associateAssetsIds || [])
            .filter((id) => id != null && !existingAssetIds.has(id)),
        ),
      ];

      if (!associateAssetIds.length) return assets;

      const rows = await u
        .db("o_assets")
        .leftJoin("o_image", "o_image.id", "o_assets.imageId")
        .whereIn("o_assets.id", associateAssetIds)
        .select("o_assets.id", "o_assets.type", "o_assets.name", "o_assets.prompt", "o_assets.describe", "o_image.filePath");

      for (const row of rows) {
        assets.push({
          id: row.id,
          type: row.type,
          name: row.name,
          prompt: row.prompt,
          describe: row.describe,
          filePath: row.filePath,
        });
      }

      return assets;
    }

    async function buildData(info: Array<{ id: number; sources: string }>) {
      const images = await Promise.all(
        info.map(async (item: { id: number; sources: string }) => {
          if (item.sources === "storyboard") {
            // 查询分镜主信息
            const storyboard = await u
              .db("o_storyboard")
              .where("o_storyboard.id", item.id)
              .select("videoDesc", "prompt", "track", "duration", "shouldGenerateImage")
              .first();
            // 查询分镜关联的资产ID
            const assetRows = await u.db("o_assets2Storyboard").where("storyboardId", item.id).orderBy("rowid").select("assetId");
            const associateAssetsIds = assetRows.map((row: any) => row.assetId);
            return {
              ...storyboard,
              associateAssetsIds,
              _type: "storyboard", // 标记类型，便于后续区分
            };
          }
          if (item.sources === "assets") {
            // 查询素材
            const assetsData = await u
              .db("o_assets")
              .leftJoin("o_image", "o_image.id", "o_assets.imageId")
              .where("o_assets.id", item.id)
              .select("o_assets.id", "o_assets.type", "o_assets.name", "o_assets.prompt", "o_assets.describe", "o_image.filePath")
              .first();
            return {
              ...assetsData,
              _type: "assets", // 标记类型
            };
          }
        }),
      );

      // 拆分 assets 和 storyboard
      const assets: any[] = [];
      const storyboard: any[] = [];
      for (const item of images) {
        if (!item) continue; // 忽略空
        if (item._type === "assets")
          assets.push({
            id: item.id,
            type: item.type,
            name: item.name,
            prompt: item.prompt,
            describe: item.describe,
            filePath: item.filePath,
          });
        if (item._type === "storyboard")
          storyboard.push({
            videoDesc: item.videoDesc,
            prompt: item.prompt,
            track: item.track,
            duration: item.duration,
            associateAssetsIds: item.associateAssetsIds,
            shouldGenerateImage: item.shouldGenerateImage,
          });
      }
      await appendStoryboardAssociatedAssets(assets, storyboard);
      return { assets, storyboard };
    }

    try {
      if (isLtx23FourGridModel(model)) {
        const result = [];
        for (const item of trackData) {
          const { assets, storyboard } = await buildData(item.info);
          const text = buildLtx23FourGridPrompt({
            assets,
            storyboard,
            duration: storyboard[0]?.duration,
          });
          await u.db("o_videoTrack").where({ id: item.trackId }).update({
            prompt: text,
          });
          result.push({ trackId: item.trackId, prompt: text });
        }
        return res.status(200).send(success(result));
      }

      const [id, modelData] = model.split(/:(.+)/);
      const projectData = await u.db("o_project").select("*").where({ id: projectId }).first();
      const videoPrompt = await u.db("o_prompt").where("type", "videoPromptGeneration").first();
      let videoPromptGeneration = "" as string | undefined;
      if (videoPrompt && videoPrompt.useData) {
        videoPromptGeneration = videoPrompt.useData;
      } else {
        videoPromptGeneration = videoPrompt?.data ?? undefined;
      }
      const artStyle = projectData?.artStyle || "无";
      const visualManual = u.getArtPrompt(artStyle, "art_skills", "art_storyboard_video");
      const result = [];

      for (const item of trackData) {
        const { assets, storyboard } = await buildData(item.info);
        const content = `
          **模型名称**：${modelData},
          **资产信息**（角色、场景、道具、音频):${assets
            .filter((i) => i.filePath)
            .map((i) => `[${i.id},${i.type},${i.name} ${i.prompt ? `prompt:${i.prompt}` : ""} ${i.describe ? `describe:${i.describe}` : ""}]`)
            .join("，")},
          **分镜信息**：${storyboard.map(
            (i) => `<storyboardItem
  videoDesc='${i.videoDesc}'
  duration='${i.duration}'
></storyboardItem>`,
          )},
          `;

        const { text } = await u.Ai.Text("universalAi").invoke({
          system: videoPromptGeneration,
          messages: [
            {
              role: "assistant",
              content: `${visualManual}`,
            },
            {
              role: "user",
              content: content,
            },
          ],
        });
        await u.db("o_videoTrack").where({ id: item.trackId }).update({
          prompt: text,
        });
        result.push({ trackId: item.trackId, prompt: text });
      }
      res.status(200).send(success(result));
    } catch (e) {
      res.status(400).send(error(u.error(e).message));
    }
  },
);
