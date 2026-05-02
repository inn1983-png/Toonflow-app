# LTX2.3 四宫格剧情视频提示词写法

这个工作流已经内置“看四宫格图片 + 根据提示词反推 JSON 视频提示词”的逻辑。

所以 Toonflow 不应该再传复杂 JSON，也不应该把四帧拆成完整 JSON。Toonflow 只需要传一段**简单、清楚、克制的剧情/动作提示词**，让工作流内部的反推节点去生成最终 JSON。

---

## 正确理解

```text
Toonflow 传入：四宫格图片 + 简单剧情提示
        ↓
工作流内部：视觉理解四宫格图片
        ↓
工作流内部：反推出 JSON 格式视频控制提示词
        ↓
LTX2.3：根据反推结果生成视频
```

所以 Toonflow 这边的提示词目标不是“写完整视频 JSON”，而是给反推节点一个清楚的剧情方向。

---

## Toonflow 应该传什么

推荐格式：

```text
古风短剧，写实电影感。
请根据四宫格图片顺序生成 12 秒剧情视频。
人物保持同一身份、同一服装、同一场景、同一光源。
剧情重点：张捕头站在昏暗衙门里，先压着怒气听完对方羞辱，随后抬眼冷笑，缓慢握紧腰牌，最后转身离开，情绪从隐忍到决绝。
动作要求：小幅度动作，眼神、转头、握手、衣袖轻动为主，不要大幅打斗。
镜头要求：稳定镜头，轻微推进，真实电视剧质感。
禁止：字幕、文字、水印、现代物品、突然换脸、突然换衣服、突然换场景、额外人物。
```

---

## 更短的通用模板

```text
古风短剧，写实电影感。根据四宫格图片顺序生成 12 秒剧情视频。
保持人物身份、服装、场景、光源一致。
剧情重点：[这里写这一段视频要表达的剧情动作和情绪变化]
动作以眼神、转头、手部动作、衣袖轻动为主，不要大幅动作。
镜头稳定，轻微推进，不要字幕、文字、水印，不要换脸、换衣服、换场景、额外人物。
```

---

## 不推荐写法

不要传这种复杂 JSON：

```json
{
  "shot_1": {},
  "shot_2": {},
  "shot_3": {},
  "shot_4": {}
}
```

原因：这个工作流自己已经会反推 JSON，外部再塞 JSON 容易造成两层指令冲突。

也不要只写一句太空的：

```text
让人物动起来，生成一个古风视频。
```

原因：剧情方向太弱，反推节点不知道动作和情绪重点。

---

## 最适合 Toonflow 自动拼接的提示词结构

Toonflow 视频节点的 `prompt` 建议由这几部分组成：

```text
风格：古风短剧，写实电影感。
任务：根据四宫格图片顺序生成 12 秒剧情视频。
连续性：人物身份、服装、场景、光源保持一致。
剧情重点：[分镜视频描述]
动作限制：小动作，眼神、转头、手部、衣袖轻动为主。
镜头限制：稳定镜头，轻微推进，不要乱切、乱转、乱变焦。
禁止内容：字幕、文字、水印、现代物品、换脸、换衣服、换场景、额外人物。
```

---

## 关键规则

1. 不要给 JSON。
2. 不要逐帧写太复杂。
3. 要写清楚“这一段视频的剧情重点”。
4. 要限制动作为小动作。
5. 要强调不换脸、不换衣服、不换场景、不加人。
6. 视频阶段只传最终四宫格图，不要再传角色图、场景图、道具图。

---

## 古风短剧推荐负向词

```text
pc game, console game, video game, cartoon, anime, childish, 3d render, western face, modern clothes, modern objects, glasses, watch, zipper, plastic, electric light, phone, computer, subtitles, captions, on-screen text, written text, Chinese characters, English text, watermark, logo, title overlay, UI text, random text, garbled text, extra people, duplicated face, identity change, face change, clothing change, scene change, melting, morphing, dissolve transition, camera shake, fast zoom, blurry, low quality, bad anatomy, extra limbs
```
