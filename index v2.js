// laver min audiocontext - audioContext bruges til at skabe og spille al lyd fra en hjemmeside. Den bruger nodes til at fungere.
let audioContext;
window.onload = function () {
    audioContext = new (window.AudioContext)
}

const activeOscillators = {}

// hiver fat i mine waveforms, som bruges til at ændre lydbølgen der bliver afspillet
const waveformSelector = document.querySelector("#waveform")
const getSelectedWaveform = () => waveformSelector.value
let selectedWaveform = getSelectedWaveform()

// laver en eventListener med typen "change", som gør at når man vælger fra dropdown menu'en, at min selectedWaveform bliver ændret.
waveformSelector.addEventListener("change", function() {
    selectedWaveform = getSelectedWaveform();
});


// laver en node. Den har to dele, værende oscilattor og gainNode. Oscillator er den lydbølge den har, altså enten en sine-bølge eller en square-bølge osv. GainNode'et har med gain (volume) at gøre.
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

// essentially - hvis lyd != true, så lav en node med lyd.
const playSound = frequency => {
    if (!activeOscillators[frequency]) {
        activeOscillators[frequency] = createOscillatorNode(frequency)
    }
}

// hvis lyd = true, slet den aktive oscillator. Hvis if-statement er true, så tager den activeOscillator og bryder den i to stykker, værende oscillator og gainNode. gainNode'ets gain (volume) bliver derefter frosset, og skruet lineært ned. Herefter bliver det slettet.
const stopSound = frequency => {
    if (activeOscillators[frequency]) {
        const {oscillator, gainNode} = activeOscillators[frequency]

        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.02)

        oscillator.stop(audioContext.currentTime + 0.02)
        delete activeOscillators[frequency]
    }
}
// opsætning af hvordan man spiller synth'en - mousedown betyder at klikke og holde musen nede, mouseup betyder du stopper med at klikke, mouseleave betyder du fjerner musen.
const setupButtonListeners = () => {
    const noteButtons = document.querySelectorAll(".note")
    noteButtons.forEach((button, index) => {
        const frequency = 220 * 2 ** (index/12)
        button.addEventListener("mousedown", () => playSound(frequency))
        button.addEventListener("mouseup", () => stopSound(frequency))
        button.addEventListener("mouseleave", () => stopSound(frequency))

    })
}
// kører funktionen
setupButtonListeners()

// setup for visning af spillemetode.
document.onreadystatechange = function() {
    if (document.readyState === "complete") {
        alert("To play the synth, click and hold on any of the buttons.");
    }
}