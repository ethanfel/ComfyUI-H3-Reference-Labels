import { app } from "../../scripts/app.js";

const NODE_NAME = "MiniMaxH3ReferenceToVideo";

function numberedInputs(node, prefix) {
    return (node.inputs || [])
        .filter((input) => input.name?.startsWith(prefix))
        .sort((a, b) => Number(a.name.slice(prefix.length)) - Number(b.name.slice(prefix.length)));
}

function isConnected(input) {
    return input?.link != null;
}

function labelReferences(inputs, kind) {
    let number = 1;
    for (const input of inputs) {
        input.label = `${kind}_${number}`;
        if (isConnected(input)) number++;
    }
}

function updateLabels(node) {
    const pictures = numberedInputs(node, "ref_image_");
    const videos = numberedInputs(node, "ref_video_").filter((input) => !input.name.startsWith("ref_video_audio_"));
    const videoAudio = numberedInputs(node, "ref_video_audio_");
    const audio = numberedInputs(node, "ref_audio_");

    labelReferences(pictures, "Picture");
    labelReferences(videos, "Video");

    const videoNumbers = new Map();
    let videoNumber = 1;
    for (const input of videos) {
        const suffix = input.name.slice("ref_video_".length);
        videoNumbers.set(suffix, videoNumber);
        if (isConnected(input)) videoNumber++;
    }

    let audioNumber = 1;
    for (const input of videoAudio) {
        const suffix = input.name.slice("ref_video_audio_".length);
        const video = videos.find((item) => item.name === `ref_video_${suffix}`);
        const paired = isConnected(video) && isConnected(input);
        input.label = `Audio_${audioNumber} (Video_${videoNumbers.get(suffix) ?? Number(suffix) + 1})`;
        if (paired) audioNumber++;
    }

    for (const input of audio) {
        input.label = `Audio_${audioNumber}`;
        if (isConnected(input)) audioNumber++;
    }

    app.graph?.setDirtyCanvas(true, false);
}

function queueLabelUpdate(node) {
    queueMicrotask(() => updateLabels(node));
}

app.registerExtension({
    name: "h3.reference_labels",

    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== NODE_NAME) return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = onNodeCreated?.apply(this, arguments);
            queueLabelUpdate(this);
            return result;
        };

        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            const result = onConfigure?.apply(this, arguments);
            queueLabelUpdate(this);
            return result;
        };

        const onConnectionsChange = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function () {
            const result = onConnectionsChange?.apply(this, arguments);
            queueLabelUpdate(this);
            return result;
        };
    },
});
