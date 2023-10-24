const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const activeOscillators = {}
const waveformSelector = document.querySelector("#waveform")
const getSelectedWaveform = () => waveformSelector.value
waveformSelector.addEventListener("change", function() {
    selectedWaveform = getSelectedWaveform();
});

let selectedWaveform = getSelectedWaveform()

const createOscillatorNode = frequency => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = selectedWaveform
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.02)

    oscillator.start()
    return {oscillator, gainNode}
}

const playSound = frequency => {
    if (!activeOscillators[frequency]) {
        activeOscillators[frequency] = createOscillatorNode(frequency)
    }
}


const stopSound = frequency => {
    if (activeOscillators[frequency]) {
        const {oscillator, gainNode} = activeOscillators[frequency]

        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.02)

        oscillator.stop(audioContext.currentTime + 0.02)
        delete activeOscillators[frequency]
    }
}

const setupButtonListeners = () => {
    const noteButtons = document.querySelector(".note")
    noteButtons.forEach((button, index) => {
        const frequency = 220 * 2 ** (index/12)
        button.addEventListener("mousedown", () => playSound(frequency))
        button.addEventListener("mouseup", () => stopSound(frequency))
        button.addEventListener("mouseleave", () => stopSound(frequency))

    })
}

setupButtonListeners()