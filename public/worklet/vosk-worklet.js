// /worklet/vosk-worklet.js
class VoskWorklet extends AudioWorkletProcessor {
	constructor() {
		super();
		this.port.onmessage = () => {};
	}
	process(inputs) {
		this.port.postMessage(inputs[0][0]); // Float32Array (mono)
		return true;
	}
}
registerProcessor("vosk-worklet", VoskWorklet);
