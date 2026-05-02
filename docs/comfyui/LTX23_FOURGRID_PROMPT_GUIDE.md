# LTX2.3 四宫格剧情视频提示词写法

这个工作流的核心不是普通图生视频提示词，而是把一张四宫格图当作 4 个关键帧：

```text
左上 = 第 1 帧
右上 = 第 2 帧
左下 = 第 3 帧
右下 = 第 4 帧
```

所以 Toonflow 传给 ComfyUI 的视频提示词，应该写成“4 帧导演指令”，不要只写一句：

```text
一个古代男人在房间里说话，镜头缓慢推进。
```

这种写法太散，LTX2.3 不知道四宫格每一格之间怎么动。

---

## 推荐结构

```json
{
  "video_type": "four_grid_story_video",
  "duration": "12s",
  "frame_order": "top_left -> top_right -> bottom_left -> bottom_right",
  "global_rules": {
    "style": "Chinese historical drama, realistic cinematic look, natural lighting, stable identity",
    "continuity": "same characters, same costumes, same scene, same light direction, no sudden identity change",
    "transition": "hard cut between the four keyframes, no dissolve, no morphing, no fantasy transition",
    "camera": "stable camera, slow cinematic movement, no extreme shake, no random zoom",
    "text_rule": "no subtitles, no captions, no written text, no watermark"
  },
  "shots": [
    {
      "frame": 1,
      "reference_position": "top_left",
      "duration": "0-3s",
      "camera": "medium shot, eye-level, slight push in",
      "action": "角色保持当前姿势，缓慢抬眼，情绪压抑",
      "dialogue_sync": "如果有台词，只做轻微口型，不夸张张嘴",
      "motion": "small head movement, subtle breathing, robe moves slightly"
    },
    {
      "frame": 2,
      "reference_position": "top_right",
      "duration": "3-6s",
      "camera": "medium close-up, stable framing",
      "action": "角色转头看向对方，表情变冷",
      "dialogue_sync": "mouth moves naturally as speaking",
      "motion": "slow turn, controlled facial expression, no extra body movement"
    },
    {
      "frame": 3,
      "reference_position": "bottom_left",
      "duration": "6-9s",
      "camera": "close-up, slight push in",
      "action": "角色握紧手，眼神坚定",
      "dialogue_sync": "short sentence, restrained lip movement",
      "motion": "hand tightens, sleeves move gently"
    },
    {
      "frame": 4,
      "reference_position": "bottom_right",
      "duration": "9-12s",
      "camera": "medium shot, hold final composition",
      "action": "角色做出最终决定，画面停在情绪最高点",
      "dialogue_sync": "final line ends before the last second",
      "motion": "slow pause, stable ending, no new characters"
    }
  ],
  "negative": "cartoon, anime, 3d render, game style, modern objects, subtitles, captions, watermark, logo, random text, extra people, identity change, face change, clothing change, scene change, camera shake, fast zoom, melting transition, morphing, blurry, low quality"
}
```

---

## Toonflow 自动生成时的简化模板

如果 Toonflow 只有一段 `prompt`，建议自动包装成下面格式：

```text
Use the uploaded four-grid storyboard image as four ordered keyframes.
Frame order: top-left -> top-right -> bottom-left -> bottom-right.
Generate a 12-second Chinese historical drama video.

Global rules:
- Keep the same characters, same faces, same costumes, same scene, same lighting.
- Follow the visual content of each grid strictly.
- Use hard cuts or very short natural motion between the four keyframes.
- No morphing, no dissolve, no fantasy transition, no random camera movement.
- No subtitles, no captions, no text, no watermark.

Shot 1, 0-3s, top-left:
[写第一格动作]
Camera: stable medium shot, slight push in.
Motion: subtle breathing, small eye movement, natural robe movement.

Shot 2, 3-6s, top-right:
[写第二格动作]
Camera: medium close-up, eye-level.
Motion: slow head turn, controlled facial expression.

Shot 3, 6-9s, bottom-left:
[写第三格动作]
Camera: close-up, slight push in.
Motion: hand movement, restrained body movement.

Shot 4, 9-12s, bottom-right:
[写第四格动作]
Camera: hold final composition.
Motion: slow pause, stable ending.

Story intent:
[原始 Toonflow 视频描述]
```

---

## 最重要的 5 条

1. 每格都要写清楚：动作、镜头、情绪。
2. 不要写大动作，LTX2.3 更适合小动作。
3. 不要让它自己补剧情，要让它严格跟四宫格。
4. 不要写“镜头快速移动、激烈打斗、复杂转场”。
5. 视频阶段不要再塞角色图、场景图、道具图；只塞最终四宫格图。

---

## 古风短剧推荐负向词

```text
pc game, console game, video game, cartoon, anime, childish, 3d render, western face, modern clothes, modern objects, glasses, watch, zipper, plastic, electric light, phone, computer, subtitles, captions, on-screen text, written text, Chinese characters, English text, watermark, logo, title overlay, UI text, random text, garbled text, extra people, duplicated face, identity change, face change, clothing change, scene change, melting, morphing, dissolve transition, camera shake, fast zoom, blurry, low quality, bad anatomy, extra limbs
```
