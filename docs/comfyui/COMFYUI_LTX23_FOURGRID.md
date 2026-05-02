# ComfyUI LTX2.3 四宫格视频接入说明

本目录提供 `comfyui_ltx23_fourgrid_vendor.ts`，用于把 Toonflow 的视频生成节点接到本地 ComfyUI LTX2.3 四宫格图生视频工作流。

## 适配的上传工作流

上传的工作流《AI代码侠土豆-LTX-2.3 图生视频（四宫格剧情版）》关键节点如下：

| 作用 | 节点 ID | 节点类型 |
| --- | ---: | --- |
| 四宫格参考图输入 | 88 | LoadImage |
| 用户视频提示词 | 158 | Text Multiline |
| 负向提示词 | 7 | CLIPTextEncode |
| 视频时长，秒 | 165 | INTConstant |
| FPS | 3 | PrimitiveFloat |
| 最终 MP4 输出 | 82 | VHS_VideoCombine |

该工作流会把 Toonflow 传入的 1 张四宫格分镜图自动切成 4 张图，再按四帧顺序驱动 LTX2.3 生成视频。

## 使用步骤

1. 启动 ComfyUI，确认地址通常是 `http://127.0.0.1:8188`。
2. 在 Toonflow 设置中心新增供应商，粘贴 `comfyui_ltx23_fourgrid_vendor.ts` 的完整内容。
3. 在供应商配置里：
   - `baseUrl` 填 ComfyUI 地址。
   - `videoWorkflow` 粘贴 LTX2.3 四宫格视频工作流 JSON。
   - 其他节点 ID 默认保持不变。
4. 到项目设置/模型配置里，把视频模型选择为 `ComfyUI LTX2.3 四宫格视频`。
5. 生成视频时，只给视频节点选择 1 张四宫格分镜图作为参考图。

## 注意

- 这个供应商只处理视频生成，不处理图片生成、文本模型、TTS。
- 当前方案不强制要求把 ComfyUI 工作流另存为 API 格式；供应商内部会把普通 UI workflow 转成 API workflow。
- 如果 ComfyUI 端缺少节点包，需要先安装：ComfyUI-LTXVideo、VideoHelperSuite、KJNodes、ComfyUI Essentials、Goohai tools、AICoderTudou 相关节点。
