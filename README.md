# H3 Reference Labels

Displays MiniMax H3 reference inputs using the names used in H3 prompts:

- `ref_image_0` as `Picture_1`
- `ref_video_0` as `Video_1`
- reference audio as `Audio_1`

Only the visible labels change. The official node's internal input names and saved workflow compatibility are preserved. Audio labels account for connected reference-video soundtracks, which share H3's audio numbering with standalone audio references.

## Install

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/ethanfel/ComfyUI-H3-Reference-Labels.git
```

Restart ComfyUI and refresh the browser. The labels are applied automatically to the official `MiniMaxH3ReferenceToVideo` node; this pack does not add a separate node.
